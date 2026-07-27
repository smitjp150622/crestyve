"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Check, ShoppingBag, Trash2, X } from "lucide-react";

interface ProductSnapshot {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  selectedSize: string | null;
}

interface Inquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  productSnapshot: ProductSnapshot;
  selectedSize: string | null;
  message: string | null;
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  source: "WHATSAPP" | "CONTACT";
  createdAt: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const STATUS_OPTIONS: Inquiry["status"][] = [
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_STYLES: Record<Inquiry["status"], string> = {
  NEW: "bg-[#8B1C3F]/10 text-[#8B1C3F]",
  CONTACTED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [detail, setDetail] = useState<Inquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Inquiry["status"] | "ALL">("ALL");

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const url =
        filter === "ALL" ? "/api/admin/inquiries" : `/api/admin/inquiries?status=${filter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInquiries(data);
    } catch {
      showToast("Failed to load inquiries", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    setLoading(true);
    fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (id: string, status: Inquiry["status"]) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      showToast("Status updated", "success");
      fetchInquiries();
      if (detail?.id === id) {
        setDetail((prev) => (prev ? { ...prev, status } : prev));
      }
    } catch {
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Inquiry deleted", "success");
      setDeleteId(null);
      if (detail?.id === deleteId) setDetail(null);
      fetchInquiries();
    } catch {
      showToast("Failed to delete inquiry", "error");
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        <h2 className="font-cormorant text-3xl text-gray-900 mb-1">WhatsApp Inquiries</h2>
        <p className="font-inter text-sm text-gray-500">Buy-via-WhatsApp orders from customers</p>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit flex-wrap">
        {(["ALL", ...STATUS_OPTIONS] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md font-[Manrope] text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.replace("_", " ").toLowerCase()}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="font-[Inter] text-sm text-gray-500">No inquiries</p>
                </td>
              </tr>
            ) : (
              inquiries.map((inq) => (
                <tr
                  key={inq.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setDetail(inq)}
                >
                  <td className="px-4 py-4">
                    <p className="font-[Manrope] text-sm font-medium text-gray-900">
                      {inq.customerName}
                    </p>
                    <p className="font-[Inter] text-xs text-gray-500">{inq.phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-[Inter] text-sm text-gray-900">
                      {inq.productSnapshot?.name ?? "—"}
                    </p>
                    <p className="font-[Inter] text-xs text-gray-500">
                      {inq.selectedSize ? `Size ${inq.selectedSize} · ` : ""}₹
                      {inq.productSnapshot?.price?.toLocaleString("en-IN") ?? "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-[Inter] text-xs text-gray-500">
                    {formatDate(inq.createdAt)}
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={inq.status}
                      onChange={(e) => updateStatus(inq.id, e.target.value as Inquiry["status"])}
                      className={`px-2.5 py-1 rounded-full font-[Manrope] text-[11px] font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 ${STATUS_STYLES[inq.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDeleteId(inq.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-cormorant text-xl text-gray-900">Inquiry Details</h3>
              <button onClick={() => setDetail(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-[Manrope] text-xs text-gray-500 mb-1">Customer</p>
                  <p className="font-[Inter] text-sm text-gray-900">{detail.customerName}</p>
                </div>
                <div>
                  <p className="font-[Manrope] text-xs text-gray-500 mb-1">Phone</p>
                  <p className="font-[Inter] text-sm text-gray-900">{detail.phone}</p>
                </div>
              </div>
              <div>
                <p className="font-[Manrope] text-xs text-gray-500 mb-1">Product</p>
                <p className="font-[Inter] text-sm text-gray-900">
                  {detail.productSnapshot?.name}
                  {detail.selectedSize ? ` · Size ${detail.selectedSize}` : ""}
                </p>
                <p className="font-[Inter] text-xs text-gray-500">
                  ₹{detail.productSnapshot?.price?.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="font-[Manrope] text-xs text-gray-500 mb-1">Received</p>
                <p className="font-[Inter] text-sm text-gray-600">{formatDate(detail.createdAt)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-6 border-t border-gray-100">
              <select
                value={detail.status}
                onChange={(e) => updateStatus(detail.id, e.target.value as Inquiry["status"])}
                className="border border-gray-200 rounded-lg px-3 py-2 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              <a
                href={`https://wa.me/${detail.phone.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-[Manrope] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Open WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-[Manrope] text-sm font-medium text-gray-900">Delete Inquiry</h3>
                <p className="font-[Inter] text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg font-[Manrope] text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-[Manrope] text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
