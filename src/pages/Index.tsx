import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Table from "@/components/Table";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import Infographic from "@/components/Infographics";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Table />
        <Infographic/>
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
