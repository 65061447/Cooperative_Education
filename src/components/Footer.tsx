import { Phone, MessageCircle, Facebook, Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-[#334e5e] text-white w-full mt-auto">
      {/* Container: Maintained pt-9 for top, adjusted pb-4 for a clean bottom edge */}
      <div className="container mx-auto px-6 pt-9 pb-4">
        
        {/* Main Content Grid: Adjusted to mb-6 for a balanced gap above the line */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-6">
          
          {/* Section 1: Identity */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              สำนักงานประกันสังคม
            </h3>
            <div className="text-sm font-medium text-white/90 leading-relaxed">
              <p>สำนักงานใหญ่ 88/28 หมู่ 4 ถ.ติวานนท์</p>
              <p>ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000</p>
              <p className="text-[#d4c391] font-bold mt-2">info@sso1506.com</p>
            </div>
          </div>

          {/* Section 2: Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              ติดต่อเรา
            </h3>
            <div className="flex items-center gap-3">
              <div className="bg-[#d4c391] p-2 rounded-xl shadow-md">
                <Phone className="h-5 w-5 text-[#334e5e]" />
              </div>
              <div>
                <div className="font-black text-xl leading-none">สายด่วน 1506</div>
                <div className="text-xs text-white/60 mt-1">สอบถามได้ตลอด 24 ชั่วโมง</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#00a8b5] p-2 rounded-xl shadow-md">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <Button variant="link" className="text-white hover:text-[#d4c391] p-0 h-auto font-black text-xl">
                  Live Chat
                </Button>
                <div className="text-xs text-white/60">คุยกับเจ้าหน้าที่โดยตรง</div>
              </div>
            </div>
          </div>

          {/* Section 3: Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              ลิงก์ที่สำคัญ
            </h3>
            <ul className="space-y-2 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#d4c391] transition-all">เกี่ยวกับเรา</a></li>
              <li><a href="#" className="hover:text-[#d4c391] transition-all">สิทธิประโยชน์</a></li>
              <li><a href="#" className="hover:text-[#d4c391] transition-all">ดาวน์โหลดแบบฟอร์ม</a></li>
            </ul>
          </div>

          {/* Section 4: Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              ติดตามเรา
            </h3>
            <div className="flex gap-3 mb-4">
              {[Facebook, Youtube, Send].map((Icon, i) => (
                <Button key={i} size="icon" className="h-10 w-10 bg-white/10 hover:bg-[#d4c391] hover:text-[#334e5e] rounded-full transition-all border border-white/5">
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
            <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
              ผู้เข้าชม: 13,420,709 คน
            </div>
          </div>
        </div>

        {/* --- Copyright Section: pt-4 for a balanced gap below the line --- */}
        <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center text-[8px] leading-none font-medium text-white/20 uppercase tracking-normal">
          <p>© 2026 Social Security Office. All right reserved.</p>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
            <button className="bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded text-[7px] border border-white/5">
              RE-CONSENT
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;