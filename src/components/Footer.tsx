import { Phone, MessageCircle, Facebook, Youtube, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-[#334e5e] text-white">
      <div className="container mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Section 1: Official Identity */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-6">
              สำนักงานประกันสังคม
            </h3>
            <div className="text-base font-medium text-white/90 leading-relaxed space-y-2">
              <p>สำนักงานใหญ่</p>
              <p>เลขที่ 88/28 หมู่ 4 ถนนติวานนท์ ตำบลตลาดขวัญ</p>
              <p>อำเภอเมือง จังหวัดนนทบุรี 11000</p>
              <p className="mt-4 pt-2 border-t border-white/10">
                อีเมล: <span className="text-[#d4c391] font-bold">info@sso1506.com</span>
              </p>
              <p className="text-sm text-white/50">จำนวนผู้เข้าชม: 13,420,709 คน</p>
            </div>
          </div>

          {/* Section 2: Contact & Live Chat */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-6">
              ติดต่อเรา
            </h3>
            <div className="flex items-center gap-4">
              <div className="bg-[#d4c391] rounded-xl p-3 text-[#334e5e] shadow-lg">
                <Phone className="h-7 w-7" />
              </div>
              <div>
                <div className="font-black text-2xl leading-tight">สายด่วน 1506</div>
                <div className="text-base text-white/70">สอบถามได้ตลอด 24 ชั่วโมง</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#00a8b5] rounded-xl p-3 text-white shadow-lg">
                <MessageCircle className="h-7 w-7" />
              </div>
              <div>
                <Button variant="link" className="text-white hover:text-[#d4c391] p-0 h-auto font-black text-2xl">
                  Live Chat
                </Button>
                <div className="text-base text-white/70">คุยกับเจ้าหน้าที่โดยตรง</div>
              </div>
            </div>
          </div>

          {/* Section 3: Useful Links */}
          <div>
            <h3 className="text-2xl font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-6">
              ลิงก์ที่สำคัญ
            </h3>
            <ul className="space-y-4 text-lg font-semibold">
              <li><a href="#" className="hover:text-[#d4c391] hover:underline underline-offset-4 decoration-2 transition-all">เกี่ยวกับเรา</a></li>
              <li><a href="#" className="hover:text-[#d4c391] hover:underline underline-offset-4 decoration-2 transition-all">สิทธิประโยชน์</a></li>
              <li><a href="#" className="hover:text-[#d4c391] hover:underline underline-offset-4 decoration-2 transition-all">วิธีการสมัคร</a></li>
              <li><a href="#" className="hover:text-[#d4c391] hover:underline underline-offset-4 decoration-2 transition-all">ดาวน์โหลดแบบฟอร์ม</a></li>
            </ul>
          </div>

          {/* Section 4: Social & Policies */}
          <div>
            <h3 className="text-2xl font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-6">
              ติดตามเรา
            </h3>
            <div className="flex gap-4 mb-8">
              {[Facebook, Youtube, Send].map((Icon, i) => (
                <Button key={i} size="icon" className="h-12 w-12 bg-white/20 hover:bg-[#d4c391] hover:text-[#334e5e] rounded-full transition-all">
                  <Icon className="h-6 w-6" />
                </Button>
              ))}
            </div>
            <div className="space-y-3 text-base font-medium text-white/60">
              <a href="#" className="block hover:text-white">ประกาศความเป็นส่วนตัว</a>
              <a href="#" className="block hover:text-white">นโยบายเว็บไซต์</a>
              <a href="#" className="block hover:text-white">นโยบายการคุ้มครองข้อมูล</a>
            </div>
          </div>
        </div>

        {/* --- RE-ADDED COPYRIGHT SECTION --- */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-white/40">
          <p>Copyright © 2026 Social Security Office. All right reserved.</p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="h-auto py-2 px-4 text-sm bg-white/5 hover:bg-white/10 text-white/60 rounded-md">
              Re-Consent
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;