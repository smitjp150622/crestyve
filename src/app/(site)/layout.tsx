import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { SmoothScroll } from "@/components/layout/smooth-scroll";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppFloat />
    </SmoothScroll>
  );
}
