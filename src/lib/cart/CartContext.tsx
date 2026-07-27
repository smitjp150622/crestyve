"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { cartReducer, cartSubtotal, cartCount } from "./reducer";
import type { CartItem } from "./types";

const STORAGE_KEY = "crestyve_cart_v1";

interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  count: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string, size: string | null) => void;
  updateQty: (productId: string, size: string | null, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: "SET_ITEMS", items: parsed });
        }
      }
    } catch {
      // ignore corrupt cart storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    dispatch({ type: "ADD_ITEM", item, qty });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    dispatch({ type: "REMOVE_ITEM", productId, size });
  }, []);

  const updateQty = useCallback((productId: string, size: string | null, qty: number) => {
    dispatch({ type: "UPDATE_QTY", productId, size, qty });
  }, []);

  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value: CartContextValue = {
    items,
    subtotal: cartSubtotal(items),
    count: cartCount(items),
    isOpen,
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem,
    removeItem,
    updateQty,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
