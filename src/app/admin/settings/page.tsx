"use client";

import ImageUpload from "@/components/admin/image-upload";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, AlertCircle, Check, Settings, MapPin, Phone, Mail } from "lucide-react";

interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroVideo: string;
  aboutTitle: string;
  aboutContent: string;
  artistImage: string;
  whatsappNumber: string;
  instagramHandle: string;
  email: string;
  studioAddress: string;
  mapEmbedUrl: string;
}

interface Toast {
  message: string;
  type: "success" | "error";
}

const defaultSettings: SiteSettings = {
  heroTitle: "",
  heroSubtitle: "",
  heroVideo: "",
  aboutTitle: "",
  aboutContent: "",
  artistImage: "",
  whatsappNumber: "",
  instagramHandle: "",
  email: "",
  studioAddress: "",
  mapEmbedUrl: "",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data });
      } catch {
        showToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Settings saved successfully", "success");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
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
          <h2 className="font-cormorant text-3xl text-gray-900 mb-1">Settings</h2>
          <p className="font-inter text-sm text-gray-500">Manage site content & configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-5 py-2.5 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#8B1C3F]/10 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-[#8B1C3F]" />
            </div>
            <h3 className="font-[Manrope] text-sm font-semibold text-gray-900">Hero Section</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Hero Title</label>
              <input
                type="text"
                value={settings.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
              />
            </div>
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Hero Subtitle</label>
              <input
                type="text"
                value={settings.heroSubtitle}
                onChange={(e) => updateField("heroSubtitle", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
              />
            </div>
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Hero Video URL</label>
              <input
                type="url"
                value={settings.heroVideo}
                onChange={(e) => updateField("heroVideo", e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#8B1C3F]/10 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-[#8B1C3F]" />
            </div>
            <h3 className="font-[Manrope] text-sm font-semibold text-gray-900">About Section</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">About Title</label>
              <input
                type="text"
                value={settings.aboutTitle}
                onChange={(e) => updateField("aboutTitle", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
              />
            </div>
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">About Content</label>
              <textarea
                value={settings.aboutContent}
                onChange={(e) => updateField("aboutContent", e.target.value)}
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Artist Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#8B1C3F]/10 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-[#8B1C3F]" />
            </div>
            <h3 className="font-[Manrope] text-sm font-semibold text-gray-900">Artist</h3>
          </div>
          <div>
            <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Artist Image</label>
            <ImageUpload
              value={settings.artistImage}
              onChange={(url) => updateField("artistImage", url)}
              folder="settings"
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#8B1C3F]/10 rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 text-[#8B1C3F]" />
            </div>
            <h3 className="font-[Manrope] text-sm font-semibold text-gray-900">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">WhatsApp Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => updateField("whatsappNumber", e.target.value)}
                  placeholder="+91..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                />
              </div>
            </div>
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Instagram Handle</label>
              <input
                type="text"
                value={settings.instagramHandle}
                onChange={(e) => updateField("instagramHandle", e.target.value)}
                placeholder="@username"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
              />
            </div>
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                />
              </div>
            </div>
            <div>
              <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Studio Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={settings.studioAddress}
                  onChange={(e) => updateField("studioAddress", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#8B1C3F]/10 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-[#8B1C3F]" />
            </div>
            <h3 className="font-[Manrope] text-sm font-semibold text-gray-900">Map</h3>
          </div>
          <div>
            <label className="block font-[Manrope] text-xs font-medium text-gray-700 mb-1.5">Google Maps Embed URL</label>
            <input
              type="url"
              value={settings.mapEmbedUrl}
              onChange={(e) => updateField("mapEmbedUrl", e.target.value)}
              placeholder="https://www.google.com/maps/embed?..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 font-[Inter] text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
            />
            {settings.mapEmbedUrl && (
              <div className="mt-3 border border-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={settings.mapEmbedUrl}
                  className="w-full h-48"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button (bottom) */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#8B1C3F] text-white px-6 py-3 rounded-lg font-[Manrope] text-sm font-medium hover:bg-[#6d1531] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
