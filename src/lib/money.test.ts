import { describe, it, expect } from "vitest";
import { rupeesToPaise, paiseToRupees, formatInr } from "./money";

describe("money", () => {
  it("converts rupees to paise", () => {
    expect(rupeesToPaise(15000)).toBe(1500000);
    expect(rupeesToPaise(0)).toBe(0);
  });

  it("converts paise to rupees", () => {
    expect(paiseToRupees(1500000)).toBe(15000);
  });

  it("rounds fractional rupees to nearest paise", () => {
    expect(rupeesToPaise(10.555)).toBe(1056);
  });

  it("formats INR from paise", () => {
    expect(formatInr(1500000)).toBe("₹15,000");
  });
});
