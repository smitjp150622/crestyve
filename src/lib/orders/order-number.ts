function randomSuffix(length: number): string {
  const chars = "0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Generates a human-friendly order number, e.g. CRS-20260728-4821.
 * Uniqueness is enforced at the DB layer (Order.orderNumber is @unique);
 * callers should retry generation on a rare collision.
 */
export function generateOrderNumber(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `CRS-${y}${m}${d}-${randomSuffix(4)}`;
}

export function isValidOrderNumber(value: string): boolean {
  return /^CRS-\d{8}-\d{4}$/.test(value);
}
