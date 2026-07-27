import { NextRequest, NextResponse } from "next/server";
import { inquiryCreateSchema } from "@/lib/validations/inquiry";
import { inquiries } from "@/lib/repositories/inquiries";
import { settings } from "@/lib/db-repos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = inquiryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const inquiry = await inquiries.create({
      ...parsed.data,
      email: parsed.data.email || undefined,
      source: "WHATSAPP",
    });

    const site = await settings.get();
    const phone = site.whatsappNumber.replace(/[^\d]/g, "");
    const snap = inquiry.productSnapshot as {
      name: string;
      price: number;
      selectedSize?: string | null;
    };
    const text = encodeURIComponent(
      `Hi Crestyve! I'd like to order:\n` +
        `Product: ${snap.name}\n` +
        (snap.selectedSize ? `Size: ${snap.selectedSize}\n` : "") +
        `Price: ₹${snap.price}\n` +
        `Ref: ${inquiry.id.slice(0, 8)}\n` +
        `Name: ${inquiry.customerName}\n` +
        `Phone: ${inquiry.phone}`
    );
    const whatsappUrl = `https://wa.me/${phone}?text=${text}`;

    return NextResponse.json({ inquiryId: inquiry.id, whatsappUrl }, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("Failed to create inquiry:", e);
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
