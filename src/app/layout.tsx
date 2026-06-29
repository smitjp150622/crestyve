import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CRESTYVE | Wear Your Story",
    template: "%s | CRESTYVE",
  },
  description:
    "Luxury handcrafted fashion. Each piece is one of one, painted with passion. Wearable art that tells your story.",
  keywords: [
    "luxury fashion",
    "handcrafted",
    "hand painted",
    "wearable art",
    "custom fashion",
    "CRESTYVE",
    "hand painted jacket",
    "custom denim",
  ],
  authors: [{ name: "CRESTYVE" }],
  creator: "CRESTYVE",
  openGraph: {
    title: "CRESTYVE | Wear Your Story",
    description:
      "Luxury handcrafted fashion. Each piece is one of one, painted with passion.",
    siteName: "CRESTYVE",
    locale: "en_IN",
    type: "website",
    url: "https://crestyve.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "CRESTYVE | Wear Your Story",
    description:
      "Luxury handcrafted fashion. Each piece is one of one, painted with passion.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${manrope.variable}`}
    >
      <body className="bg-light text-text antialiased overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
