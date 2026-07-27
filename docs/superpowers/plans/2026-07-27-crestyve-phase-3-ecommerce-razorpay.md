# Crestyve Phase 3 — Cart, Checkout, Razorpay & Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship dual purchase Option B — client cart, checkout, Razorpay payments, durable orders, stock decrement on paid webhook, invoices, optional Resend email, and admin order management.

**Architecture:** LocalStorage cart; checkout API recomputes totals from Prisma; creates `Order` + Razorpay order; webhook is source of truth for `PAID` + stock decrement + coupon usage; success page + invoice PDF/HTML; admin orders UI. Guest checkout with optional post-order account linking.

**Tech Stack:** Razorpay Node SDK, Prisma transactions, Resend (optional), jsPDF or HTML invoice print, Zustand or React context for cart

**Depends on:** Phase 1 + Phase 2 complete

**Spec:** `docs/superpowers/specs/2026-07-27-crestyve-production-architecture-design.md`

## Global Constraints

- Never trust client prices or totals — always reload products from DB.
- Decrement stock **only** on verified paid webhook (or verified payment signature handler that is idempotent with `PaymentEvent`).
- Currency: INR; Razorpay amounts in **paise**.
- Flat shipping from `SiteSettings.shippingPaise`.
- Guest checkout; optional account after success.
- Test mode keys first; webhook URL must be publicly reachable (Vercel).

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/lib/cart-types.ts` | Cart item types |
| `src/components/cart/cart-provider.tsx` | localStorage cart context |
| `src/lib/orders.ts` | orderNumber gen, create order, apply payment |
| `src/lib/razorpay.ts` | Razorpay client + signature verify |
| `src/lib/email.ts` | Resend wrapper (no-op if unset) |
| `src/app/api/checkout/route.ts` | Create order + Razorpay order |
| `src/app/api/checkout/verify/route.ts` | Client-side verify helper (non-authoritative) |
| `src/app/api/webhooks/razorpay/route.ts` | Authoritative payment handler |
| `src/app/api/orders/[orderNumber]/route.ts` | Guest order lookup |
| `src/app/api/orders/[orderNumber]/invoice/route.ts` | Invoice HTML/PDF |
| `src/app/api/admin/orders/route.ts` | Admin list |
| `src/app/api/admin/orders/[id]/route.ts` | Admin status update |
| `src/app/(site)/cart/page.tsx` | Cart page |
| `src/app/(site)/checkout/page.tsx` | Checkout |
| `src/app/(site)/order/success/page.tsx` | Success + optional signup |
| `src/app/admin/orders/page.tsx` | Admin orders |
| Navbar cart badge | Link to cart |

---

### Task 1: Cart state (client)

**Files:**
- Create: `src/lib/cart-types.ts`
- Create: `src/components/cart/cart-provider.tsx`
- Modify: `src/components/providers.tsx` — wrap CartProvider
- Modify: `src/components/layout/navbar.tsx` — cart count link

**Interfaces:**
```ts
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceRupees: number; // display only; checkout recalculates
  image?: string;
  size?: string;
  qty: number;
};

// Cart API: addItem, removeItem, updateQty, clear, items, subtotalRupees
```

- [ ] **Step 1: Implement CartProvider** with `localStorage` key `crestyve_cart_v1`, persist on change, SSR-safe (`useEffect` hydrate).

- [ ] **Step 2: Add to cart from product page** — size required if `sizes.length > 0`.

- [ ] **Step 3: Cart page** listing items, qty controls, link to checkout.

- [ ] **Step 4: Commit**

```bash
git add src/lib/cart-types.ts src/components/cart src/components/providers.tsx src/components/layout/navbar.tsx src/app/(site)/cart
git commit -m "feat: client shopping cart with localStorage"
```

---

### Task 2: Razorpay + order helpers (TDD for pure functions)

**Files:**
- Create: `src/lib/razorpay.ts`
- Create: `src/lib/orders.ts`
- Create: `src/lib/orders.test.ts`
- Install: `razorpay` package

**Interfaces:**
- `generateOrderNumber(): string` — e.g. `CRY-YYYYMMDD-XXXX`
- `verifyRazorpaySignature({ orderId, paymentId, signature }): boolean`
- `markOrderPaid({ orderId, razorpayPaymentId, providerEventId, payload }): Promise<void>` — idempotent transaction

- [ ] **Step 1: Install**

```bash
npm install razorpay
npm install -D @types/razorpay
```

(If `@types/razorpay` missing, use `// @ts-expect-error` or local type.)

- [ ] **Step 2: Order number test**

```ts
import { describe, it, expect } from "vitest";
import { generateOrderNumber } from "./orders";

describe("generateOrderNumber", () => {
  it("matches CRY-date-suffix pattern", () => {
    const n = generateOrderNumber();
    expect(n).toMatch(/^CRY-\d{8}-[A-Z0-9]{4}$/);
  });
});
```

```ts
export function generateOrderNumber(now = new Date(), rand = () => Math.random()) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const suffix = Math.floor(rand() * 36 ** 4)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0");
  return `CRY-${y}${m}${d}-${suffix}`;
}
```

- [ ] **Step 3: Razorpay helpers**

```ts
import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpay() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === params.signature;
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
```

- [ ] **Step 4: `markOrderPaid` transactional logic**

```ts
export async function markOrderPaid(opts: {
  orderId: string;
  razorpayPaymentId: string;
  providerEventId: string;
  payload: unknown;
}) {
  const existing = await prisma.paymentEvent.findUnique({
    where: { providerEventId: opts.providerEventId },
  });
  if (existing) return { duplicate: true };

  await prisma.$transaction(async (tx) => {
    await tx.paymentEvent.create({
      data: {
        providerEventId: opts.providerEventId,
        orderId: opts.orderId,
        payload: opts.payload as object,
      },
    });

    const order = await tx.order.findUnique({
      where: { id: opts.orderId },
      include: { items: true, coupon: true },
    });
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.paymentStatus === "PAID") return;

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
        razorpayPaymentId: opts.razorpayPaymentId,
      },
    });

    for (const item of order.items) {
      if (!item.productId) continue;
      if (item.size) {
        await tx.productSizeStock.updateMany({
          where: { productId: item.productId, size: item.size },
          data: { stock: { decrement: item.qty } },
        });
      }
      await tx.product.updateMany({
        where: { id: item.productId, stock: { not: null } },
        data: { stock: { decrement: item.qty } },
      });
    }

    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  return { duplicate: false };
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/razorpay.ts src/lib/orders.ts src/lib/orders.test.ts package.json package-lock.json
git commit -m "feat: order helpers and Razorpay signature utilities"
```

---

### Task 3: Checkout API

**Files:**
- Create: `src/lib/validations/checkout.ts`
- Create: `src/app/api/checkout/route.ts`

**Interfaces:**
- Body: `{ items: { productId, size?, qty }[], customer, shippingAddress, couponCode? }`
- Response: `{ orderNumber, razorpayOrderId, amountPaise, keyId, currency: "INR" }`

- [ ] **Step 1: Zod schema for checkout**

Validate email, phone, address fields, items min 1, qty >= 1.

- [ ] **Step 2: Checkout handler algorithm**

1. Load each product; fail if missing/unavailable.
2. Check size stock or product stock; fail with 409 if insufficient.
3. Compute `subtotalPaise`; validate coupon via `coupons.validate`; compute shipping from settings.
4. `totalPaise = subtotal - discount + shipping`.
5. Create Order + OrderItems (`PENDING`).
6. `razorpay.orders.create({ amount: totalPaise, currency: "INR", receipt: orderNumber })`.
7. Save `razorpayOrderId` on order.
8. Return client payload.

- [ ] **Step 3: Manual test with Razorpay test keys** (create order only).

- [ ] **Step 4: Commit**

```bash
git add src/lib/validations/checkout.ts src/app/api/checkout/route.ts
git commit -m "feat: checkout API creates Order and Razorpay order"
```

---

### Task 4: Checkout UI + Razorpay.js

**Files:**
- Create: `src/app/(site)/checkout/page.tsx`
- Create: `src/components/checkout/checkout-form.tsx`
- Load Razorpay checkout.js script

- [ ] **Step 1: Checkout form** — customer name, email, phone, address lines, city, state, pincode; order summary; coupon field calling `/api/coupons/validate`.

- [ ] **Step 2: On submit** — POST `/api/checkout` with cart items; open Razorpay:

```ts
const rzp = new window.Razorpay({
  key: data.keyId,
  amount: data.amountPaise,
  currency: "INR",
  name: "Crestyve",
  order_id: data.razorpayOrderId,
  handler: async (response) => {
    // optional POST /api/checkout/verify
    window.location.href = `/order/success?order=${data.orderNumber}`;
  },
});
rzp.open();
```

- [ ] **Step 3: Clear cart on success page mount** after confirming order number present.

- [ ] **Step 4: Commit**

```bash
git add src/app/(site)/checkout src/components/checkout
git commit -m "feat: checkout page with Razorpay Checkout"
```

---

### Task 5: Webhook + verify route + email

**Files:**
- Create: `src/app/api/webhooks/razorpay/route.ts`
- Create: `src/app/api/checkout/verify/route.ts`
- Create: `src/lib/email.ts`
- Create: `src/app/(site)/order/success/page.tsx`

- [ ] **Step 1: Email helper**

```ts
import { Resend } from "resend";

export async function sendOrderConfirmation(opts: {
  to: string;
  orderNumber: string;
  totalPaise: number;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.info("RESEND_API_KEY unset — skip email");
    return { skipped: true };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Crestyve <onboarding@resend.dev>",
    to: opts.to,
    subject: `Order confirmed — ${opts.orderNumber}`,
    html: `<p>Thank you for your order <strong>${opts.orderNumber}</strong>.</p>`,
  });
  return { skipped: false };
}
```

Install: `npm install resend`

- [ ] **Step 2: Webhook route**

- Read raw body text for signature verification.
- Parse `payment.captured` (or `order.paid`) events.
- Map Razorpay order id → local Order.
- Call `markOrderPaid` with event id.
- If not duplicate, `sendOrderConfirmation`.
- Return 200 always after handling (avoid retries storms only after success; on verify fail return 400).

- [ ] **Step 3: Success page** shows order number, link to invoice, optional “Create account” form posting to new `POST /api/auth/register-customer` that hashes password, creates CUSTOMER user, attaches `order.userId` when email matches.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks src/app/api/checkout/verify src/lib/email.ts src/app/(site)/order
git commit -m "feat: Razorpay webhook, order success, and optional email"
```

---

### Task 6: Invoices + admin orders

**Files:**
- Create: `src/app/api/orders/[orderNumber]/invoice/route.ts`
- Create: `src/app/api/admin/orders/route.ts`
- Create: `src/app/api/admin/orders/[id]/route.ts`
- Create: `src/app/admin/orders/page.tsx`
- Modify: admin layout nav

- [ ] **Step 1: Invoice route**

- Query by `orderNumber`.
- Auth: admin session **OR** query `?email=` matching order email.
- Return HTML invoice (`Content-Type: text/html`) printable via browser; include Crestyve branding, items, totals, payment status.

- [ ] **Step 2: Admin orders API**

- GET list with filters `status`, `paymentStatus`.
- PATCH update fulfillment `status` only (not paymentStatus manually except CANCELLED unpaid).

- [ ] **Step 3: Admin UI** table + detail drawer/page; status select; invoice link.

- [ ] **Step 4: Dual CTA on product page** — Keep WhatsApp; add Add to Cart / Buy Now.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/orders src/app/api/admin/orders src/app/admin/orders src/app/admin/layout.tsx
git commit -m "feat: invoices and admin order management"
```

---

### Task 7: Docs, env, production checklist

**Files:**
- Modify: `README.md`
- Modify: `.env.example`
- Create: `docs/maintenance.md` (short)

- [ ] **Step 1: Document** Razorpay webhook URL, test→live switch, seed, Neon, Resend optional, Phase acceptance checklist from the design spec.

- [ ] **Step 2: Run full acceptance** from spec §10 Phase 3 + security items.

- [ ] **Step 3: Commit**

```bash
git add README.md .env.example docs/maintenance.md
git commit -m "docs: production deploy and maintenance guide for commerce"
```

---

## Phase 3 Acceptance

- [ ] Cart → checkout → Razorpay test payment → order PAID via webhook
- [ ] Stock decremented once; duplicate webhook safe
- [ ] Coupon applied correctly; usedCount increments once
- [ ] Invoice download works for admin and guest email
- [ ] Admin can update order status
- [ ] Email sends when Resend configured
- [ ] Tampered client prices ignored

## Spec Coverage (all phases)

| Spec area | Plan |
|-----------|------|
| db.json root cause fix | Phase 1 |
| Neon/Prisma CMS | Phase 1 |
| Admin auth RBAC | Phase 1–2 |
| WhatsApp inquiries | Phase 2 |
| Analytics, coupons, stock | Phase 2 |
| Cart/checkout/Razorpay/orders/invoices/email | Phase 3 |
| Deploy + testing docs | Phase 1 Task 10 + Phase 3 Task 7 |
