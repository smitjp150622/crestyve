# Crestyve Maintenance Guide

## Architecture

- **App:** Next.js 16 on Vercel
- **DB:** Neon PostgreSQL via Prisma 6 (`prisma/schema.prisma`)
- **Auth:** NextAuth credentials → `User` with role `ADMIN`
- **Payments:** Razorpay Checkout + webhook
- **Email:** Resend (optional)
- **Media:** Cloudinary

Do **not** write CMS data to `data/db.json` at runtime — that file is seed-only.

## Environment variables

See `.env.example`. Required for production:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | NextAuth JWT secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin (change after first login) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Checkout |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification |
| `CLOUDINARY_*` | Image uploads |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Optional order emails |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL |

## Database

```bash
npx prisma generate
npx prisma db push          # or prisma migrate deploy in CI
npm run db:seed             # once: imports data/db.json + creates admin
```

Money is stored as **integer paise**. Admin/API JSON still exposes prices in **rupees**.

## Razorpay webhook

Dashboard → Webhooks → URL:

`https://<your-domain>/api/webhooks/razorpay`

Events: `payment.captured`, `order.paid`

Use the webhook secret as `RAZORPAY_WEBHOOK_SECRET`.

Payment confirmation is idempotent: stock and coupon usage decrement only once.

## Purchase flows

1. **WhatsApp** — Product → Buy via WhatsApp → `POST /api/inquiries` → opens `wa.me` → Admin → Inquiries
2. **Online** — Add to bag → Checkout → Razorpay → verify + webhook → `/order/[orderNumber]?email=` → invoice at `/api/orders/[orderNumber]/invoice?email=`

## Admin

- `/admin/login` — admin only
- Products support overall + per-size stock
- Coupons: percent or fixed INR
- Orders: filter by fulfillment + payment status; print invoice
- Dashboard: live product / message / inquiry / order / revenue stats

## Rotating secrets

1. Update env in Vercel
2. Redeploy
3. For Razorpay, rotate keys in Razorpay dashboard then update env
4. Re-seed admin password: update `ADMIN_PASSWORD` and re-run seed upsert, or change hash in DB

## Smoke test checklist

- [ ] Admin login works
- [ ] Create/edit product persists after redeploy
- [ ] WhatsApp inquiry appears in Admin → Inquiries
- [ ] Checkout with Razorpay **test** keys completes
- [ ] Order shows PAID; stock decremented once
- [ ] Duplicate webhook does not double-decrement
- [ ] Invoice downloads for admin and guest email
- [ ] Confirmation email sends when Resend is configured
