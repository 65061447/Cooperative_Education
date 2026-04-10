import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Connecting to your Express backend
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("เข้าสู่ระบบสำเร็จ");

        // ✅ ADD THIS (ONLY CHANGE)
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("user", JSON.stringify(data.user || { username }));

        onLoginSuccess();
      } else {
        toast.error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch (error) {
      toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header matches your "Add Employee" modal style */}
        <DialogHeader className="bg-[#415a67] p-6 text-white flex flex-row items-center gap-3">
          <div className="bg-[#d4c38f] p-2 rounded-lg">
            <ShieldCheck className="text-[#415a67]" size={24} />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-white">เข้าสู่ระบบ</DialogTitle>
            <p className="text-slate-300 text-xs">สำนักบริหารเทคโนโลยีสารสนเทศ</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleLogin} className="p-8 space-y-6 bg-white">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <Input
                placeholder="ชื่อผู้ใช้งาน"
                className="pl-10 h-11 border-slate-200 focus:ring-[#415a67]"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <Input
                type="password"
                placeholder="รหัสผ่าน"
                className="pl-10 h-11 border-slate-200 focus:ring-[#415a67]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-11 bg-[#415a67] hover:bg-[#344954] text-white font-bold rounded-md transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : "ยืนยันการเข้าใช้งาน"}
          </Button>
          
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
            Social Security Office | SSO System
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}