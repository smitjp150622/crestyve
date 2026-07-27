import { prisma } from "@/lib/prisma";
import { paiseToRupees } from "@/lib/money";
import { generateOrderNumber } from "@/lib/orders/order-number";
import type { Order, OrderItem, OrderStatus } from "@prisma/client";

export interface OrderItemInput {
  productId: string | null;
  name: string;
  pricePaise: number;
  size: string | null;
  qty: number;
  image: string | null;
}

export interface CreatePendingOrderInput {
  customerName: string;
  email: string;
  phone: string;
  shippingAddress: Record<string, unknown>;
  items: OrderItemInput[];
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  couponId?: string | null;
  userId?: string | null;
}

type OrderWithItems = Order & { items: OrderItem[] };

function toDto(order: OrderWithItems) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    shippingAddress: order.shippingAddress,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: paiseToRupees(order.subtotalPaise),
    discount: paiseToRupees(order.discountPaise),
    shipping: paiseToRupees(order.shippingPaise),
    total: paiseToRupees(order.totalPaise),
    razorpayOrderId: order.razorpayOrderId,
    razorpayPaymentId: order.razorpayPaymentId,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: paiseToRupees(item.pricePaise),
      size: item.size,
      qty: item.qty,
      image: item.image,
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export const orders = {
  async createPending(input: CreatePendingOrderInput) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = generateOrderNumber();
      try {
        const order = await prisma.order.create({
          data: {
            orderNumber,
            customerName: input.customerName,
            email: input.email,
            phone: input.phone,
            shippingAddress: input.shippingAddress as object,
            subtotalPaise: input.subtotalPaise,
            discountPaise: input.discountPaise,
            shippingPaise: input.shippingPaise,
            totalPaise: input.totalPaise,
            couponId: input.couponId ?? null,
            userId: input.userId ?? null,
            items: {
              create: input.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                pricePaise: item.pricePaise,
                size: item.size,
                qty: item.qty,
                image: item.image,
              })),
            },
          },
          include: { items: true },
        });
        return toDto(order);
      } catch (error: unknown) {
        const isUniqueViolation =
          error &&
          typeof error === "object" &&
          "code" in error &&
          (error as { code?: string }).code === "P2002";
        if (isUniqueViolation && attempt < 4) continue;
        throw error;
      }
    }
    throw new Error("Failed to generate a unique order number");
  },

  async setRazorpayOrderId(orderId: string, razorpayOrderId: string) {
    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId },
    });
  },

  async findByRazorpayOrderId(razorpayOrderId: string) {
    const order = await prisma.order.findFirst({
      where: { razorpayOrderId },
      include: { items: true },
    });
    return order ? toDto(order) : null;
  },

  async findByOrderNumber(orderNumber: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    return order ? toDto(order) : null;
  },

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order ? toDto(order) : null;
  },

  /**
   * Atomically marks an order as PAID, guarded so it only runs once even if
   * called concurrently from both the client-side verify route and the
   * server-side webhook. Decrements product/size stock on success.
   */
  async markPaidIfPending(razorpayOrderId: string, razorpayPaymentId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { razorpayOrderId },
        include: { items: true },
      });
      if (!existing) return { ok: false as const, reason: "not_found" as const };
      if (existing.paymentStatus === "PAID") {
        return { ok: true as const, order: toDto(existing), alreadyProcessed: true };
      }

      const updateResult = await tx.order.updateMany({
        where: { id: existing.id, paymentStatus: { not: "PAID" } },
        data: {
          paymentStatus: "PAID",
          status: "PROCESSING",
          razorpayPaymentId,
        },
      });

      if (updateResult.count === 0) {
        const fresh = await tx.order.findUniqueOrThrow({
          where: { id: existing.id },
          include: { items: true },
        });
        return { ok: true as const, order: toDto(fresh), alreadyProcessed: true };
      }

      for (const item of existing.items) {
        if (!item.productId) continue;
        if (item.size) {
          await tx.productSizeStock.updateMany({
            where: { productId: item.productId, size: item.size, stock: { gte: item.qty } },
            data: { stock: { decrement: item.qty } },
          });
        }
        await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.qty } },
          data: { stock: { decrement: item.qty } },
        });
      }

      if (existing.couponId) {
        await tx.coupon.update({
          where: { id: existing.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      const updated = await tx.order.findUniqueOrThrow({
        where: { id: existing.id },
        include: { items: true },
      });
      return { ok: true as const, order: toDto(updated), alreadyProcessed: false };
    });
  },

  async recordPaymentEvent(providerEventId: string, orderId: string | null, payload: unknown) {
    try {
      await prisma.paymentEvent.create({
        data: { providerEventId, orderId, payload: payload as object },
      });
      return true;
    } catch (error: unknown) {
      const isUniqueViolation =
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";
      if (isUniqueViolation) return false;
      throw error;
    }
  },

  async findMany(
    filters: {
      status?: OrderStatus;
      paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const where: {
      status?: OrderStatus;
      paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    } = {};
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { orders: items.map(toDto), total };
  },

  /**
   * Idempotent webhook processing: record event + mark paid in one transaction.
   * If the event was already recorded, returns duplicate without reprocessing.
   */
  async processWebhookPayment(input: {
    providerEventId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    payload: unknown;
  }) {
    return prisma.$transaction(async (tx) => {
      const existingEvent = await tx.paymentEvent.findUnique({
        where: { providerEventId: input.providerEventId },
      });
      if (existingEvent) {
        return { ok: true as const, duplicate: true as const, alreadyProcessed: true as const };
      }

      const existing = await tx.order.findFirst({
        where: { razorpayOrderId: input.razorpayOrderId },
        include: { items: true },
      });
      if (!existing) {
        return { ok: false as const, reason: "not_found" as const };
      }

      let alreadyProcessed = existing.paymentStatus === "PAID";

      if (!alreadyProcessed) {
        const updateResult = await tx.order.updateMany({
          where: { id: existing.id, paymentStatus: { not: "PAID" } },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
            razorpayPaymentId: input.razorpayPaymentId,
          },
        });

        if (updateResult.count > 0) {
          for (const item of existing.items) {
            if (!item.productId) continue;
            if (item.size) {
              await tx.productSizeStock.updateMany({
                where: {
                  productId: item.productId,
                  size: item.size,
                  stock: { gte: item.qty },
                },
                data: { stock: { decrement: item.qty } },
              });
            }
            await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.qty } },
              data: { stock: { decrement: item.qty } },
            });
          }

          if (existing.couponId) {
            await tx.coupon.update({
              where: { id: existing.couponId },
              data: { usedCount: { increment: 1 } },
            });
          }
          alreadyProcessed = false;
        } else {
          alreadyProcessed = true;
        }
      }

      await tx.paymentEvent.create({
        data: {
          providerEventId: input.providerEventId,
          orderId: existing.id,
          payload: input.payload as object,
        },
      });

      const updated = await tx.order.findUniqueOrThrow({
        where: { id: existing.id },
        include: { items: true },
      });

      return {
        ok: true as const,
        duplicate: false as const,
        alreadyProcessed,
        order: toDto(updated),
      };
    });
  },

  async updateStatus(id: string, status: OrderStatus) {
    try {
      const order = await prisma.order.update({
        where: { id },
        data: { status },
        include: { items: true },
      });
      return toDto(order);
    } catch {
      return null;
    }
  },
};
