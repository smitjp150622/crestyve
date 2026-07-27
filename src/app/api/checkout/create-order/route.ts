import { NextRequest, NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validations/checkout";
import { products } from "@/lib/repositories/products";
import { orders } from "@/lib/repositories/orders";
import { coupons } from "@/lib/repositories/coupons";
import { settings } from "@/lib/repositories/settings";
import { computeOrderTotals } from "@/lib/orders/totals";
import { createRazorpayOrder } from "@/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const productRows = await products.findManyForCheckout(data.items.map((i) => i.productId));
    const productMap = new Map(productRows.map((p) => [p.id, p]));

    const orderItems: {
      productId: string | null;
      name: string;
      pricePaise: number;
      size: string | null;
      qty: number;
      image: string | null;
    }[] = [];

    for (const line of data.items) {
      const product = productMap.get(line.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${line.productId}` },
          { status: 400 }
        );
      }
      if (!product.available) {
        return NextResponse.json(
          { error: `"${product.name}" is currently unavailable` },
          { status: 400 }
        );
      }
      if (product.sizes.length > 0 && !line.size) {
        return NextResponse.json(
          { error: `Please select a size for "${product.name}"` },
          { status: 400 }
        );
      }
      if (line.size && product.sizes.length > 0 && !product.sizes.includes(line.size)) {
        return NextResponse.json(
          { error: `Invalid size "${line.size}" for "${product.name}"` },
          { status: 400 }
        );
      }

      if (line.size) {
        const sizeStock = product.sizeStocks.find((s) => s.size === line.size);
        if (sizeStock && sizeStock.stock < line.qty) {
          return NextResponse.json(
            { error: `Only ${sizeStock.stock} left in size ${line.size} for "${product.name}"` },
            { status: 409 }
          );
        }
      }
      if (product.stock != null && product.stock < line.qty) {
        return NextResponse.json(
          { error: `Only ${product.stock} left in stock for "${product.name}"` },
          { status: 409 }
        );
      }

      orderItems.push({
        productId: product.id,
        name: product.name,
        pricePaise: product.pricePaise,
        size: line.size ?? null,
        qty: line.qty,
        image: product.images[0] ?? null,
      });
    }

    const subtotalPaise = orderItems.reduce((sum, item) => sum + item.pricePaise * item.qty, 0);

    let discountPaise = 0;
    let couponId: string | null = null;
    if (data.couponCode) {
      const result = await coupons.validate(data.couponCode, subtotalPaise);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      discountPaise = result.discountPaise;
      couponId = result.coupon.id;
    }

    const siteSettings = await settings.get();
    const totals = computeOrderTotals({
      subtotalPaise,
      discountPaise,
      shippingPaise: siteSettings.shippingPaise ?? 0,
    });

    const order = await orders.createPending({
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      shippingAddress: data.shippingAddress,
      items: orderItems,
      subtotalPaise: totals.subtotalPaise,
      discountPaise: totals.discountPaise,
      shippingPaise: totals.shippingPaise,
      totalPaise: totals.totalPaise,
      couponId,
    });

    if (totals.totalPaise <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than zero" },
        { status: 400 }
      );
    }

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: totals.totalPaise,
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });

    await orders.setRazorpayOrderId(order.id, razorpayOrder.id);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: totals.totalPaise,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
    });
  } catch (error) {
    console.error("Failed to create checkout order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
