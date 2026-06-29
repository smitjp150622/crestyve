import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppLink(productName?: string): string {
  const phone = "918884942210";
  const message = productName
    ? `Hi, I'm interested in "${productName}". Can you share more information?`
    : "Hi, I'm interested in CRESTYVE. Can you share more information?";

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
