import {
  Hero,
  Story,
  Craftsmanship,
  CollectionsPreview,
  MakingProcess,
  Statistics,
  Testimonials,
  InstagramFeed,
  CTA,
} from "@/components/sections";
import { getProducts, getTestimonials, getSiteSettings } from "@/lib/db";

export default async function HomePage() {
  const [products, testimonials, siteSettings] = await Promise.all([
    getProducts({ featured: true, limit: 4 }),
    getTestimonials(true),
    getSiteSettings(),
  ]);

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918884942210";

  return (
    <main>
      <Hero
        title={siteSettings?.heroTitle}
        subtitle={siteSettings?.heroSubtitle}
        whatsappNumber={whatsappNumber}
      />
      <Story />
      <CollectionsPreview products={products} whatsappNumber={whatsappNumber} />
      <Craftsmanship />
      <MakingProcess />
      <Statistics />
      <Testimonials testimonials={testimonials} />
      <InstagramFeed />
      <CTA whatsappNumber={whatsappNumber} />
    </main>
  );
}
