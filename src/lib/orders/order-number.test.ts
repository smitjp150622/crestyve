import { describe, it, expect } from "vitest";
import { generateOrderNumber, isValidOrderNumber } from "./order-number";

describe("generateOrderNumber", () => {
  it("produces a CRS-YYYYMMDD-XXXX formatted number", () => {
    const orderNumber = generateOrderNumber(new Date("2026-07-28T10:00:00Z"));
    expect(orderNumber).toMatch(/^CRS-20260728-\d{4}$/);
  });

  it("is recognized as valid by isValidOrderNumber", () => {
    const orderNumber = generateOrderNumber();
    expect(isValidOrderNumber(orderNumber)).toBe(true);
  });

  it("rejects malformed order numbers", () => {
    expect(isValidOrderNumber("random-string")).toBe(false);
    expect(isValidOrderNumber("CRS-2026-1")).toBe(false);
  });
});
