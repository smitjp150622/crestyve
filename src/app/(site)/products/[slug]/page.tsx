import Link from "next/link";
import { getProduct, getProducts, getSiteSettings } from "@/lib/db";
import ProductClient from "./ProductClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, allProducts, settings] = await Promise.all([
    getProduct(slug),
    getProducts({ limit: 4 }),
    getSiteSettings(),
  ]);

  if (!product) {
    return (
      <main className="pt-20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-12 py-32 text-center">
          <h1 className="font-cormorant text-4xl md:text-5xl font-light text-dark mb-6">
            Product Not Found
          </h1>
          <p className="font-inter text-muted mb-8">
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-primary px-8 py-4 font-manrope text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-primary/90"
          >
            Browse Collections
          </Link>
        </div>
      </main>
    );
  }

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const whatsappNumber =
    settings?.whatsappNumber ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    "";

  return (
    <ProductClient
      product={product}
      relatedProducts={relatedProducts}
      whatsappNumber={whatsappNumber}
    />
  );
}
