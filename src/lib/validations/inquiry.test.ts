import { describe, it, expect } from "vitest";
import { inquiryCreateSchema, inquiryStatusSchema } from "./inquiry";

describe("inquiryCreateSchema", () => {
  it("accepts valid payload", () => {
    const parsed = inquiryCreateSchema.parse({
      customerName: "Rahul",
      phone: "+919876543210",
      productId: "prod-001",
      selectedSize: "M",
    });
    expect(parsed.customerName).toBe("Rahul");
  });

  it("rejects missing phone", () => {
    expect(() =>
      inquiryCreateSchema.parse({ customerName: "A", productId: "p1" })
    ).toThrow();
  });

  it("rejects missing productId", () => {
    expect(() =>
      inquiryCreateSchema.parse({ customerName: "A", phone: "9876543210" })
    ).toThrow();
  });
});

describe("inquiryStatusSchema", () => {
  it("accepts known statuses", () => {
    expect(inquiryStatusSchema.parse("COMPLETED")).toBe("COMPLETED");
  });

  it("rejects unknown status", () => {
    expect(() => inquiryStatusSchema.parse("DONE")).toThrow();
  });
});
