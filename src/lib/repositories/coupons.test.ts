import { describe, it, expect } from "vitest";
import { computeDiscountPaise } from "./coupons";

describe("computeDiscountPaise", () => {
  it("computes percent discount", () => {
    expect(computeDiscountPaise("PERCENT", 10, 100000)).toBe(10000);
  });

  it("floors fractional percent discount", () => {
    expect(computeDiscountPaise("PERCENT", 33, 10000)).toBe(3300);
  });

  it("caps percent discount at subtotal", () => {
    expect(computeDiscountPaise("PERCENT", 150, 10000)).toBe(10000);
  });

  it("computes fixed discount", () => {
    expect(computeDiscountPaise("FIXED", 5000, 100000)).toBe(5000);
  });

  it("caps fixed discount at subtotal", () => {
    expect(computeDiscountPaise("FIXED", 999999, 10000)).toBe(10000);
  });
});
