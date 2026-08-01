# CRESTYVE — Wear Your Story

Luxury handcrafted fashion storefront with CMS admin, WhatsApp ordering, and Razorpay checkout.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP, Lenis, Framer Motion
- **Database:** Neon PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (admin in Postgres, bcrypt)
- **Payments:** Razorpay
- **Email:** Resend (optional)
- **Media:** Cloudinary
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Neon (or any) PostgreSQL database

### Installation

```bash
npm install
cp .env.example .env
```

Fill at least `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### Database

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### Development

```bash
npm run dev
```

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Tests

```bash
npm test
```

## Features

- CMS: products, categories, gallery, testimonials, awards, settings
- WhatsApp buy flow with admin inquiry management
- Shopping bag + Razorpay checkout + order confirmation
- Coupons, stock (product + size), invoices
- Admin dashboard analytics and order management

## Deployment (Vercel)

1. Create Neon project → set `DATABASE_URL`
2. Set all env vars from `.env.example` in Vercel
3. Build command: `prisma generate && next build` (already in `package.json`)
4. After first deploy: run `prisma db push` + `npm run db:seed` against Neon (locally with production `DATABASE_URL`, or a one-off job)
5. Configure Razorpay webhook: `https://<domain>/api/webhooks/razorpay`

See [docs/maintenance.md](docs/maintenance.md) for ops details.

## Design System

- **Primary:** #8B1C3F (Deep Burgundy)
- **Secondary:** #D4A731 (Luxury Gold)
- **Dark:** #111111
- **Light:** #FAFAF8 (Warm White)
- **Typography:** Cormorant Garamond, Inter, Manrope

## License

Private — All rights reserved.
