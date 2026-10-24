export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import { gallery } from "@/lib/db-repos";

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const images = await gallery.findMany();
    return NextResponse.json(images);
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
    return errorResponse(error, "Failed to fetch gallery images");
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
    return errorResponse(error, "Failed to create gallery image");
  }
}
