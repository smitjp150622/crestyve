import { prisma } from "@/lib/prisma";
import type { Category } from "@/types/cms";

function mapCategory(c: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}): Category & { _count?: { products: number } } {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? undefined,
    image: c.image ?? undefined,
    order: c.order,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    _count: c._count,
  };
}

export const categories = {
  async findMany(options?: { orderBy?: string }) {
    const items = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: options?.orderBy === "order" ? { order: "asc" } : { createdAt: "desc" },
    });
    return items.map(mapCategory);
  },

  async findById(id: string) {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    return cat ? mapCategory(cat) : null;
  },

  async create(data: Omit<Category, "id" | "createdAt" | "updatedAt">) {
    const cat = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        order: data.order,
      },
      include: { _count: { select: { products: true } } },
    });
    return mapCategory(cat);
  },

  async update(id: string, data: Partial<Omit<Category, "id" | "createdAt">>) {
    try {
      const cat = await prisma.category.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.image !== undefined && { image: data.image }),
          ...(data.order !== undefined && { order: data.order }),
        },
        include: { _count: { select: { products: true } } },
      });
      return mapCategory(cat);
    } catch {
      return null;
    }
  },

  async delete(id: string) {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
