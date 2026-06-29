import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

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
}

export interface Database {
  categories: Category[];
  products: Product[];
  testimonials: Testimonial[];
  awards: Award[];
  gallery: GalleryImage[];
  messages: ContactMessage[];
  settings: SiteSettings;
}

function getDefaultDB(): Database {
  return {
    categories: [],
    products: [],
    testimonials: [],
    awards: [],
    gallery: [],
    messages: [],
    settings: {
      id: "default",
      heroTitle: "Wear Your Story",
      heroSubtitle: "Handcrafted Fashion. Painted with Passion.",
      whatsappNumber: "+918884942210",
      instagramHandle: "@crestyve",
      email: "hello@crestyve.com",
    },
  };
}

function readDB(): Database {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultDB = getDefaultDB();
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
      return defaultDB;
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    return getDefaultDB();
  }
}

function writeDB(db: Database): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function generateId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 25);
}

function now(): string {
  return new Date().toISOString();
}

// --- Categories ---
export const categories = {
  findMany(options?: { orderBy?: string }): (Category & { _count?: { products: number } })[] {
    const db = readDB();
    let items = [...db.categories];
    if (options?.orderBy === "order") {
      items.sort((a, b) => a.order - b.order);
    } else {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return items.map((cat) => ({
      ...cat,
      _count: { products: db.products.filter((p) => p.categoryId === cat.id).length },
    }));
  },

  findById(id: string): (Category & { _count?: { products: number } }) | null {
    const db = readDB();
    const cat = db.categories.find((c) => c.id === id);
    if (!cat) return null;
    return {
      ...cat,
      _count: { products: db.products.filter((p) => p.categoryId === cat.id).length },
    };
  },

  create(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Category {
    const db = readDB();
    const category: Category = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.categories.push(category);
    writeDB(db);
    return category;
  },

  update(id: string, data: Partial<Omit<Category, "id" | "createdAt">>): Category | null {
    const db = readDB();
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    db.categories[idx] = { ...db.categories[idx], ...data, updatedAt: now() };
    writeDB(db);
    return db.categories[idx];
  },

  delete(id: string): boolean {
    const db = readDB();
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    db.categories.splice(idx, 1);
    writeDB(db);
    return true;
  },
};

// --- Products ---
export const products = {
  findMany(options?: { page?: number; limit?: number }) {
    const db = readDB();
    let items = [...db.products].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const total = items.length;

    if (options?.page && options?.limit) {
      const skip = (options.page - 1) * options.limit;
      items = items.slice(skip, skip + options.limit);
    }

    const withCategory = items.map((p) => ({
      ...p,
      category: db.categories.find((c) => c.id === p.categoryId) || null,
    }));

    return { products: withCategory, total };
  },

  findById(id: string) {
    const db = readDB();
    const product = db.products.find((p) => p.id === id);
    if (!product) return null;
    return {
      ...product,
      category: db.categories.find((c) => c.id === product.categoryId) || null,
    };
  },

  findBySlug(slug: string) {
    const db = readDB();
    const product = db.products.find((p) => p.slug === slug);
    if (!product) return null;
    return {
      ...product,
      category: db.categories.find((c) => c.id === product.categoryId) || null,
    };
  },

  create(data: Omit<Product, "id" | "createdAt" | "updatedAt">) {
    const db = readDB();
    const product: Product = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.products.push(product);
    writeDB(db);
    return {
      ...product,
      category: db.categories.find((c) => c.id === product.categoryId) || null,
    };
  },

  update(id: string, data: Partial<Omit<Product, "id" | "createdAt">>) {
    const db = readDB();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.products[idx] = { ...db.products[idx], ...data, updatedAt: now() };
    writeDB(db);
    return {
      ...db.products[idx],
      category: db.categories.find((c) => c.id === db.products[idx].categoryId) || null,
    };
  },

  delete(id: string): boolean {
    const db = readDB();
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    db.products.splice(idx, 1);
    writeDB(db);
    return true;
  },

  countByCategory(categoryId: string): number {
    const db = readDB();
    return db.products.filter((p) => p.categoryId === categoryId).length;
  },
};

// --- Testimonials ---
export const testimonials = {
  findMany(): Testimonial[] {
    const db = readDB();
    return [...db.testimonials].sort((a, b) => a.order - b.order);
  },

  create(data: Omit<Testimonial, "id" | "createdAt" | "updatedAt">): Testimonial {
    const db = readDB();
    const testimonial: Testimonial = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.testimonials.push(testimonial);
    writeDB(db);
    return testimonial;
  },

  update(id: string, data: Partial<Omit<Testimonial, "id" | "createdAt">>): Testimonial | null {
    const db = readDB();
    const idx = db.testimonials.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    db.testimonials[idx] = { ...db.testimonials[idx], ...data, updatedAt: now() };
    writeDB(db);
    return db.testimonials[idx];
  },

  delete(id: string): boolean {
    const db = readDB();
    const idx = db.testimonials.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    db.testimonials.splice(idx, 1);
    writeDB(db);
    return true;
  },
};

// --- Awards ---
export const awards = {
  findMany(): Award[] {
    const db = readDB();
    return [...db.awards].sort((a, b) => a.order - b.order);
  },

  create(data: Omit<Award, "id" | "createdAt" | "updatedAt">): Award {
    const db = readDB();
    const award: Award = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.awards.push(award);
    writeDB(db);
    return award;
  },

  update(id: string, data: Partial<Omit<Award, "id" | "createdAt">>): Award | null {
    const db = readDB();
    const idx = db.awards.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    db.awards[idx] = { ...db.awards[idx], ...data, updatedAt: now() };
    writeDB(db);
    return db.awards[idx];
  },

  delete(id: string): boolean {
    const db = readDB();
    const idx = db.awards.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    db.awards.splice(idx, 1);
    writeDB(db);
    return true;
  },
};

// --- Gallery ---
export const gallery = {
  findMany(): GalleryImage[] {
    const db = readDB();
    return [...db.gallery].sort((a, b) => a.order - b.order);
  },

  create(data: Omit<GalleryImage, "id" | "createdAt" | "updatedAt">): GalleryImage {
    const db = readDB();
    const image: GalleryImage = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    db.gallery.push(image);
    writeDB(db);
    return image;
  },

  update(id: string, data: Partial<Omit<GalleryImage, "id" | "createdAt">>): GalleryImage | null {
    const db = readDB();
    const idx = db.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    db.gallery[idx] = { ...db.gallery[idx], ...data, updatedAt: now() };
    writeDB(db);
    return db.gallery[idx];
  },

  delete(id: string): boolean {
    const db = readDB();
    const idx = db.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    db.gallery.splice(idx, 1);
    writeDB(db);
    return true;
  },
};

// --- Messages ---
export const messages = {
  findMany(filter?: { read?: boolean }): ContactMessage[] {
    const db = readDB();
    let items = [...db.messages];
    if (filter?.read !== undefined) {
      items = items.filter((m) => m.read === filter.read);
    }
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  create(data: Omit<ContactMessage, "id" | "read" | "createdAt">): ContactMessage {
    const db = readDB();
    const message: ContactMessage = {
      ...data,
      id: generateId(),
      read: false,
      createdAt: now(),
    };
    db.messages.push(message);
    writeDB(db);
    return message;
  },

  markAsRead(ids: string[]): number {
    const db = readDB();
    let count = 0;
    for (const id of ids) {
      const idx = db.messages.findIndex((m) => m.id === id);
      if (idx !== -1) {
        db.messages[idx].read = true;
        count++;
      }
    }
    writeDB(db);
    return count;
  },

  delete(id: string): boolean {
    const db = readDB();
    const idx = db.messages.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    db.messages.splice(idx, 1);
    writeDB(db);
    return true;
  },
};

// --- Settings ---
export const settings = {
  get(): SiteSettings {
    const db = readDB();
    return db.settings;
  },

  update(data: Partial<Omit<SiteSettings, "id">>): SiteSettings {
    const db = readDB();
    db.settings = { ...db.settings, ...data };
    writeDB(db);
    return db.settings;
  },
};
