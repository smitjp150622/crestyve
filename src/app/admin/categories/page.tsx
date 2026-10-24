"use client";

import ImageUpload from "@/components/admin/image-upload";

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
  FolderOpen,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  _count: { products: number };
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  order: "0",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load categories", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories().finally(() => setLoading(false));
  }, [fetchCategories]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setSlugEdited(false);
    setShowModal(true);
  }

  function openEdit(category: Category) {
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      order: String(category.order),
    });
    setEditingId(category.id);
    setSlugEdited(true);
    setShowModal(true);
  }

  function updateField(field: string, value: string) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !slugEdited) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) {
      showToast("Name and slug are required", "error");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      image: form.image || null,
      order: parseInt(form.order) || 0,
    };

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
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
          ? "Category updated successfully"
          : "Category created successfully",
        "success"
      );
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save category",
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
      const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete");
      }
      showToast("Category deleted successfully", "success");
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete category",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-44 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
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
            Categories
          </h2>
          <p className="font-inter text-sm text-gray-500">
            Organize your collections &middot; {categories.length} categories
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-manrope text-sm font-medium hover:bg-[#6d1531] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FolderOpen className="h-10 w-10 mb-3" />
            <p className="font-inter text-sm">No categories found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="text-right px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FolderOpen className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="font-manrope text-sm font-medium text-gray-900">
                        {category.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-inter text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-inter text-sm text-gray-900">
                    {category._count.products}
                  </td>
                  <td className="px-6 py-4 font-inter text-sm text-gray-500">
                    {category.order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(category)}
                        className="p-2 text-gray-400 hover:text-[#8B1C3F] transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(category)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                  Delete Category
                </h3>
                <p className="font-inter text-xs text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            {deleteTarget._count.products > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-inter text-xs text-amber-800">
                  This category has{" "}
                  <span className="font-medium">
                    {deleteTarget._count.products} product(s)
                  </span>{" "}
                  assigned. You must reassign or remove them before deleting.
                </p>
              </div>
            )}
            <p className="font-inter text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
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
                {editingId ? "Edit Category" : "Add Category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name & Slug */}
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
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      updateField("slug", e.target.value);
                    }}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F] resize-none"
                />
              </div>

              {/* Image & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                    Image
                  </label>
                  <ImageUpload
                    value={form.image}
                    onChange={(url) => updateField("image", url)}
                    folder="categories"
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
                  {editingId ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
