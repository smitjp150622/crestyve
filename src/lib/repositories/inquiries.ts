import { prisma } from "@/lib/prisma";
import type { InquiryStatus, InquirySource } from "@prisma/client";
import { paiseToRupees } from "@/lib/money";

export const inquiries = {
  async create(input: {
    customerName: string;
    phone: string;
    email?: string;
    productId: string;
    selectedSize?: string;
    message?: string;
    source?: InquirySource;
  }) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const productSnapshot = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: paiseToRupees(product.pricePaise),
      image: product.images[0] ?? null,
      selectedSize: input.selectedSize ?? null,
    };

    return prisma.inquiry.create({
      data: {
        customerName: input.customerName,
        phone: input.phone,
        email: input.email || null,
        productId: product.id,
        productSnapshot,
        selectedSize: input.selectedSize,
        message: input.message,
        source: input.source ?? "WHATSAPP",
        status: "NEW",
      },
    });
  },

  async findMany(filter?: { status?: InquiryStatus }) {
    return prisma.inquiry.findMany({
      where: filter?.status ? { status: filter.status } : undefined,
      orderBy: { createdAt: "desc" },
      include: { product: true },
    });
  },

  async updateStatus(id: string, status: InquiryStatus) {
    try {
      return await prisma.inquiry.update({ where: { id }, data: { status } });
    } catch {
      return null;
    }
  },

  async delete(id: string) {
    try {
      await prisma.inquiry.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
