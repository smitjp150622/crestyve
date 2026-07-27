export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { products } from "@/lib/db-repos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const product = await products.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const sizeStocks = await products.getSizeStocks(id);
    return NextResponse.json({ ...product, sizeStocks });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const body = await request.json();

    const product = await products.update(id, {
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
      stock: body.stock,
      sizeStocks: Array.isArray(body.sizeStocks) ? body.sizeStocks : undefined,
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
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { id } = await params;
    const deleted = await products.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
