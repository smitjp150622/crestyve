import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyPaymentSignature, verifyWebhookSignature } from "./razorpay";

describe("verifyPaymentSignature", () => {
  const keySecret = "test_secret";
  const orderId = "order_ABC123";
  const paymentId = "pay_XYZ789";

  function sign(orderId: string, paymentId: string, secret: string) {
    return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  }

  it("returns true for a valid signature", () => {
    const signature = sign(orderId, paymentId, keySecret);
    expect(verifyPaymentSignature({ orderId, paymentId, signature, keySecret })).toBe(true);
  });

  it("returns false for a tampered signature", () => {
    const signature = sign(orderId, paymentId, keySecret);
    const tampered = signature.slice(0, -1) + (signature.endsWith("a") ? "b" : "a");
    expect(verifyPaymentSignature({ orderId, paymentId, signature: tampered, keySecret })).toBe(false);
  });

  it("returns false when using the wrong secret", () => {
    const signature = sign(orderId, paymentId, "wrong_secret");
    expect(verifyPaymentSignature({ orderId, paymentId, signature, keySecret })).toBe(false);
  });

  it("returns false for a signature of different length", () => {
    expect(
      verifyPaymentSignature({ orderId, paymentId, signature: "short", keySecret })
    ).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  const webhookSecret = "webhook_secret";
  const rawBody = JSON.stringify({ event: "payment.captured" });

  it("returns true for a valid signature", () => {
    const signature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    expect(verifyWebhookSignature({ rawBody, signature, webhookSecret })).toBe(true);
  });

  it("returns false for an invalid signature", () => {
    expect(
      verifyWebhookSignature({ rawBody, signature: "0".repeat(64), webhookSecret })
    ).toBe(false);
  });

  it("returns false if the body was tampered with", () => {
    const signature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    const tamperedBody = JSON.stringify({ event: "payment.failed" });
    expect(
      verifyWebhookSignature({ rawBody: tamperedBody, signature, webhookSecret })
    ).toBe(false);
  });
});
