export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalProducts,
      productsThisMonth,
      totalInquiries,
      inquiriesThisWeek,
      unreadMessages,
      totalOrders,
      ordersThisMonth,
      revenueAgg,
      recentMessages,
      recentInquiries,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalPaise: true },
      }),
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      totalProducts,
      productsThisMonth,
      totalInquiries,
      inquiriesThisWeek,
      unreadMessages,
      totalOrders,
      ordersThisMonth,
      revenuePaise: revenueAgg._sum.totalPaise ?? 0,
      recentMessages: recentMessages.map((m) => ({
        id: m.id,
        name: m.name,
        subject: m.subject ?? m.message.slice(0, 60),
        read: m.read,
        createdAt: m.createdAt.toISOString(),
      })),
      recentInquiries: recentInquiries.map((i) => ({
        id: i.id,
        customerName: i.customerName,
        status: i.status,
        createdAt: i.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
