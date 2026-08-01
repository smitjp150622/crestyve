export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images: string[];
  video?: string;
  categoryId: string;
  materials: string[];
  sizes: string[];
  available: boolean;
  featured: boolean;
  artistNotes?: string;
  beforeImage?: string;
  afterImage?: string;
  order: number;
  stock?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  image?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Award {
  id: string;
  title: string;
  description?: string;
  year: number;
  image?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryImage {
  id: string;
  title?: string;
  url: string;
  category?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideo?: string;
  aboutTitle?: string;
  aboutContent?: string;
  artistImage?: string;
  whatsappNumber: string;
  instagramHandle: string;
  email: string;
  studioAddress?: string;
  mapEmbedUrl?: string;
  shippingPaise?: number;
}
