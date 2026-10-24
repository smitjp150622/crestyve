export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import { orders } from "@/lib/repositories/orders";
import type { OrderStatus, PaymentStatus } from "@prisma/client";

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const statusParam = searchParams.get("status");
    const paymentParam = searchParams.get("paymentStatus");
    const status =
      statusParam && VALID_STATUSES.includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined;
    const paymentStatus =
      paymentParam && VALID_PAYMENT_STATUSES.includes(paymentParam as PaymentStatus)
        ? (paymentParam as PaymentStatus)
        : undefined;

    const result = await orders.findMany({ status, paymentStatus, page, limit });

    return NextResponse.json({
      orders: result.orders,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return errorResponse(error, "Failed to fetch orders");
  }
}
