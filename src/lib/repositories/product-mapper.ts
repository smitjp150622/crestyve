import { paiseToRupees, rupeesToPaise } from "@/lib/money";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export function toProductDto(p: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricePaise: number;
  images: string[];
  video: string | null;
  categoryId: string;
  materials: string[];
  sizes: string[];
  available: boolean;
  featured: boolean;
  artistNotes: string | null;
  beforeImage: string | null;
  afterImage: string | null;
  order: number;
  stock: number | null;
  createdAt: Date;
  updatedAt: Date;
  category?: CategoryRow | null;
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? undefined,
    price: paiseToRupees(p.pricePaise),
    images: p.images,
    video: p.video ?? undefined,
    categoryId: p.categoryId,
    materials: p.materials,
    sizes: p.sizes,
    available: p.available,
    featured: p.featured,
    artistNotes: p.artistNotes ?? undefined,
    beforeImage: p.beforeImage ?? undefined,
    afterImage: p.afterImage ?? undefined,
    order: p.order,
    stock: p.stock,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
          description: p.category.description ?? undefined,
          image: p.category.image ?? undefined,
          order: p.category.order,
          createdAt: p.category.createdAt.toISOString(),
          updatedAt: p.category.updatedAt.toISOString(),
        }
      : null,
  };
}

export function priceInputToPaise(priceRupees: number) {
  return rupeesToPaise(priceRupees);
}
