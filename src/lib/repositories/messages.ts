import { prisma } from "@/lib/prisma";
import type { ContactMessage } from "@/types/cms";

function map(m: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: Date;
}): ContactMessage {
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone ?? undefined,
    subject: m.subject ?? undefined,
    message: m.message,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  };
}

export const messages = {
  async findMany(filter?: { read?: boolean }) {
    const items = await prisma.contactMessage.findMany({
      where: filter?.read !== undefined ? { read: filter.read } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return items.map(map);
  },

  async create(data: Omit<ContactMessage, "id" | "read" | "createdAt">) {
    return map(
      await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          read: false,
        },
      })
    );
  },

  async markAsRead(ids: string[]) {
    const result = await prisma.contactMessage.updateMany({
      where: { id: { in: ids } },
      data: { read: true },
    });
    return result.count;
  },

  async delete(id: string) {
    try {
      await prisma.contactMessage.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },
};
