import { describe, it, expect } from "vitest";
import { computeOrderTotals } from "./totals";

describe("computeOrderTotals", () => {
  it("computes total with discount and shipping", () => {
    const result = computeOrderTotals({
      subtotalPaise: 100000,
      discountPaise: 10000,
      shippingPaise: 5000,
    });
    expect(result).toEqual({
      subtotalPaise: 100000,
      discountPaise: 10000,
      shippingPaise: 5000,
      totalPaise: 95000,
    });
  });

  it("defaults discount and shipping to 0", () => {
    const result = computeOrderTotals({ subtotalPaise: 50000 });
    expect(result.totalPaise).toBe(50000);
  });

  it("clamps discount to subtotal (never goes negative)", () => {
    const result = computeOrderTotals({ subtotalPaise: 1000, discountPaise: 5000 });
    expect(result.discountPaise).toBe(1000);
    expect(result.totalPaise).toBe(0);
  });

  it("clamps negative subtotal to 0", () => {
    const result = computeOrderTotals({ subtotalPaise: -500 });
    expect(result.subtotalPaise).toBe(0);
  });

  it("rounds fractional paise", () => {
    const result = computeOrderTotals({ subtotalPaise: 100.6, shippingPaise: 49.4 });
    expect(result.subtotalPaise).toBe(101);
    expect(result.shippingPaise).toBe(49);
  });
});
