import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentSchema } from "@/lib/validations/checkout";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { orders } from "@/lib/repositories/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      keySecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const result = await orders.markPaidIfPending(razorpay_order_id, razorpay_payment_id);
    if (!result.ok) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!result.alreadyProcessed) {
      void sendOrderConfirmationEmail({
        to: result.order.email,
        orderNumber: result.order.orderNumber,
        customerName: result.order.customerName,
        items: result.order.items.map((i) => ({
          name: i.name,
          size: i.size,
          qty: i.qty,
          price: i.price,
        })),
        subtotal: result.order.subtotal,
        discount: result.order.discount,
        shipping: result.order.shipping,
        total: result.order.total,
      });
    }

    return NextResponse.json({ success: true, orderNumber: result.order.orderNumber });
  } catch (error) {
    console.error("Failed to verify payment:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
