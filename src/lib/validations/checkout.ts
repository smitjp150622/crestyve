import { z } from "zod";

export const shippingAddressSchema = z.object({
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(4).max(10),
  country: z.string().min(1).max(100).default("India"),
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  size: z.string().max(20).optional().nullable(),
  qty: z.number().int().positive().max(50),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  shippingAddress: shippingAddressSchema,
  items: z.array(checkoutItemSchema).min(1).max(50),
  couponCode: z.string().max(32).optional().or(z.literal("")),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
