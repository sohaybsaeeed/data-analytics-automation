import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DataSources from "@/components/DataSources";
import DataPipeline from "@/components/DataPipeline";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <div id="features">
          
        </div>
        <DataSources />
        <DataPipeline />
        <div id="how-it-works" />
        <CTA />
      </main>
      <Footer />
    </div>;
};
export default Index;