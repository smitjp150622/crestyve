# Crestyve Production Architecture Design

**Date:** 2026-07-27  
**Status:** Approved for planning (pending user review of this file)  
**Scope:** Full design for Phases 1–3; implementation will proceed sequentially

---

## 1. Problem Statement

### 1.1 Root Cause: `db.json` Fails After Deployment

Crestyve stores CMS content in `data/db.json` via `src/lib/json-db.ts` using Node `fs` read/write.

On Vercel (and similar serverless platforms):

1. The deployment filesystem is **read-only** except `/tmp`.
2. The code detects Vercel (`VERCEL=1`) and copies the seed DB to `/tmp/db.json`, then writes there.
3. `/tmp` is **ephemeral**: it does not persist across cold starts, and each serverless instance has its own `/tmp`.

**Result:** Create/update/delete appear to work briefly in production, then changes disappear. Local development works because the project directory is writable and persistent.

This is an architectural mismatch (mutable local file vs serverless), not an admin UI bug. The fix is a managed database with durable storage.

### 1.2 Product Goals

Transform Crestyve from a file-backed storytelling/lead-gen site into a production-ready platform with:

1. Durable CMS CRUD in production
2. Complete admin operations
3. Two purchase paths: WhatsApp inquiry and online checkout (Razorpay)
4. Production security, validation, and maintainability

---

## 2. Decisions (Locked)

| Decision | Choice |
|----------|--------|
| Delivery scope | Design all phases; implement Phase 1 → 2 → 3 sequentially |
| Architecture | Monolith Next.js App Router on Vercel |
| Database | Neon PostgreSQL + Prisma ORM |
| Payments | Razorpay |
| Checkout | Guest checkout + optional account creation after order |
| Inventory | Product-level stock + optional per-size stock |
| Email | Resend (optional; no-op if unset) |
| Coupons | Full simple coupon CRUD (percent / fixed INR) |
| Media | Cloudinary (already a dependency) |
| Auth | NextAuth (JWT session); roles `ADMIN` \| `CUSTOMER` |

---

## 3. System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│  Vercel (Next.js App Router)                                │
│                                                             │
│  (site)  Storefront: home, products, cart, checkout         │
│  /admin  Admin dashboard (NextAuth, role ADMIN)             │
│  /api    Route Handlers: CMS, inquiries, checkout, webhooks │
└───────────────┬─────────────────────┬───────────────────────┘
                │                     │
                ▼                     ▼
        Neon PostgreSQL          Cloudinary
        (Prisma ORM)             (images / video)
                │
                ▼
        Razorpay ←→ webhooks      Resend (optional email)
```

### 3.1 Layering

- **Data access:** Prisma client (`src/lib/prisma.ts`). Replace `json-db.ts` implementations; keep storefront helpers in `src/lib/db.ts` with the same function signatures where practical so pages change minimally.
- **APIs:** Next.js Route Handlers under `/api` and `/api/admin`.
- **Auth:** NextAuth Credentials provider against `User` table (bcrypt). JWT strategy; `role` on token/session.
- **Admin UI:** Existing `/admin/*` pages, extended for inquiries, orders, coupons, live analytics, stock.
- **Storefront:** Existing marketing/product pages + new cart, checkout, order success, invoice download.

### 3.2 Implementation Order

1. **Phase 1 — Data foundation:** Prisma schema, Neon, seed from `db.json`, migrate all CMS APIs off filesystem, harden admin auth against DB users.
2. **Phase 2 — Ops:** Inquiries (WhatsApp), live dashboard analytics, stock fields in admin, coupons CRUD.
3. **Phase 3 — Commerce:** Cart, checkout, Razorpay, orders, invoices, Resend, optional post-order account.

---

## 4. Data Model

Money is stored as **integer paise** (INR × 100) to avoid floating-point errors. Display layer converts to rupees.

### 4.1 CMS Entities (migrated from `db.json`)

- **User** — id, email (unique), passwordHash, name, role (`ADMIN` | `CUSTOMER`), createdAt, updatedAt
- **Category** — id, name, slug (unique), description?, image?, order, timestamps
- **Product** — id, name, slug (unique), description?, price (Int paise), images (String[]), video?, categoryId, materials (String[]), sizes (String[]), available, featured, artistNotes?, beforeImage?, afterImage?, order, **stock** (Int?, null = unlimited / not tracked numerically), timestamps
- **ProductSizeStock** — id, productId, size, stock (Int); unique(productId, size)
- **Testimonial** — as today
- **Award** — as today
- **GalleryImage** — as today
- **ContactMessage** — as today (contact form inbox)
- **SiteSettings** — singleton row (id `default` or fixed key): hero, about, WhatsApp number, Instagram, email, studio address, map embed, default shipping fee (paise)

### 4.2 Commerce / Ops Entities

- **Inquiry** — WhatsApp / lead purchase requests  
  - customerName, phone, email?, productId?, productSnapshot (JSON), selectedSize?, message?, status (`NEW` | `CONTACTED` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`), source (`WHATSAPP` | `CONTACT`), timestamps
- **Coupon** — code (unique), type (`PERCENT` | `FIXED`), value, minOrderPaise?, maxUses?, usedCount, startsAt?, endsAt?, active
- **Order** — orderNumber (unique, human-readable), customerName, email, phone, shippingAddress (JSON), status (`PENDING` | `PROCESSING` | `SHIPPED` | `DELIVERED` | `CANCELLED`), paymentStatus (`PENDING` | `PAID` | `FAILED` | `REFUNDED`), subtotalPaise, discountPaise, shippingPaise, totalPaise, couponId?, razorpayOrderId?, razorpayPaymentId?, userId?, timestamps
- **OrderItem** — orderId, productId?, name, pricePaise, size?, qty, image?
- **PaymentEvent** — providerEventId (unique), orderId?, payload (JSON), processedAt — webhook idempotency
- **Cart (v1)** — client-side cart (localStorage/context) only; no persistent `Cart` table required. Checkout always revalidates prices and stock from the database. A server `Cart` model may be added later if multi-device sync is needed.

### 4.3 Indexes

- Product.slug, Category.slug (unique)
- Order.orderNumber (unique), Order.paymentStatus, Order.status, Order.createdAt
- Inquiry.status, Inquiry.createdAt
- Coupon.code (unique)
- PaymentEvent.providerEventId (unique)
- ProductSizeStock (productId, size) unique

### 4.4 Migration Strategy

1. Add Prisma schema + generate client.
2. Connect `DATABASE_URL` (Neon).
3. `prisma migrate` / `db push` to create tables.
4. One-time seed script: read `data/db.json` → `createMany` for categories, products, testimonials, awards, gallery, messages, settings; convert prices from rupees to paise if current JSON stores rupees as whole numbers (confirm during seed: existing JSON prices like `15000` are treated as **rupees** and stored as `1500000` paise, OR keep rupee integers and document display as rupees without paise conversion).

**Price convention (explicit):** Existing `db.json` prices are whole INR rupees (e.g. `15000` = ₹15,000). On seed, store as paise: `pricePaise = rupees * 100`. Admin UI and storefront display format as INR.

5. Seed admin `User` from `ADMIN_EMAIL` + `ADMIN_PASSWORD` (bcrypt hash).
6. Point all APIs at Prisma; delete or deprecate write path in `json-db.ts` (keep file only as seed source until migration verified).
7. Verify production CRUD against Neon; remove `/tmp` Vercel file workaround.

---

## 5. Purchase Flows

### 5.1 Option A — Buy via WhatsApp

1. Customer selects size (if applicable) and clicks **Buy via WhatsApp**.
2. `POST /api/inquiries` validates (Zod), creates `Inquiry` with status `NEW`, source `WHATSAPP`, product snapshot.
3. Client redirects to `https://wa.me/{whatsappNumber}?text=...` including product name, size, price, and inquiry reference.
4. Admin **Inquiries** list: view customer + products, update status through workflow to `COMPLETED` or `CANCELLED`.

Contact form submissions remain `ContactMessage`. WhatsApp purchase intents use `Inquiry` so operations stay separate.

### 5.2 Option B — Online Purchase (Razorpay)

1. **Cart** — add / update / remove; client state (+ optional server cart); stock checked on add and again at checkout.
2. **Checkout** — customer info, shipping address, order summary, coupon apply via `POST /api/coupons/validate`.
3. **Create payment** — `POST /api/checkout`:
   - Recompute line prices from DB (never trust client totals)
   - Validate stock (product and/or size)
   - Apply coupon rules
   - Create `Order` (`PENDING`, payment `PENDING`) + `OrderItem`s
   - Create Razorpay order; return `razorpayOrderId`, amount, key id, orderNumber
4. Client opens Razorpay Checkout.
5. **Authoritative confirmation:** `POST /api/webhooks/razorpay` verifies signature, logs `PaymentEvent` idempotently, on success:
   - paymentStatus → `PAID`
   - order status → `PROCESSING`
   - decrement stock
   - increment coupon usedCount if applicable
   - send confirmation email via Resend if `RESEND_API_KEY` set
6. Success page shows order number; optional CTA to create customer account (link `Order.userId`).
7. **Invoice** — `GET /api/orders/[orderNumber]/invoice` (admin session, or guest verification via email + order number).

**Stock policy (v1):** Decrement stock only when payment is `PAID`. No hard reservation on unpaid orders. Failed payments leave stock unchanged. Admin may cancel unpaid orders manually.

**Failure paths:** Payment failure → paymentStatus `FAILED` (or remains `PENDING` until timeout); no stock decrement; customer can retry from a new checkout.

---

## 6. Admin Dashboard

Preserve existing admin shell and visual language. Replace mock dashboard data with live aggregates.

| Area | Capability |
|------|------------|
| Dashboard | Product count, unread messages, open inquiries, orders today, paid revenue, low-stock alerts |
| Products / Categories | CRUD + stock + optional size stock + Cloudinary uploads |
| CMS | Testimonials, awards, gallery, site settings (Postgres-backed) |
| Messages | Contact form inbox |
| Inquiries | WhatsApp orders: customer, snapshot, status updates |
| Orders | Filter by status/payment; detail; update fulfillment; download invoice |
| Coupons | CRUD percent/fixed, windows, usage limits |
| Media | Gallery + product images via Cloudinary |
| Settings | WhatsApp, contact, hero, default shipping fee |

### 6.1 Auth / RBAC

- **ADMIN:** full `/admin` and `/api/admin/*`
- **CUSTOMER:** created optionally post-order; v1 stores linkage to orders; full customer portal is out of scope beyond optional signup
- Public APIs: Zod validation; no admin session required
- Razorpay webhook: signature verification only (no session)

### 6.2 API Error Shape

Consistent JSON: `{ "error": string, "code"?: string }` with appropriate HTTP status. Validation failures → 400. Unauthorized → 401. Forbidden → 403.

### 6.3 Logging

Structured logs for payment webhooks, stock updates, and DB errors. Never log secrets, full card data, or raw webhook secrets.

---

## 7. Security & Production Practices

**Environment variables**

- `DATABASE_URL`
- `AUTH_SECRET` (or `NEXTAUTH_SECRET`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seed / bootstrap only)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `EMAIL_FROM` (optional)
- `NEXT_PUBLIC_APP_URL`

**Practices**

- Server recomputes all monetary totals and stock from DB
- Webhook idempotency via `PaymentEvent`
- HTTPS session cookies; NextAuth JWT for admin
- Input validation on all mutating endpoints
- Indexes on hot query fields
- Responsive UI for storefront and admin
- Modular code: `lib/prisma`, domain validators, payment service, email service

---

## 8. Frontend Integration

- Storefront product pages: dual CTAs — **Buy via WhatsApp** and **Add to Cart** / **Buy Now**
- Cart icon in navbar; cart page; checkout multi-step or single page (customer → shipping → pay)
- Order success page; invoice download link
- Admin nav additions: Inquiries, Orders, Coupons
- Preserve existing Crestyve design system (burgundy/gold, Cormorant/Manrope/Inter) for storefront; admin keeps current patterns

---

## 9. Out of Scope (v1)

- Multi-admin role matrix beyond ADMIN / CUSTOMER
- Live shipping carrier rate APIs (flat / settings-based fee only)
- Full customer account portal (order history UI beyond optional signup)
- Separate backend microservice
- Replacing admin with a headless CMS product (Sanity/Payload)

---

## 10. Testing Checklist (Acceptance)

**Phase 1**

- [ ] Neon connected; migrations applied
- [ ] Seed imports all `db.json` entities; prices correct in paise
- [ ] Admin login works against DB user
- [ ] Admin create/update/delete product, category, testimonial, award, gallery, settings persists after cold start / redeploy
- [ ] Storefront reads products/categories from Postgres
- [ ] Contact form writes `ContactMessage` to Postgres

**Phase 2**

- [ ] WhatsApp CTA creates Inquiry then opens wa.me
- [ ] Admin can update inquiry status
- [ ] Dashboard shows live counts
- [ ] Coupon CRUD + validation endpoint
- [ ] Size stock editable in product admin

**Phase 3**

- [ ] Cart add/update/remove; stock rejection when insufficient
- [ ] Checkout creates Order + Razorpay order (test mode)
- [ ] Webhook marks PAID, decrements stock, increments coupon usage
- [ ] Success page shows order number
- [ ] Invoice downloadable
- [ ] Resend sends email when configured; silent skip when not
- [ ] Admin order list/status/payment/invoice
- [ ] Optional post-order account links order to user

**Security / prod**

- [ ] Unauthenticated admin API calls rejected
- [ ] Client-tampered prices ignored
- [ ] Invalid Razorpay signature rejected
- [ ] Duplicate webhook does not double-decrement stock

---

## 11. Deployment Instructions (Summary)

1. Create Neon project; copy connection string to Vercel `DATABASE_URL`.
2. Set all env vars in Vercel (Auth, Cloudinary, Razorpay test then live, Resend optional).
3. Build command: `prisma generate && next build` (add to `package.json` / Vercel build settings).
4. Run migrate deploy on CI or first release: `prisma migrate deploy`.
5. Run seed once (local against Neon or one-off script): import `db.json` + admin user.
6. Configure Razorpay webhook URL: `https://<domain>/api/webhooks/razorpay`.
7. Smoke-test admin CMS write + Razorpay test payment.
8. Switch Razorpay to live keys when ready.

---

## 12. Maintenance Notes

- **Content:** Prefer Admin UI over editing Neon directly.
- **Stock:** Update product or size stock in Products admin after manual WhatsApp sales if needed.
- **Keys:** Rotate Razorpay/Cloudinary/Resend via env; redeploy.
- **Schema changes:** Prisma migrate → review → deploy; never edit production DB schema by hand without migration.
- **Seed file:** `data/db.json` becomes historical seed only after cutover; do not rely on it for runtime writes.

---

## 13. Alternatives Considered

1. **Monolith Next.js + Prisma (chosen)** — fastest, matches repo, one Vercel deploy.
2. **Separate Nest/Express API** — clearer service boundary; unnecessary ops cost now.
3. **Headless CMS + custom commerce DB** — strong CMS UX; dual data model and admin rewrite.

---

## 14. Success Criteria

- CMS mutations persist permanently in production.
- Admins can manage content, inquiries, orders, coupons, and stock without touching code.
- Customers can complete WhatsApp or Razorpay purchase flows end-to-end.
- Architecture supports future growth (customer portal, more payment methods) without rewriting the data layer.
