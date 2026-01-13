import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { AccommodationsSlider } from "@/components/AccommodationsSlider";
import { USPGrid } from "@/components/USPGrid";
import { Sustainability } from "@/components/Sustainability";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <AccommodationsSlider />
      <USPGrid />
      <Sustainability />
      <Footer />
    </main>
  );
};

export default Index;
