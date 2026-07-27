# Crestyve Phase 2 — Admin Ops, Inquiries & Coupons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add WhatsApp inquiry capture/management, live admin dashboard analytics, product stock (including per-size), and coupon CRUD — all on the Prisma/Neon data layer from Phase 1.

**Architecture:** Public `POST /api/inquiries` creates an `Inquiry` then client opens WhatsApp. Admin pages under `/admin/inquiries` and `/admin/coupons`. Dashboard aggregates via Prisma `count`/`aggregate`. Product admin gains `stock` + `ProductSizeStock` editors. Zod validates all new mutating endpoints.

**Tech Stack:** Next.js 16, Prisma, Zod, NextAuth (ADMIN), existing admin UI patterns

**Depends on:** Phase 1 complete (`docs/superpowers/plans/2026-07-27-crestyve-phase-1-prisma-cms.md`)

**Spec:** `docs/superpowers/specs/2026-07-27-crestyve-production-architecture-design.md`

## Global Constraints

- Same money rules as Phase 1 (paise in DB; rupees in admin JSON where applicable).
- Coupon `FIXED` value is paise; `PERCENT` value is integer 1–100.
- Inquiry status enum: `NEW | CONTACTED | IN_PROGRESS | COMPLETED | CANCELLED`.
- Do not implement Razorpay/cart in this phase.
- Preserve Crestyve admin visual patterns (existing panels/tables).

## File Structure

| Path | Responsibility |
|------|----------------|
| `src/lib/repositories/inquiries.ts` | Inquiry CRUD + status updates |
| `src/lib/repositories/coupons.ts` | Coupon CRUD + validate |
| `src/lib/validations/inquiry.ts` | Zod schemas |
| `src/lib/validations/coupon.ts` | Zod schemas |
| `src/app/api/inquiries/route.ts` | Public create |
| `src/app/api/admin/inquiries/route.ts` | Admin list |
| `src/app/api/admin/inquiries/[id]/route.ts` | Admin status update / delete |
| `src/app/api/admin/coupons/route.ts` | Admin list/create |
| `src/app/api/admin/coupons/[id]/route.ts` | Admin update/delete |
| `src/app/api/coupons/validate/route.ts` | Public validate (used again in Phase 3) |
| `src/app/api/admin/analytics/route.ts` | Dashboard stats |
| `src/app/admin/inquiries/page.tsx` | Admin UI |
| `src/app/admin/coupons/page.tsx` | Admin UI |
| `src/app/admin/dashboard/page.tsx` | Live stats |
| `src/app/admin/layout.tsx` | Nav links |
| `src/lib/repositories/products.ts` | Size stock helpers |
| Product detail / WhatsApp CTA components | Call inquiry API then `wa.me` |

---

### Task 1: Inquiry repository + Zod schema

**Files:**
- Create: `src/lib/validations/inquiry.ts`
- Create: `src/lib/repositories/inquiries.ts`
- Create: `src/lib/validations/inquiry.test.ts`

**Interfaces:**
- Produces:
  - `inquiryCreateSchema` (zod)
  - `inquiries.create(input)`
  - `inquiries.findMany(filter?)`
  - `inquiries.updateStatus(id, status)`
  - `inquiries.delete(id)`

- [ ] **Step 1: Write Zod schema + test**

```ts
// src/lib/validations/inquiry.ts
import { z } from "zod";

export const inquiryCreateSchema = z.object({
  customerName: z.string().min(1).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  productId: z.string().min(1),
  selectedSize: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export const inquiryStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
```

```ts
// src/lib/validations/inquiry.test.ts
import { describe, it, expect } from "vitest";
import { inquiryCreateSchema } from "./inquiry";

describe("inquiryCreateSchema", () => {
  it("accepts valid payload", () => {
    const parsed = inquiryCreateSchema.parse({
      customerName: "Rahul",
      phone: "+919876543210",
      productId: "prod-001",
      selectedSize: "M",
    });
    expect(parsed.customerName).toBe("Rahul");
  });

  it("rejects missing phone", () => {
    expect(() =>
      inquiryCreateSchema.parse({ customerName: "A", productId: "p1" })
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run test**

```bash
npm test -- src/lib/validations/inquiry.test.ts
```

Expected: PASS.

- [ ] **Step 3: Implement repository**

```ts
// src/lib/repositories/inquiries.ts
import { prisma } from "@/lib/prisma";
import type { InquiryStatus, InquirySource } from "@prisma/client";
import { paiseToRupees } from "@/lib/money";

export const inquiries = {
  async create(input: {
    customerName: string;
    phone: string;
    email?: string;
    productId: string;
    selectedSize?: string;
    message?: string;
    source?: InquirySource;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { category: true },
    });
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const productSnapshot = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: paiseToRupees(product.pricePaise),
      image: product.images[0] ?? null,
      selectedSize: input.selectedSize ?? null,
    };

    return prisma.inquiry.create({
      data: {
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || null,
        productId: product.id,
        productSnapshot,
        selectedSize: input.selectedSize,
        message: input.message,
        source: input.source ?? "WHATSAPP",
        status: "NEW",
      },
    });
  },

  async findMany(filter?: { status?: InquiryStatus }) {
    return prisma.inquiry.findMany({
      where: filter?.status ? { status: filter.status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });
  },

  async updateStatus(id: string, status: InquiryStatus) {
    return prisma.inquiry.update({ where: { id }, data: { status } });
  },

  async delete(id: string) {
    try {
      await prisma.inquiry.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/validations/inquiry.ts src/lib/validations/inquiry.test.ts src/lib/repositories/inquiries.ts
git commit -m "feat: add inquiry validation and repository"
```

---

### Task 2: Inquiry APIs + WhatsApp CTA wiring

**Files:**
- Create: `src/app/api/inquiries/route.ts`
- Create: `src/app/api/admin/inquiries/route.ts`
- Create: `src/app/api/admin/inquiries/[id]/route.ts`
- Modify: product client components that open WhatsApp (search `wa.me` / `whatsapp`)

**Interfaces:**
- `POST /api/inquiries` → `{ inquiryId, whatsappUrl }`
- Admin GET list; PATCH `{ status }`; DELETE

- [ ] **Step 1: Public create route**

```ts
// src/app/api/inquiries/route.ts
import { NextRequest, NextResponse } from "next/server";
import { inquiryCreateSchema } from "@/lib/validations/inquiry";
import { inquiries } from "@/lib/repositories/inquiries";
import { settings } from "@/lib/db-repos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = inquiryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const inquiry = await inquiries.create({
      ...parsed.data,
      email: parsed.data.email || undefined,
      source: "WHATSAPP",
    });

    const site = await settings.get();
    const phone = site.whatsappNumber.replace(/[^\d]/g, "");
    const snap = inquiry.productSnapshot as {
      name: string;
      price: number;
      selectedSize?: string | null;
    };
    const text = encodeURIComponent(
      `Hi Crestyve! I'd like to order:\n` +
        `Product: ${snap.name}\n` +
        (snap.selectedSize ? `Size: ${snap.selectedSize}\n` : "") +
        `Price: ₹${snap.price}\n` +
        `Ref: ${inquiry.id.slice(0, 8)}\n` +
        `Name: ${inquiry.customerName}\n` +
        `Phone: ${inquiry.phone}`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${text}`;

    return NextResponse.json({ inquiryId: inquiry.id, whatsappUrl }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Admin routes with `requireAdmin`**

List + create not needed for admin create; GET all; PATCH status; DELETE by id — mirror existing admin message routes patterns.

- [ ] **Step 3: Update WhatsApp CTA**

Find current WhatsApp link builders (e.g. product page / `whatsapp-float`). For **Buy via WhatsApp** on product:

1. Collect name + phone (small modal or inline form) OR use minimal prompt fields.
2. `POST /api/inquiries` with `productId`, `selectedSize`, customer fields.
3. `window.open(data.whatsappUrl, "_blank")`.

Keep floating WhatsApp button as general chat (no inquiry) unless product context exists.

- [ ] **Step 4: Manual test** — submit inquiry → row in Neon → WhatsApp opens with text.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/inquiries src/app/api/admin/inquiries src/app
git commit -m "feat: WhatsApp inquiry API and product CTA integration"
```

---

### Task 3: Admin Inquiries page + nav

**Files:**
- Create: `src/app/admin/inquiries/page.tsx`
- Modify: `src/app/admin/layout.tsx` (add Inquiries link)

- [ ] **Step 1: Build page** listing inquiries (customer, product snapshot name, status select, createdAt). Status `onChange` → `PATCH /api/admin/inquiries/[id]`. Follow styling of `src/app/admin/messages/page.tsx`.

- [ ] **Step 2: Add nav item** "Inquiries" with MessageSquare or ShoppingBag icon.

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/inquiries/page.tsx src/app/admin/layout.tsx
git commit -m "feat: admin inquiries management page"
```

---

### Task 4: Coupons repository, APIs, admin UI

**Files:**
- Create: `src/lib/validations/coupon.ts`
- Create: `src/lib/repositories/coupons.ts`
- Create: `src/app/api/admin/coupons/route.ts`
- Create: `src/app/api/admin/coupons/[id]/route.ts`
- Create: `src/app/api/coupons/validate/route.ts`
- Create: `src/app/admin/coupons/page.tsx`
- Modify: admin layout nav

**Interfaces:**
- `coupons.validate(code, subtotalPaise) => { ok, discountPaise, coupon } | { ok: false, error }`
- FIXED discount value stored/entered as **rupees in admin**, converted to paise in repo
- PERCENT: `discountPaise = Math.floor(subtotalPaise * value / 100)`

- [ ] **Step 1: Validation + validate helper tests**

```ts
// src/lib/validations/coupon.ts
import { z } from "zod";

export const couponUpsertSchema = z.object({
  code: z.string().min(3).max(32).transform((c) => c.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrderRupees: z.number().min(0).optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
});
```

```ts
// In coupons repository
export function computeDiscountPaise(
  type: "PERCENT" | "FIXED",
  value: number,
  subtotalPaise: number
): number {
  if (type === "PERCENT") {
    return Math.min(subtotalPaise, Math.floor((subtotalPaise * value) / 100));
  }
  return Math.min(subtotalPaise, value); // value already paise for FIXED in DB
}
```

Test `computeDiscountPaise` in `src/lib/repositories/coupons.test.ts`.

- [ ] **Step 2: Implement CRUD + validate route**

`POST /api/coupons/validate` body `{ code, subtotalRupees }` → returns discount in rupees for UI.

- [ ] **Step 3: Admin coupons page** — table + form (code, type, value, min order, max uses, active).

- [ ] **Step 4: Commit**

```bash
git add src/lib/validations/coupon.ts src/lib/repositories/coupons.ts src/lib/repositories/coupons.test.ts src/app/api/admin/coupons src/app/api/coupons src/app/admin/coupons
git commit -m "feat: coupon CRUD and validation API"
```

---

### Task 5: Stock + size stock in product admin/API

**Files:**
- Modify: `src/lib/repositories/products.ts` — accept `stock`, `sizeStocks?: { size: string; stock: number }[]`
- Modify: `src/app/api/admin/products/route.ts` and `[id]/route.ts`
- Modify: `src/app/admin/products/page.tsx` — stock fields

**Interfaces:**
- On create/update: upsert `ProductSizeStock` rows for provided sizes; delete removed sizes

- [ ] **Step 1: Extend product update to sync size stocks in a transaction**

```ts
await prisma.$transaction(async (tx) => {
  const product = await tx.product.update({ /* ... stock ... */ });
  if (sizeStocks) {
    await tx.productSizeStock.deleteMany({ where: { productId: id } });
    if (sizeStocks.length) {
      await tx.productSizeStock.createMany({
        data: sizeStocks.map((s) => ({
          productId: id,
          size: s.size,
          stock: s.stock,
        })),
      });
    }
  }
  return product;
});
```

- [ ] **Step 2: Admin UI inputs** for overall stock + per-size stock map.

- [ ] **Step 3: Commit**

```bash
git add src/lib/repositories/products.ts src/app/api/admin/products src/app/admin/products/page.tsx
git commit -m "feat: product and size-level stock management"
```

---

### Task 6: Live dashboard analytics

**Files:**
- Create: `src/app/api/admin/analytics/route.ts`
- Modify: `src/app/admin/dashboard/page.tsx`

**Interfaces:**
- GET returns `{ productCount, unreadMessages, openInquiries, ordersToday, revenuePaise, lowStock }`
- `openInquiries` = status in NEW, CONTACTED, IN_PROGRESS
- `ordersToday` / revenue may be `0` until Phase 3 — still query Order table

- [ ] **Step 1: Analytics route with requireAdmin**

```ts
const [productCount, unreadMessages, openInquiries, ordersToday, paidAgg, lowStock] =
  await Promise.all([
    prisma.product.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.inquiry.count({
      where: { status: { in: ["NEW", "CONTACTED", "IN_PROGRESS"] } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: startOfUtcDay(new Date()) } },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalPaise: true },
    }),
    prisma.product.findMany({
      where: { stock: { not: null, lte: 2 } },
      select: { id: true, name: true, stock: true },
      take: 10,
    }),
  ]);
```

- [ ] **Step 2: Replace hardcoded dashboard stats** with fetch to `/api/admin/analytics`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/analytics/route.ts src/app/admin/dashboard/page.tsx
git commit -m "feat: live admin dashboard analytics"
```

---

## Phase 2 Acceptance

- [ ] WhatsApp buy creates Inquiry and opens wa.me with product details
- [ ] Admin can change inquiry status
- [ ] Coupons CRUD + validate endpoint works
- [ ] Product stock / size stock editable
- [ ] Dashboard shows real counts (not mock strings)

## Execution

Complete Phase 2 before starting Phase 3 plan.
