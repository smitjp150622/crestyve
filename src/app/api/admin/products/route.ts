export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/lib/db-repos";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const result = await products.findMany({ page, limit });

    return NextResponse.json({
      products: result.products,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const body = await request.json();
    const { name, slug, price, categoryId } = body;

    if (!name || !slug || price == null || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, price, categoryId" },
        { status: 400 }
      );
    }

    const product = await products.create({
      name,
      slug,
      description: body.description || "",
      price,
      images: body.images || [],
      video: body.video || "",
      categoryId,
      materials: body.materials || [],
      sizes: body.sizes || [],
      available: body.available ?? true,
      featured: body.featured ?? false,
      artistNotes: body.artistNotes || "",
      beforeImage: body.beforeImage,
      afterImage: body.afterImage,
      order: body.order ?? 0,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
