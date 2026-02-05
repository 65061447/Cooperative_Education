import React from "react";
import { Palette, ChevronRight } from "lucide-react";

// Define the shape for Type Safety
interface InfographicItem {
  image: string;
  title: string;
}

const infographics: InfographicItem[] = [
  { 
    image: "https://www.sso.go.th/wpr/assets/upload/images/sso/65afe8f1e3f41cacba4923ba1360578a.jpg", 
    title: "รวมช่องทางชำระเงินสมทบ" 
  },
  { 
    image: "https://www.sso.go.th/wpr/assets/upload/images/sso/5b8153e3ce065c2944267ae5122e132f.png", 
    title: "สิทธิประโยชน์ประกันสังคม" 
  },
  { 
    image: "https://www.sso.go.th/wpr/assets/upload/images/sso/06978b68627dd72dc18095b0e31ea846.PNG", 
    title: "ข้อมูลสิทธิประโยชน์" 
  },
];

const Infographic: React.FC = () => {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        
        {/* SSO Infographic Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4 w-full max-w-4xl">
            <div className="h-[1px] flex-grow bg-gray-200 border-t border-dashed" />
            <div className="w-16 h-16 rounded-full border border-[#d4c391] flex items-center justify-center bg-white shadow-sm">
              <Palette className="h-8 w-8 text-[#d4c391]" />
            </div>
            <div className="h-[1px] flex-grow bg-gray-200 border-t border-dashed" />
          </div>
          <h2 className="text-gray-400 font-bold mt-4 uppercase tracking-widest text-sm">
            SSO Infographic
          </h2>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {infographics.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-300 group-hover:shadow-2xl group-hover:border-[#d4c391]">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Visual Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white/90 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <ChevronRight className="h-6 w-6 text-[#334e5e]" />
                   </div>
                </div>
              </div>
              {/* Optional Title Label below image */}
              <p className="mt-3 text-center text-[#334e5e] font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Infographic;