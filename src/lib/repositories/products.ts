import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/cms";
import { priceInputToPaise, toProductDto } from "./product-mapper";

type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & {
  stock?: number | null;
};

export const products = {
  async findMany(options?: { page?: number; limit?: number }) {
    const total = await prisma.product.count();
    const skip =
      options?.page && options?.limit ? (options.page - 1) * options.limit : undefined;
    const take = options?.limit;

    const items = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    return { products: items.map(toProductDto), total };
  },

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    return product ? toProductDto(product) : null;
  },

  async findBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    return product ? toProductDto(product) : null;
  },

  async create(data: ProductInput) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        pricePaise: priceInputToPaise(data.price),
        images: data.images,
        video: data.video,
        categoryId: data.categoryId,
        materials: data.materials,
        sizes: data.sizes,
        available: data.available,
        featured: data.featured,
        artistNotes: data.artistNotes,
        beforeImage: data.beforeImage,
        afterImage: data.afterImage,
        order: data.order,
        stock: data.stock ?? null,
      },
      include: { category: true },
    });
    return toProductDto(product);
  },

  async update(id: string, data: Partial<ProductInput>) {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.price !== undefined && { pricePaise: priceInputToPaise(data.price) }),
          ...(data.images !== undefined && { images: data.images }),
          ...(data.video !== undefined && { video: data.video }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.materials !== undefined && { materials: data.materials }),
          ...(data.sizes !== undefined && { sizes: data.sizes }),
          ...(data.available !== undefined && { available: data.available }),
          ...(data.featured !== undefined && { featured: data.featured }),
          ...(data.artistNotes !== undefined && { artistNotes: data.artistNotes }),
          ...(data.beforeImage !== undefined && { beforeImage: data.beforeImage }),
          ...(data.afterImage !== undefined && { afterImage: data.afterImage }),
          ...(data.order !== undefined && { order: data.order }),
          ...(data.stock !== undefined && { stock: data.stock }),
        },
        include: { category: true },
      });
      return toProductDto(product);
    } catch {
      return null;
    }
  },

  async delete(id: string) {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async countByCategory(categoryId: string) {
    return prisma.product.count({ where: { categoryId } });
  },
};
