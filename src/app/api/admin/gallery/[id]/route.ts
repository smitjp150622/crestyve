export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { gallery } from "@/lib/db-repos";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const body = await request.json();

    const image = await gallery.update(id, body);

    if (!image) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Failed to update gallery image:", error);
    return NextResponse.json({ error: "Failed to update gallery image" }, { status: 500 });
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
    const deleted = await gallery.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete gallery image:", error);
    return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 });
  }
}
