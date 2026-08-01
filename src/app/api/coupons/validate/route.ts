import { NextRequest, NextResponse } from "next/server";
import { coupons } from "@/lib/repositories/coupons";
import { couponValidateSchema } from "@/lib/validations/coupon";
import { paiseToRupees, rupeesToPaise } from "@/lib/money";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const result = await coupons.validate(
      parsed.data.code,
      rupeesToPaise(parsed.data.subtotalRupees)
    );

    if (!result.ok) {
      return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discountRupees: paiseToRupees(result.discountPaise),
      coupon: { code: result.coupon.code, type: result.coupon.type },
    });
  } catch (error) {
    console.error("Failed to validate coupon:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
