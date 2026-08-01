"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Check, Receipt, Printer } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  size: string | null;
  qty: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  total: number;
  items: OrderItem[];
  createdAt: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const STATUS_OPTIONS: Order["status"][] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_STYLES: Record<Order["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const PAYMENT_STYLES: Record<Order["paymentStatus"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-500",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [filter, setFilter] = useState<Order["status"] | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<Order["paymentStatus"] | "ALL">("ALL");

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      if (paymentFilter !== "ALL") params.set("paymentStatus", paymentFilter);
      const qs = params.toString();
      const url = qs ? `/api/admin/orders?${qs}` : "/api/admin/orders";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, paymentFilter, showToast]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  async function updateStatus(id: string, status: Order["status"]) {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      showToast("Order status updated", "success");
      fetchOrders();
    } catch {
      showToast("Failed to update order", "error");
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B1C3F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg font-[Inter] text-sm text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div>
        <h2 className="font-cormorant text-3xl text-gray-900 mb-1">Orders</h2>
        <p className="font-inter text-sm text-gray-500">E-commerce orders and payments</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
          {(["ALL", ...STATUS_OPTIONS] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md font-[Manrope] text-xs font-medium transition-colors capitalize ${
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f.toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
          {(["ALL", "PENDING", "PAID", "FAILED", "REFUNDED"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setPaymentFilter(f)}
              className={`px-4 py-2 rounded-md font-[Manrope] text-xs font-medium transition-colors capitalize ${
                paymentFilter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f === "ALL" ? "all payments" : f.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-right px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Receipt className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="font-[Inter] text-sm text-gray-500">No orders yet</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 font-[Manrope] text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-[Inter] text-sm text-gray-900">{order.customerName}</p>
                    <p className="font-[Inter] text-xs text-gray-500">{order.email}</p>
                  </td>
                  <td className="px-4 py-4 font-[Inter] text-sm text-gray-900">
                    ₹{order.total.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full font-[Manrope] text-[11px] font-medium ${PAYMENT_STYLES[order.paymentStatus]}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                      className={`px-2.5 py-1 rounded-full font-[Manrope] text-[11px] font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 ${STATUS_STYLES[order.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 font-[Inter] text-xs text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/admin/orders/${order.id}/invoice`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-[#8B1C3F] transition-colors"
                        title="View Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
