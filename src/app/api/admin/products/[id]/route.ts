export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/json-db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const product = products.update(id, {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      images: body.images,
      video: body.video,
      categoryId: body.categoryId,
      materials: body.materials,
      sizes: body.sizes,
      available: body.available,
      featured: body.featured,
      artistNotes: body.artistNotes,
      beforeImage: body.beforeImage,
      afterImage: body.afterImage,
      order: body.order,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = products.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
