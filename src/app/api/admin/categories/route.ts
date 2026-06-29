export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { categories } from "@/lib/json-db";

export async function GET() {
  try {
    const allCategories = categories.findMany({ orderBy: "order" });
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug" },
        { status: 400 }
      );
    }

    const category = categories.create({
      name,
      slug,
      description: body.description || "",
      image: body.image || "",
      order: body.order ?? 0,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
