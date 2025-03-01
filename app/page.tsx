import Layout from "./layout";
import '../styles/globals.css';
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import WhyPantauTularSection from "@/components/WhyPantauTularSection";
import FeaturesSection from "@/components/AdvantagesSection";
import AboutSection from "@/components/AboutSection";
import HelpSection from "@/components/HelpSection";
import MapGallery from "@/components/MapGallery";

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <MapGallery />
      <WhyPantauTularSection />
      <FeaturesSection />
      <AboutSection />
      <HelpSection />
      <Footer />
    </Layout>
  );
}
