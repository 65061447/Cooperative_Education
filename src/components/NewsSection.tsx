import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const newsItems = [
  {
    title: "ประกาศอัตราเงินสมทบประกันสังคม ปี 2569",
    description: "ข้อมูลอัตราเงินสมทบล่าสุด และแนวทางการชำระเงิน สำหรับผู้ประกันตนทุกประเภท",
    date: "15 มกราคม 2569",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "เปิดให้บริการแอปพลิเคชัน SSO+",
    description: "ตรวจสอบสิทธิ์ ชำระเงิน และยื่นเอกสารได้ทุกที่ทุกเวลาผ่านมือถือ",
    date: "10 มกราคม 2569",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "สิทธิประโยชน์กรณีว่างงาน",
    description: "แนะนำสิทธิรับเงินชดเชยกรณีว่างงาน และวิธีการยื่นคำขอ",
    date: "5 มกราคม 2569",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=400&q=80",
  },
];

const NewsSection = () => {
  return (
    /* ADDED ID AND SCROLL MARGIN HERE */
    <section id="news-section" className="py-16 bg-muted/30 scroll-mt-10">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">ข่าวสารล่าสุด</h2>
          <div className="h-1 w-20 bg-secondary rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {newsItems.map((item, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{item.date}</span>
                </div>
                <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {item.description}
                </p>
                <Button variant="link" className="p-0 h-auto text-secondary hover:text-secondary/80">
                  อ่านต่อ →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;