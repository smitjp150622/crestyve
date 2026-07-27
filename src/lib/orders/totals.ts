export interface OrderTotalsInput {
  subtotalPaise: number;
  discountPaise?: number;
  shippingPaise?: number;
}

export interface OrderTotals {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
}

/**
 * Computes final order totals, guaranteeing the total is never negative and
 * the discount never exceeds the subtotal (defensive against bad coupon math).
 */
export function computeOrderTotals(input: OrderTotalsInput): OrderTotals {
  const subtotalPaise = Math.max(0, Math.round(input.subtotalPaise));
  const discountPaise = Math.max(0, Math.min(subtotalPaise, Math.round(input.discountPaise ?? 0)));
  const shippingPaise = Math.max(0, Math.round(input.shippingPaise ?? 0));
  const totalPaise = subtotalPaise - discountPaise + shippingPaise;

  return { subtotalPaise, discountPaise, shippingPaise, totalPaise };
}
