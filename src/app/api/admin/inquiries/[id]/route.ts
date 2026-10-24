export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import { inquiries } from "@/lib/repositories/inquiries";
import { inquiryStatusSchema } from "@/lib/validations/inquiry";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { id } = await params;
    const body = await request.json();
    const parsed = inquiryStatusSchema.safeParse(body.status);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await inquiries.updateStatus(id, parsed.data);
    if (!updated) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update inquiry:", error);
    return errorResponse(error, "Failed to update inquiry");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { id } = await params;
    const deleted = await inquiries.delete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete inquiry:", error);
    return errorResponse(error, "Failed to delete inquiry");
  }
}
