import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { orders } from "@/lib/repositories/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured; rejecting webhook");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const isValid = verifyWebhookSignature({ rawBody, signature, webhookSecret });
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const paymentEntity = body.payload?.payment?.entity;
    const eventId =
      request.headers.get("x-razorpay-event-id") ??
      `${body.event}:${paymentEntity?.id ?? "unknown"}`;

    if (body.event !== "payment.captured" && body.event !== "order.paid") {
      await orders.recordPaymentEvent(eventId, null, body);
      return NextResponse.json({ received: true, processed: false });
    }

    if (!paymentEntity?.order_id || !paymentEntity?.id) {
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    const result = await orders.processWebhookPayment({
      providerEventId: eventId,
      razorpayOrderId: paymentEntity.order_id,
      razorpayPaymentId: paymentEntity.id,
      payload: body,
    });

    if (!result.ok) {
      console.error(`Webhook: order not found for razorpay order ${paymentEntity.order_id}`);
      return NextResponse.json({ received: true, processed: false });
    }

    if (result.duplicate) {
      return NextResponse.json({ received: true, processed: false, duplicate: true });
    }

    if (!result.alreadyProcessed && result.order) {
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

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("Failed to process Razorpay webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
