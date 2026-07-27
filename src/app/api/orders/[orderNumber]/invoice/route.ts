import { NextRequest, NextResponse } from "next/server";
import { orders } from "@/lib/repositories/orders";
import { auth } from "@/lib/auth";

function invoiceHtml(order: NonNullable<Awaited<ReturnType<typeof orders.findByOrderNumber>>>) {
  const address = order.shippingAddress as {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };

  const rows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}${item.size ? ` (${item.size})` : ""}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${item.price.toLocaleString("en-IN")}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹${(item.price * item.qty).toLocaleString("en-IN")}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${order.orderNumber}</title>
  <style>
    body { font-family: Georgia, serif; color: #111; max-width: 720px; margin: 40px auto; padding: 0 20px; }
    h1 { font-weight: 400; letter-spacing: 0.08em; }
    .muted { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 2px solid #111; padding: 8px; }
    .totals { margin-top: 24px; float: right; width: 240px; }
    .totals div { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
    .total { font-size: 18px; border-top: 1px solid #111; padding-top: 8px; margin-top: 8px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <button class="no-print" onclick="window.print()" style="margin-bottom:24px;padding:8px 16px;cursor:pointer;">Print / Save PDF</button>
  <h1>CRESTYVE</h1>
  <p class="muted">Invoice · ${order.orderNumber}</p>
  <p class="muted">Payment: ${order.paymentStatus} · Status: ${order.status}</p>
  <p class="muted">Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>

  <div style="margin-top:24px;">
    <strong>Bill To</strong><br/>
    ${order.customerName}<br/>
    ${order.email}<br/>
    ${order.phone}<br/>
    ${address.line1}${address.line2 ? `, ${address.line2}` : ""}<br/>
    ${address.city}, ${address.state} ${address.pincode}<br/>
    ${address.country}
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>₹${order.subtotal.toLocaleString("en-IN")}</span></div>
    ${order.discount > 0 ? `<div><span>Discount</span><span>-₹${order.discount.toLocaleString("en-IN")}</span></div>` : ""}
    <div><span>Shipping</span><span>${order.shipping > 0 ? `₹${order.shipping.toLocaleString("en-IN")}` : "Free"}</span></div>
    <div class="total"><span>Total</span><span>₹${order.total.toLocaleString("en-IN")}</span></div>
  </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const order = await orders.findByOrderNumber(orderNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    const isAdmin = role === "ADMIN";
    const email = request.nextUrl.searchParams.get("email");
    const guestOk = !!email && email.toLowerCase() === order.email.toLowerCase();

    if (!isAdmin && !guestOk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return new NextResponse(invoiceHtml(order), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate invoice:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
