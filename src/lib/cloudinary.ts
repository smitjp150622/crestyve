import { v2 as cloudinary } from "cloudinary";

export const UPLOAD_FOLDERS = [
  "products",
  "categories",
  "awards",
  "testimonials",
  "gallery",
  "settings",
] as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function createUploadSignature(folder: UploadFolder) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const timestamp = Math.round(Date.now() / 1000);
  const folderPath = `crestyve/${folder}`;

  const signature = cloudinary.utils.api_sign_request(
    { folder: folderPath, timestamp },
    apiSecret
  );

  return { cloudName, apiKey, timestamp, folder: folderPath, signature };
}
