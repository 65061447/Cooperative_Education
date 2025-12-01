import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Header = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <div className="text-primary font-bold text-2xl">
              SSO
            </div>
            <div className="text-sm leading-tight hidden md:block">
              <div className="font-semibold text-foreground">สำนักงานประกันสังคม</div>
              <div className="text-xs text-muted-foreground">SOCIAL SECURITY OFFICE</div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              หน้าแรก
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              ข่าวประชาสัมพันธ์
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              สาขาใกล้บ้าน
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Input 
                type="search" 
                placeholder="ค้นหา..." 
                className="w-64 pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button variant="default" className="bg-primary hover:bg-primary/90">
              เข้าสู่ระบบ
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
