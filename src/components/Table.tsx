import { useState } from "react";
import { FileText, Users, ImageIcon, PlayCircle, MapPin, ExternalLink } from "lucide-react";

const Table = () => {
  const [activeTab, setActiveTab] = useState("recruitment");

  const tabs = [
    { id: "recruitment", label: "รับสมัครบุคลากร", icon: Users },
    { id: "images", label: "ภาพประชาสัมพันธ์", icon: ImageIcon },
    { id: "videos", label: "วีดีโอประชาสัมพันธ์", icon: PlayCircle },
  ];

  // Mocked rich content for context
  const content = {
    recruitment: {
      description: "ประกาศรับสมัครบุคคลเพื่อเลือกสรรเป็นพนักงานประกันสังคม และลูกจ้างชั่วคราว ประจำปี 2569",
      items: [
        { date: "02 ก.พ.", title: "เรียกผู้ผ่านการสรรหาฯ กลุ่มทั่วไป มารายงานตัวเพื่อบรรจุเป็นพนักงาน", pinned: true },
        { date: "29 ธ.ค.", title: "ประกาศรายชื่อผู้มีสิทธิเข้ารับการประเมินความเหมาะสมกับตำแหน่งนิติกร", pinned: true },
        { date: "24 ธ.ค.", title: "รับสมัครบุคคลเพื่อคัดเลือกเป็นลูกจ้างชั่วคราว ตำแหน่งเจ้าพนักงานประกันสังคม", pinned: false },
      ]
    },
    images: {
      description: "ประมวลภาพกิจกรรมและโครงการสำคัญของสำนักงานประกันสังคมทั่วประเทศ",
      grid: [
        { url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400", title: "โครงการ สปส. มอบความสุข" },
        { url: "https://images.unsplash.com/photo-1521791136364-798a7bc0d262?q=80&w=400", title: "สัมมนาผู้ประกอบการยุคใหม่" },
        { url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=400", title: "ตรวจเยี่ยมสถานพยาบาลเครือข่าย" },
      ]
    },
    videos: {
      description: "สื่อวิดีโอแนะนำสิทธิประโยชน์และขั้นตอนการใช้งานระบบ E-Service",
      video: {
        thumbnail: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=800",
        title: "รู้จักสิทธิประโยชน์ ม.33 ม.39 และ ม.40 ภายใน 5 นาที",
        duration: "05:12"
      }
    }
  };

  return (
    <div className="bg-[#f0f2f5] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row bg-white border border-gray-300 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* --- SIDE NAVIGATION --- */}
          <div className="w-full lg:w-[280px] bg-[#f2f2f2] border-r border-gray-300">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-4 text-left border-b border-gray-300 transition-all relative
                  ${activeTab === tab.id ? "bg-white" : "hover:bg-gray-200"}`}
              >
                {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#334e5e]" />}
                <tab.icon className={`h-6 w-6 ${activeTab === tab.id ? "text-[#334e5e]" : "text-gray-400"}`} />
                <span className={`text-[15px] font-bold ${activeTab === tab.id ? "text-[#334e5e]" : "text-gray-500"}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* --- CONTENT AREA --- */}
          <div className="flex-grow flex flex-col">
            {/* Header Context */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-[#334e5e] text-sm font-semibold italic">
                {content[activeTab]?.description || "อัปเดตข้อมูลข่าวสารล่าสุดจากสำนักงานประกันสังคม"}
              </p>
            </div>

            <div className="p-0 flex-grow">
              {/* --- CASE: Recruitment/PR List --- */}
              {activeTab === "recruitment" && content.recruitment.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className="flex-shrink-0 w-8 flex justify-center">
                    {item.pinned ? <MapPin className="h-4 w-4 text-[#8b2b3a] fill-[#8b2b3a]" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <p className="flex-grow text-[#334e5e] text-[14px] font-medium truncate group-hover:text-[#d4c391]">{item.title}</p>
                  <div className="bg-[#f2e8cf] min-w-[65px] py-1 border border-[#d4c391]/40 rounded-sm text-center">
                    <p className="text-[#334e5e] font-black text-xs leading-none">{item.date.split(' ')[0]}</p>
                    <p className="text-[#334e5e] font-bold text-[9px] uppercase">{item.date.split(' ')[1]}</p>
                  </div>
                </div>
              ))}

              {/* --- CASE: Images Gallery --- */}
              {activeTab === "images" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                  {content.images.grid.map((img, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-lg border border-gray-200">
                      <img src={img.url} alt={img.title} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                        <p className="text-white text-[10px] font-bold truncate">{img.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- CASE: Video Player --- */}
              {activeTab === "videos" && (
                <div className="p-6">
                  <div className="relative group cursor-pointer overflow-hidden rounded-xl border-4 border-gray-100 shadow-md">
                    <img src={content.videos.video.thumbnail} className="w-full h-64 object-cover" alt="video" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <PlayCircle className="h-10 w-10 text-[#334e5e] fill-[#334e5e]/20" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h4 className="font-black text-lg drop-shadow-md">{content.videos.video.title}</h4>
                      <span className="text-xs bg-[#d4c391] text-[#334e5e] px-2 py-0.5 rounded font-bold">Length: {content.videos.video.duration}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 flex justify-end bg-gray-50/50 border-t border-gray-100">
              <button className="bg-[#d4c391] hover:bg-[#334e5e] hover:text-white text-[#334e5e] font-black py-2 px-6 rounded text-sm flex items-center gap-2 transition-all">
                ดูทั้งหมด <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;