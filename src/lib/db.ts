import { products, categories, testimonials, awards, gallery, messages, settings } from "./json-db";

export async function getProducts(options?: {
  category?: string;
  featured?: boolean;
  limit?: number;
}) {
  const result = products.findMany();
  let items = result.products;

  if (options?.category) {
    items = items.filter((p) => p.category?.slug === options.category);
  }
  if (options?.featured !== undefined) {
    items = items.filter((p) => p.featured === options.featured);
  }

  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (options?.limit) {
    items = items.slice(0, options.limit);
  }

  return items;
}

export async function getProduct(slug: string) {
  return products.findBySlug(slug);
}

export async function getCategories() {
  return categories.findMany({ orderBy: "order" });
}

export async function getTestimonials(featured?: boolean) {
  const items = testimonials.findMany();
  if (featured !== undefined) {
    return items.filter((t) => t.featured === featured);
  }
  return items;
}

export async function getAwards() {
  const items = awards.findMany();
  return items.sort((a, b) => b.year - a.year);
}

export async function getGalleryImages(category?: string) {
  const items = gallery.findMany();
  if (category) {
    return items.filter((g) => g.category === category);
  }
  return items;
}

export async function getSiteSettings() {
  return settings.get();
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return messages.create(data);
}
