export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import { inquiries } from "@/lib/repositories/inquiries";
import { inquiryStatusSchema } from "@/lib/validations/inquiry";

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const parsedStatus = statusParam ? inquiryStatusSchema.safeParse(statusParam) : null;

    const items = await inquiries.findMany(
      parsedStatus?.success ? { status: parsedStatus.data } : undefined
    );
    return NextResponse.json(items);
  } catch (error) {
    console.error("Failed to fetch inquiries:", error);
    return errorResponse(error, "Failed to fetch inquiries");
  }
}
