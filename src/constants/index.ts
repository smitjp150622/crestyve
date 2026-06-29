export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
] as const;

export const WHATSAPP_NUMBER = "+918884942210";

export const WHATSAPP_BASE_URL = "https://wa.me";

export const SOCIAL_LINKS = {
  whatsapp: {
    number: "+91 88849 42210",
    url: `${WHATSAPP_BASE_URL}/${WHATSAPP_NUMBER}`,
  },
  instagram: {
    handle: "@crestyve",
    url: "https://instagram.com/crestyve",
  },
  email: {
    address: "hello@crestyve.com",
    url: "mailto:hello@crestyve.com",
  },
} as const;

export const SITE_CONFIG = {
  name: "CRESTYVE",
  tagline: "Luxury Redefined",
  description:
    "Discover handcrafted luxury fashion that blends timeless elegance with contemporary design. Each piece is a statement of refined taste and unparalleled craftsmanship.",
} as const;

export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    default: 0.6,
    slow: 0.9,
    reveal: 1.2,
  },
  ease: {
    luxury: [0.16, 1, 0.3, 1] as const,
    smooth: [0.33, 1, 0.68, 1] as const,
    bounce: [0.34, 1.56, 0.64, 1] as const,
  },
  stagger: {
    fast: 0.05,
    default: 0.1,
    slow: 0.15,
  },
} as const;
