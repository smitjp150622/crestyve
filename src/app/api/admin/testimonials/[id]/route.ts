export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import { testimonials } from "@/lib/db-repos";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const body = await request.json();

    const testimonial = await testimonials.update(id, {
      name: body.name,
      role: body.role,
      content: body.content,
      image: body.image,
      featured: body.featured,
      order: body.order,
    });

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return errorResponse(error, "Failed to update testimonial");
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
    const deleted = await testimonials.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return errorResponse(error, "Failed to delete testimonial");
  }
}
