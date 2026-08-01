import type { CartItem, CartAction } from "./types";

function sameLine(a: { productId: string; size: string | null }, b: { productId: string; size: string | null }) {
  return a.productId === b.productId && a.size === b.size;
}

function clampQty(qty: number, maxStock: number | null): number {
  const q = Math.max(1, Math.floor(qty));
  if (maxStock != null) return Math.min(q, maxStock);
  return q;
}

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((line) => sameLine(line, action.item));
      if (existing) {
        const newQty = clampQty(existing.qty + action.qty, existing.maxStock);
        return state.map((line) =>
          sameLine(line, action.item) ? { ...line, qty: newQty } : line
        );
      }
      const qty = clampQty(action.qty, action.item.maxStock);
      return [...state, { ...action.item, qty }];
    }
    case "REMOVE_ITEM": {
      return state.filter((line) => !sameLine(line, action));
    }
    case "UPDATE_QTY": {
      if (action.qty <= 0) {
        return state.filter((line) => !sameLine(line, action));
      }
      return state.map((line) =>
        sameLine(line, action)
          ? { ...line, qty: clampQty(action.qty, line.maxStock) }
          : line
      );
    }
    case "CLEAR":
      return [];
    case "SET_ITEMS":
      return action.items;
    default:
      return state;
  }
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
