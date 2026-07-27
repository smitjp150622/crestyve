export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  size: string | null;
  qty: number;
  maxStock: number | null;
}

export type CartAction =
  | { type: "ADD_ITEM"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "REMOVE_ITEM"; productId: string; size: string | null }
  | { type: "UPDATE_QTY"; productId: string; size: string | null; qty: number }
  | { type: "CLEAR" }
  | { type: "SET_ITEMS"; items: CartItem[] };
