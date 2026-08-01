import { prisma } from "@/lib/prisma";
import type { GalleryImage } from "@/types/cms";

function map(g: {
  id: string;
  title: string | null;
  url: string;
  category: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): GalleryImage {
  return {
    id: g.id,
    title: g.title ?? undefined,
    url: g.url,
    category: g.category ?? undefined,
    featured: g.featured,
    order: g.order,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  };
}

export const gallery = {
  async findMany() {
    const items = await prisma.galleryImage.findMany({ orderBy: { order: "asc" } });
    return items.map(map);
  },

  async create(data: Omit<GalleryImage, "id" | "createdAt" | "updatedAt">) {
    return map(
      await prisma.galleryImage.create({
        data: {
          title: data.title,
          url: data.url,
          category: data.category,
          featured: data.featured,
          order: data.order,
        },
      })
    );
  },

  async update(id: string, data: Partial<Omit<GalleryImage, "id" | "createdAt">>) {
    try {
      return map(
        await prisma.galleryImage.update({
          where: { id },
          data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.url !== undefined && { url: data.url }),
            ...(data.category !== undefined && { category: data.category }),
            ...(data.featured !== undefined && { featured: data.featured }),
            ...(data.order !== undefined && { order: data.order }),
          },
        })
      );
    } catch {
      return null;
    }
  },

  async delete(id: string) {
    try {
      await prisma.galleryImage.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
