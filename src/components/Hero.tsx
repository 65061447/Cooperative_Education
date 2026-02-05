import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, Building2, Hospital, FolderOpen, HelpCircle, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "สิทธิพิเศษ เพื่อผู้ประกันตน",
    description: "มั่นใจในทุกช่วงชีวิต ด้วยสวัสดิการที่ครอบคลุม",
    buttonText: "ตรวจสอบสิทธิ์",
  },
  {
    title: "SSO E-SERVICE",
    description: "บริการออนไลน์ เข้าถึงง่าย ทุกที่ ทุกเวลา",
    buttonText: "เข้าสู่ระบบ",
  }
];

const menuItems = [
  { icon: UserCheck, title: "ผู้ประกันตน" },
  { icon: Building2, title: "สถานประกอบการ" },
  { icon: Hospital, title: "สถานพยาบาล" },
  { icon: FolderOpen, title: "ข้อมูลทั่วไป" },
  { icon: HelpCircle, title: "คำถามที่พบบ่อย" },
  { icon: MapPin, title: "สปส. จังหวัด" },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      {/* --- BANNER SECTION --- */}
      <section className="relative w-full h-[400px] md:h-[480px] bg-[#334e5e] overflow-hidden">
        {/* Navigation Arrows */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/30 hover:text-white transition-all">
          <ChevronLeft className="h-12 w-12" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 text-white/30 hover:text-white transition-all">
          <ChevronRight className="h-12 w-12" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <div key={currentSlide} className="animate-fade-in text-center px-4 z-10">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-md">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium mb-8">
              {slides[currentSlide].description}
            </p>
            <Button className="bg-[#d4c391] hover:bg-[#c4b381] text-[#334e5e] font-black text-xl px-12 py-6 rounded-full shadow-lg">
              {slides[currentSlide].buttonText}
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === i ? "bg-[#d4c391] w-12" : "bg-white/20 w-2.5"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- OFFICIAL STYLE E-SERVICE BAR (LEFT SLANTED) --- */}
      <div className="w-full bg-[#334e5e] border-t border-white/10 shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[100px]">
          
          {/* Slanted Gold Section */}
          <div 
            className="relative bg-[#d4c391] py-4 pl-12 pr-20 flex items-center justify-center lg:justify-start min-w-[320px] z-20"
            style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }} // Slant to the left at the bottom
          >
            <div className="text-center lg:text-left">
              <h2 className="text-[#334e5e] font-black text-2xl leading-[0.9]">SSO</h2>
              <h2 className="text-[#334e5e] font-black text-2xl leading-[0.9]">E-SERVICE</h2>
            </div>
          </div>

          {/* Icons Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-6 flex-grow items-center px-4 lg:-ml-8 py-4 lg:py-0">
            {menuItems.map((item, index) => (
              <a 
                key={index} 
                href="#" 
                className="flex flex-col items-center justify-center gap-1 group transition-all hover:opacity-80"
              >
                <item.icon className="h-8 w-8 text-white stroke-[1.5px] group-hover:text-[#d4c391] transition-colors" />
                <span className="font-bold text-[13px] text-white text-center leading-tight">
                  {item.title}
                </span>
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;