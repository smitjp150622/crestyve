"use client";

import ImageUpload from "@/components/admin/image-upload";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, X, Loader2, Trophy, AlertCircle, Check } from "lucide-react";

interface Award {
  id: string;
  title: string;
  description: string;
  year: number;
  image?: string;
  order: number;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function AdminAwards() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    image: "",
    order: 0,
  });

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchAwards = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/awards");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAwards(data);
    } catch {
      showToast("Failed to load awards", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  const openAddForm = () => {
    setEditingAward(null);
    setForm({ title: "", description: "", year: new Date().getFullYear(), image: "", order: 0 });
    setShowForm(true);
  };

  const openEditForm = (award: Award) => {
    setEditingAward(award);
    setForm({
      title: award.title,
      description: award.description,
      year: award.year,
      image: award.image || "",
      order: award.order,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingAward
        ? `/api/admin/awards/${editingAward.id}`
        : "/api/admin/awards";
      const method = editingAward ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast(editingAward ? "Award updated" : "Award created", "success");
      setShowForm(false);
      fetchAwards();
    } catch {
      showToast("Failed to save award", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/awards/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Award deleted", "success");
      setDeleteId(null);
      fetchAwards();
    } catch {
      showToast("Failed to delete award", "error");
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
          <h2 className="font-cormorant text-3xl text-gray-900 mb-1">Awards</h2>
          <p className="font-inter text-sm text-gray-500">Manage awards & recognitions</p>
        </div>
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Award
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Award</th>
              <th className="text-left px-6 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
              <th className="text-left px-6 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="text-right px-6 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {awards.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="font-[Inter] text-sm text-gray-500">No awards yet</p>
                </td>
              </tr>
            ) : (
              awards.map((award) => (
                <tr key={award.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {award.image ? (
                        <img src={award.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-[#8B1C3F]/10 rounded-lg flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-[#8B1C3F]" />
                        </div>
                      )}
                      <div>
                        <p className="font-[Manrope] text-sm font-medium text-gray-900">{award.title}</p>
                        <p className="font-[Inter] text-xs text-gray-500 line-clamp-1">{award.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-[Inter] text-sm text-gray-600">{award.year}</td>
                  <td className="px-6 py-4 font-[Inter] text-sm text-gray-600">{award.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditForm(award)} className="p-2 text-gray-400 hover:text-[#8B1C3F] transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(award.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-cormorant text-xl text-gray-900">
                {editingAward ? "Edit Award" : "Add Award"}
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
                <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Year</label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
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
              <div>
                <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Image</label>
                <ImageUpload
                  value={form.image}
                  onChange={(url) => setForm({ ...form, image: url })}
                  folder="awards"
                />
              </div>
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
                  {editingAward ? "Update" : "Create"}
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
                <h3 className="font-[Manrope] text-sm font-medium text-gray-900">Delete Award</h3>
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
