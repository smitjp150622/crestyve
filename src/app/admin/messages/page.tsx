"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, X, Loader2, Mail, AlertCircle, Check, MessageSquare, Eye } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

type Filter = "all" | "unread" | "read";

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      let url = "/api/admin/messages";
      if (filter === "read") url += "?read=true";
      else if (filter === "unread") url += "?read=false";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setMessages(data);
    } catch {
      showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (ids: string[]) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("Failed to update");
      showToast("Marked as read", "success");
      setSelectedIds([]);
      fetchMessages();
    } catch {
      showToast("Failed to mark as read", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/messages/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      showToast("Message deleted", "success");
      setDeleteId(null);
      if (selectedMessage?.id === deleteId) setSelectedMessage(null);
      fetchMessages();
    } catch {
      showToast("Failed to delete message", "error");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const unread = messages.filter((m) => !m.read).map((m) => m.id);
    setSelectedIds((prev) => (prev.length === unread.length ? [] : unread));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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
          <h2 className="font-cormorant text-3xl text-gray-900 mb-1">Messages</h2>
          <p className="font-inter text-sm text-gray-500">Contact form submissions</p>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => markAsRead(selectedIds)}
            className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors"
          >
            <Check className="h-4 w-4" />
            Mark {selectedIds.length} as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {(["all", "unread", "read"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md font-[Manrope] text-xs font-medium transition-colors capitalize ${
              filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  onChange={selectAll}
                  checked={selectedIds.length > 0 && selectedIds.length === messages.filter((m) => !m.read).length}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 font-[Manrope] text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="font-[Inter] text-sm text-gray-500">No messages</p>
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr
                  key={msg.id}
                  className={`hover:bg-gray-50/50 transition-colors cursor-pointer ${!msg.read ? "bg-[#8B1C3F]/[0.02]" : ""}`}
                  onClick={() => setSelectedMessage(msg)}
                >
                  <td className="w-10 px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    {!msg.read && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(msg.id)}
                        onChange={() => toggleSelect(msg.id)}
                        className="rounded border-gray-300"
                      />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {!msg.read && <span className="w-2 h-2 bg-[#8B1C3F] rounded-full flex-shrink-0" />}
                      <div>
                        <p className={`font-[Manrope] text-sm ${!msg.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>{msg.name}</p>
                        <p className="font-[Inter] text-xs text-gray-500">{msg.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className={`font-[Inter] text-sm ${!msg.read ? "text-gray-900 font-medium" : "text-gray-600"}`}>{msg.subject}</p>
                  </td>
                  <td className="px-4 py-4 font-[Inter] text-xs text-gray-500">{formatDate(msg.createdAt)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-[Manrope] text-[11px] font-medium ${
                      msg.read ? "bg-gray-100 text-gray-600" : "bg-[#8B1C3F]/10 text-[#8B1C3F]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${msg.read ? "bg-gray-400" : "bg-[#8B1C3F]"}`} />
                      {msg.read ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {!msg.read && (
                        <button
                          onClick={() => markAsRead([msg.id])}
                          className="p-2 text-gray-400 hover:text-[#8B1C3F] transition-colors"
                          title="Mark as Read"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(msg.id)}
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-cormorant text-xl text-gray-900">Message</h3>
              <button onClick={() => setSelectedMessage(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-[Manrope] text-xs text-gray-500 mb-1">From</p>
                  <p className="font-[Inter] text-sm text-gray-900">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="font-[Manrope] text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-[Inter] text-sm text-gray-900">{selectedMessage.email}</p>
                </div>
              </div>
              <div>
                <p className="font-[Manrope] text-xs text-gray-500 mb-1">Subject</p>
                <p className="font-[Inter] text-sm text-gray-900">{selectedMessage.subject}</p>
              </div>
              <div>
                <p className="font-[Manrope] text-xs text-gray-500 mb-1">Message</p>
                <p className="font-[Inter] text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div>
                <p className="font-[Manrope] text-xs text-gray-500 mb-1">Received</p>
                <p className="font-[Inter] text-sm text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-6 border-t border-gray-100">
              <div className="flex gap-2">
                {!selectedMessage.read && (
                  <button
                    onClick={() => { markAsRead([selectedMessage.id]); setSelectedMessage(null); }}
                    className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-4 py-2 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    Mark as Read
                  </button>
                )}
              </div>
              <a
                href={`mailto:${selectedMessage.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-[Manrope] text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Reply
              </a>
            </div>
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
                <h3 className="font-[Manrope] text-sm font-medium text-gray-900">Delete Message</h3>
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
