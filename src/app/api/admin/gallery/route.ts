export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { gallery } from "@/lib/db-repos";

export async function GET() {
  try {
    const images = await gallery.findMany();
    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const body = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { error: "Missing required field: url" },
        { status: 400 }
      );
    }

    const image = await gallery.create({
      title: body.title || "",
      url: body.url,
      category: body.category || "",
      featured: body.featured ?? false,
      order: body.order ?? 0,
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Failed to create gallery image:", error);
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 });
  }
}
