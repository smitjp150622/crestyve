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
  Package,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  video: string | null;
  category: Category;
  categoryId: string;
  materials: string[];
  sizes: string[];
  available: boolean;
  featured: boolean;
  artistNotes: string | null;
  stock: number | null;
}

interface SizeStock {
  size: string;
  stock: number;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  categoryId: "",
  materials: "",
  sizes: [] as string[],
  images: [""],
  video: "",
  artistNotes: "",
  available: true,
  featured: false,
  stock: "",
  sizeStocks: [] as SizeStock[],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugEdited, setSlugEdited] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products?limit=100");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      showToast("Failed to load products", "error");
    }
  }, [showToast]);

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
    Promise.all([fetchProducts(), fetchCategories()]).finally(() =>
      setLoading(false)
    );
  }, [fetchProducts, fetchCategories]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setSlugEdited(false);
    setShowModal(true);
  }

  async function openEdit(product: Product) {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: String(product.price),
      categoryId: product.categoryId,
      materials: product.materials.join(", "),
      sizes: product.sizes,
      images: product.images.length > 0 ? product.images : [""],
      video: product.video || "",
      artistNotes: product.artistNotes || "",
      available: product.available,
      featured: product.featured,
      stock: product.stock !== null && product.stock !== undefined ? String(product.stock) : "",
      sizeStocks: [],
    });
    setEditingId(product.id);
    setSlugEdited(true);
    setShowModal(true);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sizeStocks)) {
          setForm((prev) => ({ ...prev, sizeStocks: data.sizeStocks }));
        }
      }
    } catch {
      // non-fatal: size stock editing will just start empty
    }
  }

  function setSizeStock(size: string, stockValue: string) {
    setForm((prev) => {
      const stock = stockValue === "" ? 0 : Math.max(0, parseInt(stockValue) || 0);
      const existing = prev.sizeStocks.filter((s) => s.size !== size);
      return { ...prev, sizeStocks: [...existing, { size, stock }] };
    });
  }

  function getSizeStock(size: string): string {
    const found = form.sizeStocks.find((s) => s.size === size);
    return found ? String(found.stock) : "";
  }

  function updateField(field: string, value: unknown) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "name" && !slugEdited) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  }

  function toggleSize(size: string) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
      sizeStocks: prev.sizes.includes(size)
        ? prev.sizeStocks.filter((s) => s.size !== size)
        : prev.sizeStocks,
    }));
  }

  function addImageField() {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
  }

  function removeImageField(index: number) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }

  function updateImage(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price || !form.categoryId) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: parseInt(form.price),
      categoryId: form.categoryId,
      materials: form.materials
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean),
      sizes: form.sizes,
      images: form.images.filter(Boolean),
      video: form.video || null,
      artistNotes: form.artistNotes || null,
      available: form.available,
      featured: form.featured,
      stock: form.stock === "" ? null : parseInt(form.stock),
      sizeStocks: form.sizes.length > 0 ? form.sizes.map((s) => ({
        size: s,
        stock: form.sizeStocks.find((ss) => ss.size === s)?.stock ?? 0,
      })) : [],
    };

    try {
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
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
        editingId ? "Product updated successfully" : "Product created successfully",
        "success"
      );
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save product",
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
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Product deleted successfully", "success");
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      showToast("Failed to delete product", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mt-2" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
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
          <h2 className="font-cormorant text-3xl text-gray-900 mb-1">Products</h2>
          <p className="font-inter text-sm text-gray-500">
            Manage your collection &middot; {products.length} products
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-manrope text-sm font-medium hover:bg-[#6d1531] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Package className="h-10 w-10 mb-3" />
            <p className="font-inter text-sm">No products found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="text-left px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-3 font-manrope text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-manrope text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        {product.featured && (
                          <span className="inline-block mt-0.5 font-inter text-[10px] text-[#8B1C3F] font-medium">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-inter text-sm text-gray-500">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4 font-inter text-sm text-gray-900">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-manrope text-[11px] font-medium ${
                        product.available
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          product.available ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      {product.available ? "Available" : "Sold Out"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 text-gray-400 hover:text-[#8B1C3F] transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
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
                  Delete Product
                </h3>
                <p className="font-inter text-xs text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-cormorant text-xl font-semibold text-gray-900">
                {editingId ? "Edit Product" : "Add Product"}
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

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                    Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => updateField("categoryId", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F] bg-white"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Overall Stock
                  <span className="text-gray-400 font-normal ml-1">
                    (leave blank for unlimited)
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  className="w-full sm:w-48 border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  placeholder="Unlimited"
                />
              </div>

              {/* Materials */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Materials
                  <span className="text-gray-400 font-normal ml-1">
                    (comma-separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.materials}
                  onChange={(e) => updateField("materials", e.target.value)}
                  placeholder="e.g. Cotton, Denim, Acrylic Paint"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                />
              </div>

              {/* Sizes */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg font-manrope text-xs font-medium border transition-colors ${
                        form.sizes.includes(size)
                          ? "bg-[#8B1C3F] text-white border-[#8B1C3F]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {form.sizes.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {form.sizes.map((size) => (
                      <div key={size}>
                        <label className="block font-manrope text-[11px] font-medium text-gray-500 mb-1">
                          Stock for {size}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={getSizeStock(size)}
                          onChange={(e) => setSizeStock(size, e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Images
                  <span className="text-gray-400 font-normal ml-1">(upload or paste a URL)</span>
                </label>
                <div className="space-y-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1">
                        <ImageUpload
                          value={img}
                          onChange={(url) => updateImage(idx, url)}
                          folder="products"
                        />
                      </div>
                      {form.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addImageField}
                    className="font-manrope text-xs text-[#8B1C3F] hover:text-[#6d1531] font-medium transition-colors"
                  >
                    + Add another image
                  </button>
                </div>
              </div>

              {/* Video */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Video URL
                </label>
                <input
                  type="url"
                  value={form.video}
                  onChange={(e) => updateField("video", e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                />
              </div>

              {/* Artist Notes */}
              <div>
                <label className="block font-manrope text-xs font-medium text-gray-700 mb-1.5">
                  Artist Notes
                </label>
                <textarea
                  rows={3}
                  value={form.artistNotes}
                  onChange={(e) => updateField("artistNotes", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F] resize-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => updateField("available", !form.available)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors ${
                      form.available ? "bg-[#8B1C3F]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                        form.available ? "translate-x-[18px]" : ""
                      }`}
                    />
                  </button>
                  <span className="font-manrope text-xs font-medium text-gray-700">
                    Available
                  </span>
                </label>
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
                    Featured
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
                  {editingId ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
