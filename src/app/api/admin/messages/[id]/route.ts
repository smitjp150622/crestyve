export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { messages } from "@/lib/json-db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = messages.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete message:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
