export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-errors";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createUploadSignature,
  isCloudinaryConfigured,
  UPLOAD_FOLDERS,
  type UploadFolder,
} from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    if (!isCloudinaryConfigured()) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 503 });
    }

    const folder = request.nextUrl.searchParams.get("folder") as UploadFolder | null;
    if (!folder || !UPLOAD_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
    }

    return NextResponse.json(createUploadSignature(folder));
  } catch (error) {
    console.error("Failed to create upload signature:", error);
    return errorResponse(error, "Failed to create upload signature");
  }
}
