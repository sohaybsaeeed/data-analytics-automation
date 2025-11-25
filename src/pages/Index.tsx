import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DataSources from "@/components/DataSources";
import DataPipeline from "@/components/DataPipeline";
import HowItWorks from "@/components/HowItWorks";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
const Index = () => {
  return <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <div id="features">
          <Features />
        </div>
        <DataSources />
        <DataPipeline className="bg-slate-400 text-transparent" />
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <CTA />
      </main>
      <Footer />
    </div>;
};
export default Index;