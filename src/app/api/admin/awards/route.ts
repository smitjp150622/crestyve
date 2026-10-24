export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { awards } from "@/lib/db-repos";

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const allAwards = await awards.findMany();
    return NextResponse.json(allAwards);
  } catch (error) {
    console.error("Failed to fetch awards:", error);
    return NextResponse.json({ error: "Failed to fetch awards" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const body = await request.json();

    if (!body.title || !body.year) {
      return NextResponse.json(
        { error: "Missing required fields: title, year" },
        { status: 400 }
      );
    }

    const award = await awards.create({
      title: body.title,
      description: body.description || "",
      year: body.year,
      image: body.image || "",
      order: body.order ?? 0,
    });

    return NextResponse.json(award, { status: 201 });
  } catch (error) {
    console.error("Failed to create award:", error);
    return NextResponse.json({ error: "Failed to create award" }, { status: 500 });
  }
}
