"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQty, removeItem } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="font-cormorant text-2xl text-dark">Your Bag</h3>
              <button onClick={closeCart} aria-label="Close cart" className="p-1 text-muted hover:text-dark">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-10 w-10 text-dark/20 mb-4" />
                  <p className="font-inter text-sm text-muted">Your bag is empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size ?? "std"}`} className="flex gap-4">
                      <div className="w-20 h-24 bg-dark/5 flex-shrink-0 overflow-hidden">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-manrope text-sm font-medium text-dark truncate">{item.name}</p>
                        {item.size && (
                          <p className="font-inter text-xs text-muted mt-0.5">Size {item.size}</p>
                        )}
                        <p className="font-inter text-sm text-dark mt-1">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() => updateQty(item.productId, item.size, item.qty - 1)}
                              className="p-1.5 hover:bg-dark/5 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center font-inter text-xs">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                              className="p-1.5 hover:bg-dark/5 transition-colors"
                              aria-label="Increase quantity"
                              disabled={item.maxStock != null && item.qty >= item.maxStock}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="font-inter text-xs text-muted hover:text-red-600 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-manrope text-sm text-muted">Subtotal</span>
                  <span className="font-cormorant text-xl text-dark">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full text-center bg-primary text-white font-manrope text-sm font-medium tracking-wide py-4 hover:bg-primary/90 transition-colors"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
