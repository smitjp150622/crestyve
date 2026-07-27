# CRESTYVE — Wear Your Story

A luxury handcrafted fashion website built with Next.js 15. This is **not** an e-commerce site — it's a storytelling and lead generation platform designed as an Awwwards-quality immersive experience.

Every interaction guides visitors toward contacting the artist through WhatsApp.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** GSAP, Lenis (smooth scroll), Framer Motion
- **Database:** Neon PostgreSQL via Prisma ORM (not `db.json` — serverless hosts cannot persist filesystem writes)
- **Auth:** NextAuth.js (admin user in Postgres, bcrypt)
- **Media:** Cloudinary
- **Forms:** React Hook Form + Zod
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Neon (or any) PostgreSQL database

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and set at least:

- `DATABASE_URL` — Neon connection string
- `AUTH_SECRET` — random secret
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used by seed to create the admin user

```bash
cp .env.example .env
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Seed imports `data/db.json` into Postgres (prices stored as integer paise) and creates the admin user.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: `/admin/login`.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel
│   ├── about/             # About page
│   ├── collections/       # Collections page
│   ├── contact/           # Contact page
│   ├── gallery/           # Gallery page
│   ├── journal/           # Blog/Journal page
│   ├── lookbook/          # Lookbook page
│   ├── products/[slug]/   # Product detail page
│   └── api/               # API routes
├── components/
│   ├── layout/            # Navbar, Footer, WhatsApp float
│   ├── sections/          # Page sections (Hero, Story, etc.)
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities, Prisma client
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── constants/             # Site configuration
```

## Design System

- **Primary:** #8B1C3F (Deep Burgundy)
- **Secondary:** #D4A731 (Luxury Gold)
- **Dark:** #111111
- **Light:** #FAFAF8 (Warm White)
- **Typography:** Cormorant Garamond (display), Inter (body), Manrope (UI)

## Features

- Immersive storytelling scroll experience
- Full-screen video hero
- Horizontal scroll gallery
- Parallax and pinned sections
- Smooth scroll (Lenis)
- Animated statistics counters
- WhatsApp integration on every product
- Responsive across all devices
- Admin panel for content management
- Contact form with API
- Masonry gallery with lightbox
- Timeline component
- Testimonial slider

## Deployment

Deploy to Vercel:

```bash
vercel
```

Set environment variables in Vercel dashboard.

## License

Private — All rights reserved.
