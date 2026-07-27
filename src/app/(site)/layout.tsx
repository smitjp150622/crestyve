import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <SmoothScroll>
        <Navbar />
        {children}
        <Footer />
        <WhatsAppFloat />
        <CartDrawer />
      </SmoothScroll>
    </CartProvider>
  );
}
