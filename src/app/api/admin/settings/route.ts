export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { settings } from "@/lib/json-db";

export async function GET() {
  try {
    const siteSettings = settings.get();
    return NextResponse.json(siteSettings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = settings.update(body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
