import { NextResponse } from "next/server";
import { settings } from "@/lib/db-repos";
import { paiseToRupees } from "@/lib/money";

export async function GET() {
  try {
    const site = await settings.get();
    return NextResponse.json({
      shippingRupees: paiseToRupees(site.shippingPaise ?? 0),
    });
  } catch (error) {
    console.error("Failed to fetch shipping:", error);
    return NextResponse.json({ shippingRupees: 0 });
  }
}
