"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, Check, AlertCircle, Loader2, Tag } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderRupees?: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const emptyForm = {
  code: "",
  type: "PERCENT" as "PERCENT" | "FIXED",
  value: "",
  minOrderRupees: "",
  maxUses: "",
  active: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(c: Coupon) {
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      minOrderRupees: c.minOrderRupees !== undefined ? String(c.minOrderRupees) : "",
      maxUses: c.maxUses !== null ? String(c.maxUses) : "",
      active: c.active,
    });
    setEditingId(c.id);
    setFormError(null);
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.code.trim() || !form.value) {
      setFormError("Code and value are required");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        code: form.code.trim(),
        type: form.type,
        value: Number(form.value),
        minOrderRupees: form.minOrderRupees ? Number(form.minOrderRupees) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        active: form.active,
      };
      const url = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      showToast(editingId ? "Coupon updated" : "Coupon created", "success");
      setShowModal(false);
      fetchCoupons();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/coupons/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Coupon deleted", "success");
      setDeleteTarget(null);
      fetchCoupons();
    } catch {
      showToast("Failed to delete coupon", "error");
    }
  }

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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-3xl text-gray-900 mb-1">Coupons</h2>
          <p className="font-inter text-sm text-gray-500">Discount codes for checkout</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <Tag className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="font-[Inter] text-sm text-gray-500">No coupons yet</p>
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 font-[Manrope] text-sm font-medium text-gray-900">{c.code}</td>
                  <td className="px-4 py-4 font-[Inter] text-sm text-gray-700">
                    {c.type === "PERCENT" ? `${c.value}%` : `₹${c.value}`}
                  </td>
                  <td className="px-4 py-4 font-[Inter] text-xs text-gray-500">
                    {c.usedCount}
                    {c.maxUses !== null ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-[Manrope] text-[11px] font-medium ${
                        c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 text-gray-400 hover:text-[#8B1C3F] transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-cormorant text-xl text-gray-900">
                {editingId ? "Edit Coupon" : "New Coupon"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  placeholder="WELCOME10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as "PERCENT" | "FIXED" })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F] bg-white"
                  >
                    <option value="PERCENT">Percent (%)</option>
                    <option value="FIXED">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">
                    Value {form.type === "PERCENT" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderRupees}
                    onChange={(e) => setForm({ ...form, minOrderRupees: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  />
                </div>
                <div>
                  <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Max Uses</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="font-[Inter] text-sm text-gray-700">Active</span>
              </label>
              {formError && <p className="font-[Inter] text-xs text-red-600">{formError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg font-[Manrope] text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-4 py-2 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-[Manrope] text-sm font-medium text-gray-900">Delete Coupon</h3>
                <p className="font-[Inter] text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
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
