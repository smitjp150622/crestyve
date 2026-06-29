export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { testimonials } from "@/lib/json-db";

export async function GET() {
  try {
    const allTestimonials = testimonials.findMany();
    return NextResponse.json(allTestimonials);
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, content } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Missing required fields: name, content" },
        { status: 400 }
      );
    }

    const testimonial = testimonials.create({
      name,
      role: body.role || "",
      content,
      image: body.image || "",
      featured: body.featured ?? false,
      order: body.order ?? 0,
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
