import { prisma } from "@/lib/prisma";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";
import type { Coupon, CouponType } from "@prisma/client";

export function computeDiscountPaise(
  type: CouponType,
  value: number,
  subtotalPaise: number
): number {
  if (type === "PERCENT") {
    return Math.min(subtotalPaise, Math.floor((subtotalPaise * value) / 100));
  }
  return Math.min(subtotalPaise, value);
}

function toDto(c: Coupon) {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.type === "FIXED" ? paiseToRupees(c.value) : c.value,
    minOrderRupees: c.minOrderPaise != null ? paiseToRupees(c.minOrderPaise) : undefined,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    startsAt: c.startsAt?.toISOString() ?? null,
    endsAt: c.endsAt?.toISOString() ?? null,
    active: c.active,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export const coupons = {
  async findMany() {
    const items = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return items.map(toDto);
  },

  async create(input: {
    code: string;
    type: CouponType;
    value: number;
    minOrderRupees?: number;
    maxUses?: number | null;
    startsAt?: string | null;
    endsAt?: string | null;
    active: boolean;
  }) {
    const c = await prisma.coupon.create({
      data: {
        code: input.code,
        type: input.type,
        value: input.type === "FIXED" ? rupeesToPaise(input.value) : Math.round(input.value),
        minOrderPaise:
          input.minOrderRupees !== undefined ? rupeesToPaise(input.minOrderRupees) : null,
        maxUses: input.maxUses ?? null,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        active: input.active,
      },
    });
    return toDto(c);
  },

  async update(
    id: string,
    input: Partial<{
      code: string;
      type: CouponType;
      value: number;
      minOrderRupees: number | null;
      maxUses: number | null;
      startsAt: string | null;
      endsAt: string | null;
      active: boolean;
    }>
  ) {
    try {
      const existing = await prisma.coupon.findUnique({ where: { id } });
      if (!existing) return null;
      const type = input.type ?? existing.type;

      const c = await prisma.coupon.update({
        where: { id },
        data: {
          ...(input.code !== undefined && { code: input.code }),
          ...(input.type !== undefined && { type: input.type }),
          ...(input.value !== undefined && {
            value: type === "FIXED" ? rupeesToPaise(input.value) : Math.round(input.value),
          }),
          ...(input.minOrderRupees !== undefined && {
            minOrderPaise:
              input.minOrderRupees === null ? null : rupeesToPaise(input.minOrderRupees),
          }),
          ...(input.maxUses !== undefined && { maxUses: input.maxUses }),
          ...(input.startsAt !== undefined && {
            startsAt: input.startsAt ? new Date(input.startsAt) : null,
          }),
          ...(input.endsAt !== undefined && {
            endsAt: input.endsAt ? new Date(input.endsAt) : null,
          }),
          ...(input.active !== undefined && { active: input.active }),
        },
      });
      return toDto(c);
    } catch {
      return null;
    }
  },

  async delete(id: string) {
    try {
      await prisma.coupon.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async validate(code: string, subtotalPaise: number) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return { ok: false as const, error: "Coupon not found" };
    if (!coupon.active) return { ok: false as const, error: "Coupon is not active" };

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return { ok: false as const, error: "Coupon is not yet valid" };
    }
    if (coupon.endsAt && now > coupon.endsAt) {
      return { ok: false as const, error: "Coupon has expired" };
    }
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
      return { ok: false as const, error: "Coupon usage limit reached" };
    }
    if (coupon.minOrderPaise != null && subtotalPaise < coupon.minOrderPaise) {
      return {
        ok: false as const,
        error: `Minimum order of ₹${paiseToRupees(coupon.minOrderPaise)} required`,
      };
    }

    const discountPaise = computeDiscountPaise(coupon.type, coupon.value, subtotalPaise);
    return { ok: true as const, discountPaise, coupon: toDto(coupon) };
  },
};
