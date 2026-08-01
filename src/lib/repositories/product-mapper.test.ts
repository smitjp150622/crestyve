import { describe, it, expect } from "vitest";
import { toProductDto, priceInputToPaise } from "./product-mapper";

describe("product-mapper", () => {
  it("exposes price in rupees from paise", () => {
    const dto = toProductDto({
      id: "1",
      name: "Aurora",
      slug: "aurora",
      description: null,
      pricePaise: 1500000,
      images: [],
      video: null,
      categoryId: "c1",
      materials: [],
      sizes: [],
      available: true,
      featured: false,
      artistNotes: null,
      beforeImage: null,
      afterImage: null,
      order: 0,
      stock: null,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      category: null,
    });
    expect(dto.price).toBe(15000);
  });

  it("converts input rupees to paise", () => {
    expect(priceInputToPaise(15000)).toBe(1500000);
  });
});
