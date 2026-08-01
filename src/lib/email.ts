import { Resend } from "resend";
import { formatInr } from "@/lib/money";

interface OrderConfirmationInput {
  to: string;
  orderNumber: string;
  customerName: string;
  items: { name: string; size: string | null; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function toPaise(rupees: number) {
  return Math.round(rupees * 100);
}

/**
 * Sends an order confirmation email via Resend. This is best-effort: if
 * RESEND_API_KEY is not configured, or the send fails, we log and continue
 * rather than fail the checkout/payment flow.
 */
export async function sendOrderConfirmationEmail(input: OrderConfirmationInput) {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;
  if (!client || !from) {
    console.info(`[email] Skipping order confirmation for ${input.orderNumber} (Resend not configured)`);
    return { sent: false };
  }

  const rows = input.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.name}${item.size ? ` (Size ${item.size})` : ""} × ${item.qty}</td><td style="padding:8px 0;text-align:right;">${formatInr(toPaise(item.price * item.qty))}</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <h2 style="font-family:Georgia,serif;font-weight:400;">Thank you for your order, ${input.customerName}!</h2>
      <p>Your order <strong>${input.orderNumber}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tbody>${rows}</tbody>
      </table>
      <table style="width:100%;margin-top:12px;border-top:1px solid #eee;padding-top:12px;">
        <tr><td>Subtotal</td><td style="text-align:right;">${formatInr(toPaise(input.subtotal))}</td></tr>
        ${input.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${formatInr(toPaise(input.discount))}</td></tr>` : ""}
        <tr><td>Shipping</td><td style="text-align:right;">${input.shipping > 0 ? formatInr(toPaise(input.shipping)) : "Free"}</td></tr>
        <tr><td style="font-weight:600;padding-top:8px;">Total</td><td style="text-align:right;font-weight:600;padding-top:8px;">${formatInr(toPaise(input.total))}</td></tr>
      </table>
      <p style="margin-top:24px;color:#666;font-size:13px;">We'll notify you again once your order ships.</p>
    </div>
  `;

  try {
    await client.emails.send({
      from,
      to: input.to,
      subject: `Order Confirmed — ${input.orderNumber}`,
      html,
    });
    return { sent: true };
  } catch (error) {
    console.error(`[email] Failed to send order confirmation for ${input.orderNumber}:`, error);
    return { sent: false };
  }
}
