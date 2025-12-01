import { Check, Hospital, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const menuItems = [
  {
    icon: Check,
    title: "โบรกตตรองร์ที่กี",
    color: "primary" as const,
  },
  {
    icon: Hospital,
    title: "บริอกรจักเทเพนาน",
    color: "secondary" as const,
  },
  {
    icon: FileText,
    title: "สกคร ม. 40",
    color: "secondary" as const,
  },
];

const QuickMenu = () => {
  return (
    <section className="py-16 bg-background relative -mt-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">เมนูด่วน</h2>
          <div className="h-1 w-20 bg-secondary rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-secondary"
            >
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  ${item.color === 'primary' ? 'bg-primary' : 'bg-secondary'}
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  {item.title}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickMenu;
