import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { rupeesToPaise } from "../src/lib/money";

const prisma = new PrismaClient();

async function main() {
  const raw = fs.readFileSync(path.join(process.cwd(), "data", "db.json"), "utf-8");
  const db = JSON.parse(raw);

  const email = process.env.ADMIN_EMAIL || "admin@crestyve.com";
  const password = process.env.ADMIN_PASSWORD || "crestyve2024";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name: "Admin" },
    create: { email, passwordHash, role: "ADMIN", name: "Admin" },
  });

  for (const c of db.categories ?? []) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        image: c.image,
        order: c.order ?? 0,
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        order: c.order ?? 0,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      },
    });
  }

  for (const p of db.products ?? []) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        pricePaise: rupeesToPaise(Number(p.price)),
        images: p.images || [],
        video: p.video || null,
        categoryId: p.categoryId,
        materials: p.materials || [],
        sizes: p.sizes || [],
        available: p.available ?? true,
        featured: p.featured ?? false,
        artistNotes: p.artistNotes,
        beforeImage: p.beforeImage,
        afterImage: p.afterImage,
        order: p.order ?? 0,
      },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        pricePaise: rupeesToPaise(Number(p.price)),
        images: p.images || [],
        video: p.video || null,
        categoryId: p.categoryId,
        materials: p.materials || [],
        sizes: p.sizes || [],
        available: p.available ?? true,
        featured: p.featured ?? false,
        artistNotes: p.artistNotes,
        beforeImage: p.beforeImage,
        afterImage: p.afterImage,
        order: p.order ?? 0,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      },
    });
  }

  for (const t of db.testimonials ?? []) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        role: t.role,
        content: t.content,
        image: t.image,
        featured: t.featured ?? false,
        order: t.order ?? 0,
      },
      create: {
        id: t.id,
        name: t.name,
        role: t.role,
        content: t.content,
        image: t.image,
        featured: t.featured ?? false,
        order: t.order ?? 0,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      },
    });
  }

  for (const a of db.awards ?? []) {
    await prisma.award.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        description: a.description,
        year: a.year,
        image: a.image,
        order: a.order ?? 0,
      },
      create: {
        id: a.id,
        title: a.title,
        description: a.description,
        year: a.year,
        image: a.image,
        order: a.order ?? 0,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
      },
    });
  }

  for (const g of db.gallery ?? []) {
    await prisma.galleryImage.upsert({
      where: { id: g.id },
      update: {
        title: g.title,
        url: g.url,
        category: g.category,
        featured: g.featured ?? false,
        order: g.order ?? 0,
      },
      create: {
        id: g.id,
        title: g.title,
        url: g.url,
        category: g.category,
        featured: g.featured ?? false,
        order: g.order ?? 0,
        createdAt: new Date(g.createdAt),
        updatedAt: new Date(g.updatedAt),
      },
    });
  }

  for (const m of db.messages ?? []) {
    const existing = await prisma.contactMessage.findUnique({ where: { id: m.id } });
    if (!existing) {
      await prisma.contactMessage.create({
        data: {
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          message: m.message,
          read: m.read ?? false,
          createdAt: new Date(m.createdAt),
        },
      });
    }
  }

  const s = db.settings ?? {};
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      heroTitle: s.heroTitle || "Wear Your Story",
      heroSubtitle: s.heroSubtitle || "Handcrafted Fashion. Painted with Passion.",
      heroVideo: s.heroVideo,
      aboutTitle: s.aboutTitle,
      aboutContent: s.aboutContent,
      artistImage: s.artistImage,
      whatsappNumber: s.whatsappNumber || "+918884942210",
      instagramHandle: s.instagramHandle || "@crestyve",
      email: s.email || "hello@crestyve.com",
      studioAddress: s.studioAddress,
      mapEmbedUrl: s.mapEmbedUrl,
    },
    create: {
      id: "default",
      heroTitle: s.heroTitle || "Wear Your Story",
      heroSubtitle: s.heroSubtitle || "Handcrafted Fashion. Painted with Passion.",
      heroVideo: s.heroVideo,
      aboutTitle: s.aboutTitle,
      aboutContent: s.aboutContent,
      artistImage: s.artistImage,
      whatsappNumber: s.whatsappNumber || "+918884942210",
      instagramHandle: s.instagramHandle || "@crestyve",
      email: s.email || "hello@crestyve.com",
      studioAddress: s.studioAddress,
      mapEmbedUrl: s.mapEmbedUrl,
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
