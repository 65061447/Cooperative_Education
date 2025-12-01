import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickMenu from "@/components/QuickMenu";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <QuickMenu />
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
