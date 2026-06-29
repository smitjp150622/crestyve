import { getGalleryImages } from "@/lib/db";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  const galleryImages = await getGalleryImages();

  const images = galleryImages.map((img) => ({
    id: img.id,
    title: img.title,
    src: img.url,
    category: img.category,
  }));

  return <GalleryClient images={images} />;
}
