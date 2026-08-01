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
