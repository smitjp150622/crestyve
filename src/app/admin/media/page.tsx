"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, Loader2, Image, AlertCircle, Check, Eye } from "lucide-react";

interface GalleryItem {
  id: string;
  title: string;
  url: string;
  category: string;
  featured: boolean;
  order: number;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function AdminMedia() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    url: "",
    category: "",
    featured: false,
    order: 0,
  });

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gallery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data);
    } catch {
      showToast("Failed to load gallery", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAddForm = () => {
    setEditingItem(null);
    setForm({ title: "", url: "", category: "", featured: false, order: 0 });
    setShowForm(true);
  };

  const openEditForm = (item: GalleryItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      url: item.url,
      category: item.category,
      featured: item.featured,
      order: item.order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingItem
        ? `/api/admin/gallery/${editingItem.id}`
        : "/api/admin/gallery";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast(editingItem ? "Media updated" : "Media added", "success");
      setShowForm(false);
      fetchItems();
    } catch {
      showToast("Failed to save media", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/gallery/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Media deleted", "success");
      setDeleteId(null);
      fetchItems();
    } catch {
      showToast("Failed to delete media", "error");
    }
  };

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
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg font-[Inter] text-sm text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-cormorant text-3xl text-gray-900 mb-1">Media Gallery</h2>
          <p className="font-inter text-sm text-gray-500">Manage your gallery images</p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Media
        </button>
      </div>

      {/* Grid View */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Image className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-[Inter] text-sm text-gray-500">No media items yet</p>
          <button onClick={openAddForm} className="mt-4 font-[Manrope] text-sm text-[#8B1C3F] hover:underline">
            Add your first image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).classList.add("hidden"); }}
                />
                {!item.url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewUrl(item.url)}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:text-[#8B1C3F] transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditForm(item)}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:text-[#8B1C3F] transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-2 bg-white rounded-lg text-gray-700 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {item.featured && (
                  <span className="absolute top-2 left-2 bg-[#8B1C3F] text-white text-[10px] font-[Manrope] font-medium px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-[Manrope] text-sm font-medium text-gray-900 truncate">{item.title}</p>
                <p className="font-[Inter] text-xs text-gray-500">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <button className="absolute top-4 right-4 p-2 text-white/80 hover:text-white">
            <X className="h-6 w-6" />
          </button>
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg object-contain" />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-cormorant text-xl text-gray-900">
                {editingItem ? "Edit Media" : "Add Media"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                />
              </div>
              <div>
                <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Image URL</label>
                <input
                  type="url"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  />
                </div>
                <div>
                  <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.featured ? "bg-[#8B1C3F]" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? "translate-x-5" : ""}`} />
                </button>
                <label className="font-[Manrope] text-xs font-medium text-gray-700">Featured</label>
              </div>
              {form.url && (
                <div className="border border-gray-100 rounded-lg p-2">
                  <img src={form.url} alt="Preview" className="w-full h-32 object-cover rounded" />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg font-[Manrope] text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-[Manrope] text-sm font-medium text-gray-900">Delete Media</h3>
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
