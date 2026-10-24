"use client";

import { useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import type { UploadFolder } from "@/lib/cloudinary";

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 10 * 1024 * 1024;

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  required?: boolean;
}

export default function ImageUpload({ value, onChange, folder, required = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use a JPEG, PNG, WebP or AVIF image");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be under 10 MB");
      return;
    }

    setUploading(true);
    try {
      // Signed by our server; the file then goes straight to Cloudinary.
      const sigRes = await fetch(`/api/admin/upload/signature?folder=${folder}`);
      const sig = await sigRes.json();
      if (!sigRes.ok) throw new Error(sig.error || "Could not start the upload");

      const body = new FormData();
      body.append("file", file);
      body.append("api_key", sig.apiKey);
      body.append("timestamp", String(sig.timestamp));
      body.append("folder", sig.folder);
      body.append("signature", sig.signature);

      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: "POST",
        body,
      });
      const up = await upRes.json();
      if (!upRes.ok || !up.secure_url) throw new Error(up.error?.message || "Upload failed");

      onChange(up.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <Upload className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#8B1C3F] px-3 py-1.5 font-manrope text-xs font-medium text-[#8B1C3F] hover:bg-[#8B1C3F]/5 transition-colors ${uploading ? "pointer-events-none opacity-60" : ""}`}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
            <input
              type="file"
              accept={ACCEPT}
              disabled={uploading}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
          {value && !uploading && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1 font-manrope text-xs text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>

        <input
          type="url"
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste an image URL"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 font-inter text-xs focus:outline-none focus:ring-2 focus:ring-[#8B1C3F]/20 focus:border-[#8B1C3F]"
        />
        {error && <p className="font-inter text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
