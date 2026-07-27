import { describe, it, expect } from "vitest";
import { cartReducer, cartSubtotal, cartCount } from "./reducer";
import type { CartItem } from "./types";

const baseItem: Omit<CartItem, "qty"> = {
  productId: "p1",
  name: "Painted Jacket",
  slug: "painted-jacket",
  image: null,
  price: 2500,
  size: "M",
  maxStock: null,
};

describe("cartReducer", () => {
  it("adds a new item", () => {
    const result = cartReducer([], { type: "ADD_ITEM", item: baseItem, qty: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(1);
  });

  it("merges quantity for same product + size", () => {
    let state = cartReducer([], { type: "ADD_ITEM", item: baseItem, qty: 1 });
    state = cartReducer(state, { type: "ADD_ITEM", item: baseItem, qty: 2 });
    expect(state).toHaveLength(1);
    expect(state[0].qty).toBe(3);
  });

  it("treats different sizes as separate lines", () => {
    let state = cartReducer([], { type: "ADD_ITEM", item: baseItem, qty: 1 });
    state = cartReducer(state, {
      type: "ADD_ITEM",
      item: { ...baseItem, size: "L" },
      qty: 1,
    });
    expect(state).toHaveLength(2);
  });

  it("clamps quantity to maxStock", () => {
    const item = { ...baseItem, maxStock: 2 };
    let state = cartReducer([], { type: "ADD_ITEM", item, qty: 5 });
    expect(state[0].qty).toBe(2);
  });

  it("removes an item", () => {
    let state = cartReducer([], { type: "ADD_ITEM", item: baseItem, qty: 1 });
    state = cartReducer(state, {
      type: "REMOVE_ITEM",
      productId: "p1",
      size: "M",
    });
    expect(state).toHaveLength(0);
  });

  it("updates quantity", () => {
    let state = cartReducer([], { type: "ADD_ITEM", item: baseItem, qty: 1 });
    state = cartReducer(state, {
      type: "UPDATE_QTY",
      productId: "p1",
      size: "M",
      qty: 4,
    });
    expect(state[0].qty).toBe(4);
  });

  it("removes item when quantity updated to 0", () => {
    let state = cartReducer([], { type: "ADD_ITEM", item: baseItem, qty: 1 });
    state = cartReducer(state, {
      type: "UPDATE_QTY",
      productId: "p1",
      size: "M",
      qty: 0,
    });
    expect(state).toHaveLength(0);
  });

  it("clears the cart", () => {
    let state = cartReducer([], { type: "ADD_ITEM", item: baseItem, qty: 1 });
    state = cartReducer(state, { type: "CLEAR" });
    expect(state).toHaveLength(0);
  });
});

describe("cartSubtotal", () => {
  it("sums price * qty across lines", () => {
    const items: CartItem[] = [
      { ...baseItem, qty: 2 },
      { ...baseItem, size: "L", qty: 1 },
    ];
    expect(cartSubtotal(items)).toBe(2500 * 2 + 2500 * 1);
  });
});

describe("cartCount", () => {
  it("sums quantities", () => {
    const items: CartItem[] = [
      { ...baseItem, qty: 2 },
      { ...baseItem, size: "L", qty: 3 },
    ];
    expect(cartCount(items)).toBe(5);
  });
});
