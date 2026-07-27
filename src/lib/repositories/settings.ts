import { prisma } from "@/lib/prisma";
import type { SiteSettings } from "@/types/cms";

const defaults: SiteSettings = {
  id: "default",
  heroTitle: "Wear Your Story",
  heroSubtitle: "Handcrafted Fashion. Painted with Passion.",
  whatsappNumber: "+918884942210",
  instagramHandle: "@crestyve",
  email: "hello@crestyve.com",
};

function map(row: {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideo: string | null;
  aboutTitle: string | null;
  aboutContent: string | null;
  artistImage: string | null;
  whatsappNumber: string;
  instagramHandle: string;
  email: string;
  studioAddress: string | null;
  mapEmbedUrl: string | null;
  shippingPaise: number;
}): SiteSettings {
  return {
    id: row.id,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    heroVideo: row.heroVideo ?? undefined,
    aboutTitle: row.aboutTitle ?? undefined,
    aboutContent: row.aboutContent ?? undefined,
    artistImage: row.artistImage ?? undefined,
    whatsappNumber: row.whatsappNumber,
    instagramHandle: row.instagramHandle,
    email: row.email,
    studioAddress: row.studioAddress ?? undefined,
    mapEmbedUrl: row.mapEmbedUrl ?? undefined,
    shippingPaise: row.shippingPaise,
  };
}

export const settings = {
  async get(): Promise<SiteSettings> {
    const row = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    return row ? map(row) : defaults;
  },

  async update(data: Partial<Omit<SiteSettings, "id">>): Promise<SiteSettings> {
    const current = await settings.get();
    const row = await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        heroTitle: data.heroTitle ?? current.heroTitle,
        heroSubtitle: data.heroSubtitle ?? current.heroSubtitle,
        heroVideo: data.heroVideo ?? current.heroVideo,
        aboutTitle: data.aboutTitle ?? current.aboutTitle,
        aboutContent: data.aboutContent ?? current.aboutContent,
        artistImage: data.artistImage ?? current.artistImage,
        whatsappNumber: data.whatsappNumber ?? current.whatsappNumber,
        instagramHandle: data.instagramHandle ?? current.instagramHandle,
        email: data.email ?? current.email,
        studioAddress: data.studioAddress ?? current.studioAddress,
        mapEmbedUrl: data.mapEmbedUrl ?? current.mapEmbedUrl,
        shippingPaise: data.shippingPaise ?? current.shippingPaise ?? 0,
      },
      update: {
        ...(data.heroTitle !== undefined && { heroTitle: data.heroTitle }),
        ...(data.heroSubtitle !== undefined && { heroSubtitle: data.heroSubtitle }),
        ...(data.heroVideo !== undefined && { heroVideo: data.heroVideo }),
        ...(data.aboutTitle !== undefined && { aboutTitle: data.aboutTitle }),
        ...(data.aboutContent !== undefined && { aboutContent: data.aboutContent }),
        ...(data.artistImage !== undefined && { artistImage: data.artistImage }),
        ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber }),
        ...(data.instagramHandle !== undefined && { instagramHandle: data.instagramHandle }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.studioAddress !== undefined && { studioAddress: data.studioAddress }),
        ...(data.mapEmbedUrl !== undefined && { mapEmbedUrl: data.mapEmbedUrl }),
        ...(data.shippingPaise !== undefined && { shippingPaise: data.shippingPaise }),
      },
    });
    return map(row);
  },
};
