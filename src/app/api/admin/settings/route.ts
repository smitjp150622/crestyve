export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import { settings } from "@/lib/db-repos";

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const siteSettings = await settings.get();
    return NextResponse.json(siteSettings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return errorResponse(error, "Failed to fetch settings");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const body = await request.json();
    const updated = await settings.update(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return errorResponse(error, "Failed to update settings");
  }
}
