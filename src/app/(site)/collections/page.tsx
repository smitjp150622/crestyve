import { getProducts, getCategories } from "@/lib/db";
import CollectionsClient from "./CollectionsClient";

export default async function CollectionsPage() {
  const [allProducts, allCategories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const products = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    images: p.images,
    category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
    featured: p.featured,
    available: p.available,
  }));

  const categories = ["All", ...allCategories.map((c) => c.name)];

  return <CollectionsClient products={products} categories={categories} />;
}
