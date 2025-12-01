import { Phone, MessageCircle, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ติดต่อเรา</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-secondary rounded-full p-2">
                  <Phone className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <div className="font-semibold">สายด่วน 1506</div>
                  <div className="text-sm text-primary-foreground/80">
                    Q&A ตอบคำถามตลอด 24 ชั่วโมง
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-secondary rounded-full p-2">
                  <MessageCircle className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <Button 
                    variant="link" 
                    className="text-primary-foreground hover:text-secondary p-0 h-auto font-semibold"
                  >
                    Live Chat
                  </Button>
                  <div className="text-sm text-primary-foreground/80">
                    พูดคุยกับเจ้าหน้าที่
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">ลิงก์ที่เป็นประโยชน์</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  เกี่ยวกับเรา
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  สิทธิประโยชน์
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  วิธีการสมัคร
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-secondary transition-colors">
                  ดาวน์โหลดแบบฟอร์ม
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">ติดตามเรา</h3>
            <div className="flex gap-3">
              <Button 
                size="icon" 
                variant="outline" 
                className="border-primary-foreground/20 hover:bg-secondary hover:border-secondary text-primary-foreground"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="border-primary-foreground/20 hover:bg-secondary hover:border-secondary text-primary-foreground"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="border-primary-foreground/20 hover:bg-secondary hover:border-secondary text-primary-foreground"
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-6 text-sm text-primary-foreground/80">
              <p>สำนักงานประกันสังคม</p>
              <p>เลขที่ 88/28 หมู่ 4</p>
              <p>ถนนติวานนท์ ตำบลตลาดขวัญ</p>
              <p>อำเภอเมือง จังหวัดนนทบุรี 11000</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/80">
          <p>© 2567 สำนักงานประกันสังคม สงวนลิขสิทธิ์</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
