import { prisma } from "@/lib/prisma";
import type { Award } from "@/types/cms";

function map(a: {
  id: string;
  title: string;
  description: string | null;
  year: number;
  image: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): Award {
  return {
    id: a.id,
    title: a.title,
    description: a.description ?? undefined,
    year: a.year,
    image: a.image ?? undefined,
    order: a.order,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export const awards = {
  async findMany() {
    const items = await prisma.award.findMany({ orderBy: { order: "asc" } });
    return items.map(map);
  },

  async create(data: Omit<Award, "id" | "createdAt" | "updatedAt">) {
    return map(
      await prisma.award.create({
        data: {
          title: data.title,
          description: data.description,
          year: data.year,
          image: data.image,
          order: data.order,
        },
      })
    );
  },

  async update(id: string, data: Partial<Omit<Award, "id" | "createdAt">>) {
    try {
      return map(
        await prisma.award.update({
          where: { id },
          data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.year !== undefined && { year: data.year }),
            ...(data.image !== undefined && { image: data.image }),
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
      await prisma.award.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
