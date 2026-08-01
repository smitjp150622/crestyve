# Crestyve Phase 1 — Prisma CMS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace file-based `db.json` / `json-db.ts` with Neon PostgreSQL + Prisma so CMS create/update/delete persists in production.

**Architecture:** Keep the Next.js monolith. Introduce Prisma schema + client, a repository module with the same surface area as `json-db` exports (categories, products, testimonials, awards, gallery, messages, settings), convert money at the boundary (API/UI uses INR rupees; DB stores integer paise), seed from `data/db.json`, and authenticate admin against a bcrypt-hashed `User` row. Include the full commerce schema models now (unused until Phases 2–3) to avoid painful migrations later.

**Tech Stack:** Next.js 16, Prisma, Neon PostgreSQL, NextAuth v5, bcryptjs, Zod, Vitest

**Related plans:**  
- Phase 2: `docs/superpowers/plans/2026-07-27-crestyve-phase-2-admin-inquiries.md`  
- Phase 3: `docs/superpowers/plans/2026-07-27-crestyve-phase-3-ecommerce-razorpay.md`  
- Spec: `docs/superpowers/specs/2026-07-27-crestyve-production-architecture-design.md`

## Global Constraints

- Money in DB: integer **paise** (`pricePaise = rupees * 100`). Existing `db.json` prices are whole INR rupees.
- API/admin JSON continues to expose `price` as **rupees** (number) for backward compatibility; convert in repositories.
- Do not write to `data/db.json` or `/tmp/db.json` after cutover.
- All `/api/admin/*` mutations require authenticated session with `role === "ADMIN"`.
- No secrets in code; use `.env` / `.env.example`.
- Prefer small focused files; do not rewrite unrelated storefront UI in Phase 1.
- Follow existing patterns (`export const dynamic = "force-dynamic"` on admin routes).
- Read Next.js guides under `node_modules/next/dist/docs/` before using unfamiliar Next APIs.

## File Structure (Phase 1)

| Path | Responsibility |
|------|----------------|
| `prisma/schema.prisma` | Full data model |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/money.ts` | Rupee ↔ paise helpers |
| `src/lib/repositories/*.ts` | Per-entity DB access (replaces `json-db`) |
| `src/lib/db-repos.ts` | Re-export barrel matching `json-db` exports |
| `src/lib/db.ts` | Storefront helpers → use repos (async Prisma) |
| `src/lib/auth.ts` | Admin auth via `User` + bcrypt |
| `src/lib/admin-auth.ts` | `requireAdmin()` for API routes |
| `scripts/seed.ts` | Seed Neon from `data/db.json` + admin user |
| `src/lib/money.test.ts` | Unit tests for money helpers |
| `.env.example` | Document required env vars |
| Deprecate writes in `src/lib/json-db.ts` | Keep types temporarily or move types to `src/types/cms.ts` |

---

### Task 1: Tooling — Vitest, Prisma, bcrypt

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `.env.example`

**Interfaces:**
- Produces: `npm test` runs Vitest; Prisma CLI available; `DATABASE_URL` documented

- [ ] **Step 1: Install dependencies**

```bash
npm install @prisma/client bcryptjs zod
npm install -D prisma vitest @types/bcryptjs tsx dotenv
```

Expected: packages appear in `package.json` dependencies/devDependencies.

- [ ] **Step 2: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Update `package.json` scripts**

Add/replace scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx --env-file=.env scripts/seed.ts",
    "postinstall": "prisma generate"
  },
  "prisma": {
    "seed": "tsx --env-file=.env scripts/seed.ts"
  }
}
```

- [ ] **Step 4: Create `.env.example`**

```bash
# Database (Neon)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"

# Auth
AUTH_SECRET="generate-a-long-random-string"
ADMIN_EMAIL="admin@crestyve.com"
ADMIN_PASSWORD="change-me"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudinary (existing)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Phase 3 (optional now)
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
RESEND_API_KEY=""
EMAIL_FROM="Crestyve <orders@crestyve.com>"
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts .env.example
git commit -m "chore: add Prisma, Vitest, and env example for CMS migration"
```

---

### Task 2: Money helpers (TDD)

**Files:**
- Create: `src/lib/money.ts`
- Create: `src/lib/money.test.ts`

**Interfaces:**
- Produces:
  - `rupeesToPaise(rupees: number): number`
  - `paiseToRupees(paise: number): number`
  - `formatInr(paise: number): string` — e.g. `₹15,000`

- [ ] **Step 1: Write failing tests**

Create `src/lib/money.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { rupeesToPaise, paiseToRupees, formatInr } from "./money";

describe("money", () => {
  it("converts rupees to paise", () => {
    expect(rupeesToPaise(15000)).toBe(1500000);
    expect(rupeesToPaise(0)).toBe(0);
  });

  it("converts paise to rupees", () => {
    expect(paiseToRupees(1500000)).toBe(15000);
  });

  it("rounds fractional rupees to nearest paise", () => {
    expect(rupeesToPaise(10.555)).toBe(1056);
  });

  it("formats INR from paise", () => {
    expect(formatInr(1500000)).toBe("₹15,000");
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test -- src/lib/money.test.ts
```

Expected: FAIL (module not found / exports missing).

- [ ] **Step 3: Implement**

Create `src/lib/money.ts`:

```ts
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function formatInr(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- src/lib/money.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/money.ts src/lib/money.test.ts
git commit -m "feat: add INR paise money helpers"
```

---

### Task 3: Prisma schema + client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

**Interfaces:**
- Produces: `prisma` singleton from `@/lib/prisma`
- Full models: User, Category, Product, ProductSizeStock, Testimonial, Award, GalleryImage, ContactMessage, SiteSettings, Inquiry, Coupon, Order, OrderItem, PaymentEvent

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Replace `prisma/schema.prisma` with full schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  CUSTOMER
}

enum InquiryStatus {
  NEW
  CONTACTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum InquirySource {
  WHATSAPP
  CONTACT
}

enum CouponType {
  PERCENT
  FIXED
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  role         Role     @default(CUSTOMER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  orders       Order[]
}

model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]
}

model Product {
  id          String             @id @default(cuid())
  name        String
  slug        String             @unique
  description String?
  pricePaise  Int
  images      String[]
  video       String?
  categoryId  String
  category    Category           @relation(fields: [categoryId], references: [id])
  materials   String[]
  sizes       String[]
  available   Boolean            @default(true)
  featured    Boolean            @default(false)
  artistNotes String?
  beforeImage String?
  afterImage  String?
  order       Int                @default(0)
  stock       Int?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  sizeStocks  ProductSizeStock[]
  inquiries   Inquiry[]
  orderItems  OrderItem[]

  @@index([categoryId])
  @@index([featured])
}

model ProductSizeStock {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  size      String
  stock     Int

  @@unique([productId, size])
}

model Testimonial {
  id        String   @id @default(cuid())
  name      String
  role      String?
  content   String
  image     String?
  featured  Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Award {
  id          String   @id @default(cuid())
  title       String
  description String?
  year        Int
  image       String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Complete remaining models in the same file:

```prisma
model GalleryImage {
  id        String   @id @default(cuid())
  title     String?
  url       String
  category  String?
  featured  Boolean  @default(false)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String?
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model SiteSettings {
  id              String  @id @default("default")
  heroTitle       String
  heroSubtitle    String
  heroVideo       String?
  aboutTitle      String?
  aboutContent    String?
  artistImage     String?
  whatsappNumber  String
  instagramHandle String
  email           String
  studioAddress   String?
  mapEmbedUrl     String?
  shippingPaise   Int     @default(0)
}

model Inquiry {
  id              String         @id @default(cuid())
  customerName    String
  phone           String
  email           String?
  productId       String?
  product         Product?       @relation(fields: [productId], references: [id], onDelete: SetNull)
  productSnapshot Json
  selectedSize    String?
  message         String?
  status          InquiryStatus  @default(NEW)
  source          InquirySource  @default(WHATSAPP)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  @@index([status])
  @@index([createdAt])
}

model Coupon {
  id            String     @id @default(cuid())
  code          String     @unique
  type          CouponType
  value         Int
  minOrderPaise Int?
  maxUses       Int?
  usedCount     Int        @default(0)
  startsAt      DateTime?
  endsAt        DateTime?
  active        Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  orders        Order[]
}

model Order {
  id                String        @id @default(cuid())
  orderNumber       String        @unique
  customerName      String
  email             String
  phone             String
  shippingAddress   Json
  status            OrderStatus   @default(PENDING)
  paymentStatus     PaymentStatus @default(PENDING)
  subtotalPaise     Int
  discountPaise     Int           @default(0)
  shippingPaise     Int           @default(0)
  totalPaise        Int
  couponId          String?
  coupon            Coupon?       @relation(fields: [couponId], references: [id], onDelete: SetNull)
  razorpayOrderId   String?
  razorpayPaymentId String?
  userId            String?
  user              User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  items             OrderItem[]
  paymentEvents     PaymentEvent[]
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  order      Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId  String?
  product    Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  name       String
  pricePaise Int
  size       String?
  qty        Int
  image      String?
}

model PaymentEvent {
  id             String   @id @default(cuid())
  providerEventId String  @unique
  orderId        String?
  order          Order?   @relation(fields: [orderId], references: [id], onDelete: SetNull)
  payload        Json
  processedAt    DateTime @default(now())
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Ensure `.env` has `DATABASE_URL`**

Developer must create Neon DB and set `DATABASE_URL` in `.env` (never commit `.env`).

```bash
npx prisma db push
npx prisma generate
```

Expected: tables created; client generated without errors.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/lib/prisma.ts
git commit -m "feat: add Prisma schema and client for Crestyve data layer"
```

---

### Task 4: CMS type mappers + category repository

**Files:**
- Create: `src/types/cms.ts` (move shared CMS interfaces from json-db)
- Create: `src/lib/repositories/categories.ts`
- Create: `src/lib/repositories/map-product.ts` (shared product mapper for later)
- Modify later barrel: `src/lib/db-repos.ts`

**Interfaces:**
- Produces (async API matching prior sync json-db, but **async**):
  - `categories.findMany(options?: { orderBy?: string }): Promise<(Category & { _count?: { products: number } })[]>`
  - `categories.findById(id: string)`
  - `categories.create(data)`
  - `categories.update(id, data)`
  - `categories.delete(id): Promise<boolean>`
- Category type keeps same fields; `createdAt`/`updatedAt` as ISO strings in API responses for UI compatibility.

**Important:** json-db methods were **synchronous**. Prisma is async. Update all API routes and `src/lib/db.ts` to `await` repository calls. Storefront `getProducts` etc. are already `async`.

- [ ] **Step 1: Create `src/types/cms.ts`**

Copy Category, Product, Testimonial, Award, GalleryImage, ContactMessage, SiteSettings interfaces from `src/lib/json-db.ts` (lines 9–109). Export them from `src/types/cms.ts`. Add optional `stock?: number | null` on Product.

- [ ] **Step 2: Implement categories repository**

Create `src/lib/repositories/categories.ts`:

```ts
import { prisma } from "@/lib/prisma";
import type { Category } from "@/types/cms";

function mapCategory(
  c: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
    _count?: { products: number };
  }
): Category & { _count?: { products: number } } {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    image: c.image ?? undefined,
    order: c.order,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    _count: c._count,
  };
}

export const categories = {
  async findMany(options?: { orderBy?: string }) {
    const items = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy:
        options?.orderBy === "order"
          ? { order: "asc" }
          : { createdAt: "desc" },
    });
    return items.map(mapCategory);
  },

  async findById(id: string) {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    return cat ? mapCategory(cat) : null;
  },

  async create(data: Omit<Category, "id" | "createdAt" | "updatedAt">) {
    const cat = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        order: data.order,
      },
      include: { _count: { select: { products: true } } },
    });
    return mapCategory(cat);
  },

  async update(id: string, data: Partial<Omit<Category, "id" | "createdAt">>) {
    try {
      const cat = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          image: data.image,
          order: data.order,
        },
        include: { _count: { select: { products: true } } },
      });
      return mapCategory(cat);
    } catch {
      return null;
    }
  },

  async delete(id: string) {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
```

- [ ] **Step 3: Smoke-check with a quick script (optional)**

If DB is seeded later; for now `npx tsc --noEmit` should not error on this file after generate.

- [ ] **Step 4: Commit**

```bash
git add src/types/cms.ts src/lib/repositories/categories.ts
git commit -m "feat: add Category Prisma repository"
```

---

### Task 5: Products repository (with paise conversion)

**Files:**
- Create: `src/lib/repositories/products.ts`

**Interfaces:**
- Produces async `products` object matching json-db: `findMany`, `findById`, `findBySlug`, `create`, `update`, `delete`, `countByCategory`
- `create`/`update`/`find*` expose `price` in **rupees**; persist `pricePaise`
- Include `category` relation and `stock` / later size stocks

- [ ] **Step 1: Write mapper unit test for price conversion in isolation**

Extend `src/lib/money.test.ts` is enough for conversion; products repo is integration-heavy. Add a pure mapper test file:

Create `src/lib/repositories/product-mapper.ts`:

```ts
import { paiseToRupees, rupeesToPaise } from "@/lib/money";

export function toProductDto(p: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricePaise: number;
  images: string[];
  video: string | null;
  categoryId: string;
  materials: string[];
  sizes: string[];
  available: boolean;
  featured: boolean;
  artistNotes: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  order: number;
  stock: number | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string; slug: string; description: string | null; image: string | null; order: number; createdAt: Date; updatedAt: Date } | null;
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? undefined,
    price: paiseToRupees(p.pricePaise),
    images: p.images,
    video: p.video ?? undefined,
    categoryId: p.categoryId,
    materials: p.materials,
    sizes: p.sizes,
    available: p.available,
    featured: p.featured,
    artistNotes: p.artistNotes ?? undefined,
    beforeImage: p.beforeImage ?? undefined,
    afterImage: p.afterImage ?? undefined,
    order: p.order,
    stock: p.stock,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          description: p.category.description ?? undefined,
          image: p.category.image ?? undefined,
          order: p.category.order,
          createdAt: p.category.createdAt.toISOString(),
          updatedAt: p.category.updatedAt.toISOString(),
        }
      : null,
  };
}

export function priceInputToPaise(priceRupees: number) {
  return rupeesToPaise(priceRupees);
}
```

Create `src/lib/repositories/product-mapper.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { toProductDto, priceInputToPaise } from "./product-mapper";

describe("product-mapper", () => {
  it("exposes price in rupees from paise", () => {
    const dto = toProductDto({
      id: "1",
      name: "Aurora",
      slug: "aurora",
      description: null,
      pricePaise: 1500000,
      images: [],
      video: null,
      categoryId: "c1",
      materials: [],
      sizes: [],
      available: true,
      featured: false,
      artistNotes: null,
      beforeImage: null,
      afterImage: null,
      order: 0,
      stock: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      category: null,
    });
    expect(dto.price).toBe(15000);
  });

  it("converts input rupees to paise", () => {
    expect(priceInputToPaise(15000)).toBe(1500000);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm test -- src/lib/repositories/product-mapper.test.ts
```

Expected: PASS after implementing mapper.

- [ ] **Step 3: Implement `products` repository** using `toProductDto` / `priceInputToPaise` and `prisma.product.*` mirroring json-db pagination (`page`/`limit`), include category on reads.

Key create data shape:

```ts
await prisma.product.create({
  data: {
    name: data.name,
    slug: data.slug,
    description: data.description,
    pricePaise: priceInputToPaise(data.price),
    images: data.images,
    video: data.video,
    categoryId: data.categoryId,
    materials: data.materials,
    sizes: data.sizes,
    available: data.available,
    featured: data.featured,
    artistNotes: data.artistNotes,
    beforeImage: data.beforeImage,
    afterImage: data.afterImage,
    order: data.order,
    stock: data.stock ?? null,
  },
  include: { category: true },
});
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/repositories/product-mapper.ts src/lib/repositories/product-mapper.test.ts src/lib/repositories/products.ts
git commit -m "feat: add Product Prisma repository with paise conversion"
```

---

### Task 6: Remaining CMS repositories

**Files:**
- Create: `src/lib/repositories/testimonials.ts`
- Create: `src/lib/repositories/awards.ts`
- Create: `src/lib/repositories/gallery.ts`
- Create: `src/lib/repositories/messages.ts`
- Create: `src/lib/repositories/settings.ts`
- Create: `src/lib/db-repos.ts`

**Interfaces:**
- Same method names as `json-db.ts` for testimonials, awards, gallery, messages, settings — all async
- `db-repos.ts` re-exports: `categories, products, testimonials, awards, gallery, messages, settings, generateId` (generateId can stay as cuid via `import { createId } from "@paralleldrive/cuid2"` or use Prisma ids only)

- [ ] **Step 1: Implement each repository** mirroring `json-db.ts` logic with Prisma (`findMany` ordered, `create`, `update`, `delete`, messages `markAsRead`, settings `get`/`update` with upsert on id `"default"`).

Settings get example:

```ts
export const settings = {
  async get() {
    const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    if (!row) {
      return {
        id: "default",
        heroTitle: "Wear Your Story",
        heroSubtitle: "Handcrafted Fashion. Painted with Passion.",
        whatsappNumber: "+918884942210",
        instagramHandle: "@crestyve",
        email: "hello@crestyve.com",
      };
    }
    return {
      ...row,
      heroVideo: row.heroVideo ?? undefined,
      aboutTitle: row.aboutTitle ?? undefined,
      aboutContent: row.aboutContent ?? undefined,
      artistImage: row.artistImage ?? undefined,
      studioAddress: row.studioAddress ?? undefined,
      mapEmbedUrl: row.mapEmbedUrl ?? undefined,
    };
  },
  async update(data: Record<string, unknown>) {
    const row = await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        heroTitle: (data.heroTitle as string) || "Wear Your Story",
        heroSubtitle: (data.heroSubtitle as string) || "Handcrafted Fashion. Painted with Passion.",
        whatsappNumber: (data.whatsappNumber as string) || "+918884942210",
        instagramHandle: (data.instagramHandle as string) || "@crestyve",
        email: (data.email as string) || "hello@crestyve.com",
        ...data,
      } as never,
      update: data as never,
    });
    return row;
  },
};
```

- [ ] **Step 2: Create barrel `src/lib/db-repos.ts`**

```ts
export { categories } from "./repositories/categories";
export { products } from "./repositories/products";
export { testimonials } from "./repositories/testimonials";
export { awards } from "./repositories/awards";
export { gallery } from "./repositories/gallery";
export { messages } from "./repositories/messages";
export { settings } from "./repositories/settings";
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/repositories src/lib/db-repos.ts
git commit -m "feat: add remaining CMS Prisma repositories"
```

---

### Task 7: Seed script from `data/db.json`

**Files:**
- Create: `scripts/seed.ts`

**Interfaces:**
- Produces: idempotent-ish seed — upsert admin user; import categories/products/etc.; convert product prices with `rupeesToPaise`

- [ ] **Step 1: Implement `scripts/seed.ts`**

```ts
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { rupeesToPaise } from "../src/lib/money";

const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), "data", "db.json"), "utf-8");
  const db = JSON.parse(raw);

  const email = process.env.ADMIN_EMAIL || "admin@crestyve.com";
  const password = process.env.ADMIN_PASSWORD || "crestyve2024";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name: "Admin" },
    create: { email, passwordHash, role: "ADMIN", name: "Admin" },
  });

  for (const c of db.categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        image: c.image,
        order: c.order ?? 0,
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        order: c.order ?? 0,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
    });
  }

  for (const p of db.products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        pricePaise: rupeesToPaise(Number(p.price)),
        images: p.images || [],
        video: p.video || null,
        categoryId: p.categoryId,
        materials: p.materials || [],
        sizes: p.sizes || [],
        available: p.available ?? true,
        featured: p.featured ?? false,
        artistNotes: p.artistNotes,
        beforeImage: p.beforeImage,
        afterImage: p.afterImage,
        order: p.order ?? 0,
      },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        pricePaise: rupeesToPaise(Number(p.price)),
        images: p.images || [],
        video: p.video || null,
        categoryId: p.categoryId,
        materials: p.materials || [],
        sizes: p.sizes || [],
        available: p.available ?? true,
        featured: p.featured ?? false,
        artistNotes: p.artistNotes,
        beforeImage: p.beforeImage,
        afterImage: p.afterImage,
        order: p.order ?? 0,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
    });
  }

  // Similarly upsert testimonials, awards, gallery by id; settings upsert id default; messages createMany skipDuplicates

  const s = db.settings;
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      heroTitle: s.heroTitle,
      heroSubtitle: s.heroSubtitle,
      heroVideo: s.heroVideo,
      aboutTitle: s.aboutTitle,
      aboutContent: s.aboutContent,
      artistImage: s.artistImage,
      whatsappNumber: s.whatsappNumber,
      instagramHandle: s.instagramHandle,
      email: s.email,
      studioAddress: s.studioAddress,
      mapEmbedUrl: s.mapEmbedUrl,
    },
    create: {
      id: "default",
      heroTitle: s.heroTitle,
      heroSubtitle: s.heroSubtitle,
      heroVideo: s.heroVideo,
      aboutTitle: s.aboutTitle,
      aboutContent: s.aboutContent,
      artistImage: s.artistImage,
      whatsappNumber: s.whatsappNumber,
      instagramHandle: s.instagramHandle,
      email: s.email,
      studioAddress: s.studioAddress,
      mapEmbedUrl: s.mapEmbedUrl,
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Implement testimonials/awards/gallery/messages loops the same way (preserve ids from JSON when present).

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected: `Seed complete`; verify in Neon console or `npx prisma studio` that products show `pricePaise` = 100× JSON price.

- [ ] **Step 3: Commit**

```bash
git add scripts/seed.ts
git commit -m "feat: add db.json seed script for Neon"
```

---

### Task 8: Wire APIs + storefront to Prisma repos

**Files:**
- Modify: all `src/app/api/admin/**/route.ts` — change import from `@/lib/json-db` to `@/lib/db-repos` and `await` calls
- Modify: `src/app/api/contact/route.ts` — same
- Modify: `src/lib/db.ts` — import from `@/lib/db-repos` and await
- Create: `src/lib/admin-auth.ts`
- Modify: admin routes to call `requireAdmin()` on POST/PATCH/DELETE (and optionally GET)

**Interfaces:**
- Produces: `requireAdmin(): Promise<{ email: string; role: string }>` throws/returns 401 response helper

- [ ] **Step 1: Create `src/lib/admin-auth.ts`**

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}
```

- [ ] **Step 2: Update product routes example**

In `src/app/api/admin/products/route.ts`:

```ts
import { products } from "@/lib/db-repos";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  // ... same, but: const result = await products.findMany({ page, limit });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  // ... await products.create(...)
}
```

Apply the same pattern to every admin route file listed under `src/app/api/admin/`.

- [ ] **Step 3: Update `src/lib/db.ts`**

```ts
import { products, categories, testimonials, awards, gallery, messages, settings } from "./db-repos";

export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
}) {
  const result = await products.findMany();
  let items = result.products;
  // ... existing filters
  return items;
}

// await all other helpers similarly
```

- [ ] **Step 4: Update contact route**

```ts
await messages.create({ name, email, phone, subject, message });
```

- [ ] **Step 5: Manual verify**

```bash
npm run dev
```

- Open storefront — products load  
- Login admin — create a product — refresh — still present  
- Restart `npm run dev` — product still present (proves not `/tmp`)

- [ ] **Step 6: Commit**

```bash
git add src/app/api src/lib/db.ts src/lib/admin-auth.ts
git commit -m "feat: switch CMS APIs and storefront reads to Prisma"
```

---

### Task 9: Auth against database User

**Files:**
- Modify: `src/lib/auth.ts`

**Interfaces:**
- Consumes: `prisma.user.findUnique({ where: { email } })`, `bcrypt.compare`
- Produces: same NextAuth session shape with `role`

- [ ] **Step 1: Replace credentials authorize**

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== "ADMIN") return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? "Admin",
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
```

Remove hardcoded password fallback for production safety. Ensure seed created the admin user before testing login.

- [ ] **Step 2: Verify login** with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts
git commit -m "feat: authenticate admin against Prisma User with bcrypt"
```

---

### Task 10: Retire json-db writes + docs

**Files:**
- Modify: `src/lib/json-db.ts` — add file-top comment `DEPRECATED: use @/lib/db-repos` OR delete if no imports remain
- Grep for `json-db` and remove remaining imports
- Modify: `README.md` — accurate Prisma/Neon setup; remove false claims if any; document seed and Phase 1 acceptance

- [ ] **Step 1: Grep and remove**

```bash
rg "json-db" src
```

Expected: no imports (or only deprecated file). Delete `src/lib/json-db.ts` if unused; keep `data/db.json` as seed source only.

- [ ] **Step 2: Update README deployment section** with Neon + `prisma db push` + `npm run db:seed` + Vercel env `DATABASE_URL` + build `prisma generate && next build`

- [ ] **Step 3: Final verification checklist**

- [ ] `npm test` passes  
- [ ] `npm run build` succeeds with `DATABASE_URL` set  
- [ ] Admin CRUD persists after restart  
- [ ] Contact form writes to Neon  
- [ ] No `/tmp/db.json` usage in code paths  

- [ ] **Step 4: Commit**

```bash
git add src/lib/json-db.ts README.md
git commit -m "chore: retire json-db runtime and document Neon CMS setup"
```

---

## Phase 1 Self-Review

| Spec requirement | Task |
|------------------|------|
| Root cause fixed (no filesystem DB) | Tasks 3–8, 10 |
| Neon + Prisma | Tasks 1, 3 |
| Seed from db.json | Task 7 |
| Secure admin auth | Tasks 8–9 |
| CMS CRUD APIs | Task 8 |
| Money as paise | Tasks 2, 5, 7 |
| Full schema for later phases | Task 3 |
| Env configuration | Task 1 |
| Validation / errors | Kept + requireAdmin; Zod can deepen in Phase 2 |

---

## Execution Handoff

After Phase 1 is done, implement Phase 2 plan then Phase 3 plan.

**Plan complete and saved.** See also Phase 2 and Phase 3 plan files in the same folder.
