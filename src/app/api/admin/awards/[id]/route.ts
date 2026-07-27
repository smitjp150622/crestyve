export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { awards } from "@/lib/db-repos";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const body = await request.json();

    const award = await awards.update(id, body);

    if (!award) {
      return NextResponse.json({ error: "Award not found" }, { status: 404 });
    }

    return NextResponse.json(award);
  } catch (error) {
    console.error("Failed to update award:", error);
    return NextResponse.json({ error: "Failed to update award" }, { status: 500 });
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
    const deleted = await awards.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Award not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete award:", error);
    return NextResponse.json({ error: "Failed to delete award" }, { status: 500 });
  }
}
