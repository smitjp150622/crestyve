export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  materials: string[];
  sizes: string[];
  available: boolean;
  featured: boolean;
  video?: string;
  beforeAfter?: {
    before: string;
    after: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface Award {
  id: string;
  title: string;
  organization: string;
  year: number;
  image?: string;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  category?: string;
}

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  tags: string[];
}

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  logo: string;
  favicon: string;
  socialLinks: {
    whatsapp?: string;
    instagram?: string;
    email?: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
}
