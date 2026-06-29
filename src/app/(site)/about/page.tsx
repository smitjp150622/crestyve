import { getSiteSettings } from "@/lib/db";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return <AboutClient whatsappNumber={settings.whatsappNumber} />;
}
