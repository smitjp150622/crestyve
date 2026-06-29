"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  image: string | null;
  featured: boolean;
  order: number;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const emptyForm = {
  name: "",
  role: "",
  content: "",
  image: "",
  featured: false,
  order: "0",
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [form, setForm] = useState(emptyForm);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/testimonials");
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load testimonials", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchTestimonials().finally(() => setLoading(false));
  }, [fetchTestimonials]);

  const filtered = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  }

  function openEdit(testimonial: Testimonial) {
    setForm({
      name: testimonial.name,
      role: testimonial.role || "",
      content: testimonial.content,
      image: testimonial.image || "",
      featured: testimonial.featured,
      order: String(testimonial.order),
    });
    setEditingId(testimonial.id);
    setShowModal(true);
  }

  function updateField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.content) {
      showToast("Name and content are required", "error");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      role: form.role || null,
      content: form.content,
      image: form.image || null,
      featured: form.featured,
      order: parseInt(form.order) || 0,
    };

    try {
      const url = editingId
        ? `/api/admin/testimonials/${editingId}`
        : "/api/admin/testimonials";
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      showToast(
        editingId
          ? "Testimonial updated successfully"
          : "Testimonial created successfully",
        "success"
      );
      setShowModal(false);
      fetchTestimonials();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save testimonial",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Testimonial deleted successfully", "success");
      setDeleteTarget(null);
      fetchTestimonials();
    } catch {
      showToast("Failed to delete testimonial", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-40 animate-pulse"
            >
              <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
              <div className="h-3 w-20 bg-gray-100 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg font-inter text-sm text-white transition-all ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-3xl text-gray-900 mb-1">
            Testimonials
          </h2>
          <p className="font-inter text-sm text-gray-500">
            Client stories &amp; reviews &middot; {testimonials.length}{" "}
            testimonials
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-manrope text-sm font-medium hover:bg-[#6d1531] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search testimonials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
        />
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            className="h-10 w-10 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
          <p className="font-inter text-sm">No testimonials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 group hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-cormorant text-sm font-semibold text-gray-400">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-manrope text-sm font-medium text-gray-900">
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="font-inter text-xs text-gray-500">
                        {testimonial.role}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {testimonial.featured && (
                    <span className="mr-1 px-2 py-0.5 bg-[#8B1C3F]/10 text-[#8B1C3F] font-manrope text-[10px] font-medium rounded-full">
                      Featured
                    </span>
                  )}
                  <button
                    onClick={() => openEdit(testimonial)}
                    className="p-1.5 text-gray-300 hover:text-[#8B1C3F] transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(testimonial)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="font-inter text-sm text-gray-600 leading-relaxed line-clamp-3">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-inter text-[11px] text-gray-400">
                  Order: {testimonial.order}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-manrope text-sm font-semibold text-gray-900">
                  Delete Testimonial
                </h3>
                <p className="font-inter text-xs text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="font-inter text-sm text-gray-600 mb-6">
              Are you sure you want to delete the testimonial from{" "}
              <span className="font-medium text-gray-900">
                {deleteTarget.name}
              </span>
              ?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg font-manrope text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-manrope text-sm text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-cormorant text-xl font-semibold text-gray-900">
                {editingId ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    placeholder="e.g. Fashion Designer"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.content}
                  onChange={(e) => updateField("content", e.target.value)}
                  placeholder="What did the client say?"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F] resize-none"
                  required
                />
              </div>

              {/* Image & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) => updateField("image", e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  />
                </div>
                <div>
                  <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                    Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.order}
                    onChange={(e) => updateField("order", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  />
                </div>
              </div>

              {/* Featured Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => updateField("featured", !form.featured)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors ${
                      form.featured ? "bg-[#8B1C3F]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                        form.featured ? "translate-x-[18px]" : ""
                      }`}
                    />
                  </button>
                  <span className="font-manrope text-xs font-medium text-gray-700">
                    Featured testimonial
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg font-manrope text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-manrope text-sm font-medium text-white bg-[#8B1C3F] hover:bg-[#6d1531] transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Update Testimonial" : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
