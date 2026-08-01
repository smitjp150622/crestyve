import { prisma } from "@/lib/prisma";
import type { Testimonial } from "@/types/cms";

function map(t: {
  id: string;
  name: string;
  role: string | null;
  content: string;
  image: string | null;
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): Testimonial {
  return {
    id: t.id,
    name: t.name,
    role: t.role ?? undefined,
    content: t.content,
    image: t.image ?? undefined,
    featured: t.featured,
    order: t.order,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

export const testimonials = {
  async findMany() {
    const items = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });
    return items.map(map);
  },

  async create(data: Omit<Testimonial, "id" | "createdAt" | "updatedAt">) {
    return map(
      await prisma.testimonial.create({
        data: {
          name: data.name,
          role: data.role,
          content: data.content,
          image: data.image,
          featured: data.featured,
          order: data.order,
        },
      })
    );
  },

  async update(id: string, data: Partial<Omit<Testimonial, "id" | "createdAt">>) {
    try {
      return map(
        await prisma.testimonial.update({
          where: { id },
          data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.role !== undefined && { role: data.role }),
            ...(data.content !== undefined && { content: data.content }),
            ...(data.image !== undefined && { image: data.image }),
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
      await prisma.testimonial.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
