export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import { messages } from "@/lib/db-repos";

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { searchParams } = new URL(request.url);
    const readFilter = searchParams.get("read");

    const filter: { read?: boolean } = {};
    if (readFilter === "true") filter.read = true;
    if (readFilter === "false") filter.read = false;

    const allMessages = await messages.findMany(filter);
    return NextResponse.json(allMessages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return errorResponse(error, "Failed to fetch messages");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const body = await request.json();
    const { ids } = body as { ids: string[] };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: ids (string[])" },
        { status: 400 }
      );
    }

    const count = await messages.markAsRead(ids);
    return NextResponse.json({ success: true, markedRead: count });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return errorResponse(error, "Failed to mark messages as read");
  }
}
