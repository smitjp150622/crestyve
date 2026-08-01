import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/cms";
import { priceInputToPaise, toProductDto } from "./product-mapper";

export interface SizeStockInput {
  size: string;
  stock: number;
}

type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & {
  stock?: number | null;
  sizeStocks?: SizeStockInput[];
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
    const { sizeStocks, ...rest } = data;
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: rest.name,
          slug: rest.slug,
          description: rest.description,
          pricePaise: priceInputToPaise(rest.price),
          images: rest.images,
          video: rest.video,
          categoryId: rest.categoryId,
          materials: rest.materials,
          sizes: rest.sizes,
          available: rest.available,
          featured: rest.featured,
          artistNotes: rest.artistNotes,
          beforeImage: rest.beforeImage,
          afterImage: rest.afterImage,
          order: rest.order,
          stock: rest.stock ?? null,
        },
      });

      if (sizeStocks && sizeStocks.length > 0) {
        await tx.productSizeStock.createMany({
          data: sizeStocks.map((s) => ({
            productId: created.id,
            size: s.size,
            stock: s.stock,
          })),
        });
      }

      return tx.product.findUniqueOrThrow({
        where: { id: created.id },
        include: { category: true },
      });
    });

    return toProductDto(product);
  },

  async update(id: string, data: Partial<ProductInput>) {
    const { sizeStocks, ...rest } = data;
    try {
      const product = await prisma.$transaction(async (tx) => {
        const updated = await tx.product.update({
          where: { id },
          data: {
            ...(rest.name !== undefined && { name: rest.name }),
            ...(rest.slug !== undefined && { slug: rest.slug }),
            ...(rest.description !== undefined && { description: rest.description }),
            ...(rest.price !== undefined && { pricePaise: priceInputToPaise(rest.price) }),
            ...(rest.images !== undefined && { images: rest.images }),
            ...(rest.video !== undefined && { video: rest.video }),
            ...(rest.categoryId !== undefined && { categoryId: rest.categoryId }),
            ...(rest.materials !== undefined && { materials: rest.materials }),
            ...(rest.sizes !== undefined && { sizes: rest.sizes }),
            ...(rest.available !== undefined && { available: rest.available }),
            ...(rest.featured !== undefined && { featured: rest.featured }),
            ...(rest.artistNotes !== undefined && { artistNotes: rest.artistNotes }),
            ...(rest.beforeImage !== undefined && { beforeImage: rest.beforeImage }),
            ...(rest.afterImage !== undefined && { afterImage: rest.afterImage }),
            ...(rest.order !== undefined && { order: rest.order }),
            ...(rest.stock !== undefined && { stock: rest.stock }),
          },
        });

        if (sizeStocks !== undefined) {
          await tx.productSizeStock.deleteMany({ where: { productId: id } });
          if (sizeStocks.length > 0) {
            await tx.productSizeStock.createMany({
              data: sizeStocks.map((s) => ({
                productId: id,
                size: s.size,
                stock: s.stock,
              })),
            });
          }
        }

        return tx.product.findUniqueOrThrow({
          where: { id },
          include: { category: true },
        });
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

  async findManyForCheckout(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } },
      include: { sizeStocks: true },
    });
  },

  async getSizeStocks(productId: string): Promise<SizeStockInput[]> {
    const rows = await prisma.productSizeStock.findMany({
      where: { productId },
      select: { size: true, stock: true },
    });
    return rows;
  },
};
