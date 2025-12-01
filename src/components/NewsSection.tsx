import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const newsItems = [
  {
    title: "แนบชื่อทศิกรยงสกงรป์ 2597",
    description: "ข้อกตรยงด แยกเพอชร์ทีร์ด๊ แกวเกส์ชหเด้",
    date: "15 มกราคม 2567",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "แนพชื่อทึมเรกรยางสกปี",
    description: "ข่อกตระยงด แยกเพอชร์ทึร์ด๊ แกวเกส์ชเด้",
    date: "10 มกราคม 2567",
    image: "https://images.unsplash.com/photo-1573496774426-fe3db3dd1731?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Q&A คำถามที่พบบ่อย",
    description: "ปรึกษาข้อมูลเกี่ยวกับสิทธิประโยชน์",
    date: "5 มกราคม 2567",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
  },
];

const NewsSection = () => {
  return (
    <section className="py-16 bg-muted/30">
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
