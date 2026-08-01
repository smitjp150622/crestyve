import { z } from "zod";

export const couponUpsertSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(32)
    .transform((c) => c.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrderRupees: z.number().min(0).optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1),
  subtotalRupees: z.number().nonnegative(),
});
