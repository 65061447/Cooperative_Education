"use client";

import React from "react";
import { Link } from "react-router-dom"; // Change this to react-router-dom
import { Button } from "@/components/ui/button";
import { Search, Home, Lock, AlertTriangle, Info, HelpCircle, Map, Phone, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navLinks = [
    "เกี่ยวกับ สปส", "ข่าวประชาสัมพันธ์", "กฎหมาย/ระเบียบ", 
    "สิทธิประโยชน์", "คลังความรู้", "ดาวน์โหลดแบบฟอร์ม", 
    "หน่วยงาน", "สื่อประชาสัมพันธ์", "การลงทุน"
  ];

  return (
    <header className="w-full bg-white shadow-sm">
      {/* --- ROW 1: Branding & Main Actions --- */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTq2M0oDAqyHIyRomUSgfRmGuo4cCCxRDiHcg&s" 
              alt="SSO Logo" 
              className="h-14 w-auto object-contain"
            />
          </div>

          <div className="hidden md:block border-l-2 border-gray-200 pl-4">
            <div className="font-bold text-[#334e5e] text-xl leading-tight">
              สำนักงานประกันสังคม
            </div>
            <div className="text-[11px] text-gray-400 font-bold tracking-[0.2em] uppercase">
              Social Security Office
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="bg-[#d4c391] hover:bg-[#c4b381] text-[#334e5e] font-bold h-11 px-6 text-base rounded-md shadow-sm flex items-center gap-2">
            <Lock className="h-4 w-4" />
            เข้าสู่ระบบผู้ประกันตน
          </Button>
        </div>
      </div>

      {/* --- ROW 2: Utility Bar --- */}
      <div className="bg-white py-2 border-t border-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center gap-5 text-[14px] font-medium text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">Live Chat</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="flex items-center gap-1.5 hover:text-primary">
              <AlertTriangle className="h-4 w-4" /> แจ้งเรื่องร้องเรียน
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="flex items-center gap-1.5 hover:text-primary">
              <Info className="h-4 w-4" /> สอบถามข้อมูล
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="flex items-center gap-1.5 hover:text-primary">
              <HelpCircle className="h-4 w-4" /> คำถามที่พบบ่อย
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="flex items-center gap-1.5 hover:text-primary">
              <Map className="h-4 w-4" /> แผนผังเว็บไซต์
            </a>
            <span className="text-gray-300">|</span>
            <a href="#" className="flex items-center gap-1.5 hover:text-primary">
              <Phone className="h-4 w-4" /> ติดต่อเรา
            </a>
          </div>
        </div>
      </div>

      {/* --- ROW 3: Main Navigation --- */}
      <div className="bg-[#334e5e] text-white">
        <div className="container mx-auto px-4">
          <nav className="flex items-center h-12 gap-7 overflow-x-auto [scrollbar-width:none]">
            <Link to="/" className="hover:text-[#d4c391] transition-colors shrink-0">
              <Home className="h-5 w-5 fill-current" />
            </Link>

            {navLinks.map((link) => {
              if (link === "คลังความรู้") {
                return (
                  <DropdownMenu key={link}>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-base font-semibold text-white/90 hover:text-[#d4c391] whitespace-nowrap outline-none shrink-0 transition-all">
                      {link} <ChevronDown size={14} />
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent className="w-64 bg-white shadow-xl">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="cursor-pointer text-[#334e5e] font-medium py-3 hover:bg-slate-50 transition-colors">
                          ข้อมูลสถิติกองทุนเงินทดแทน
                        </DropdownMenuSubTrigger>
                        
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="w-[420px] bg-white p-1 shadow-2xl border-slate-100">
                            <DropdownMenuItem className="p-0">
                              {/* <Link 
                                to="/graph" 
                                className="w-full h-full py-4 px-5 text-[#334e5e] font-medium leading-relaxed block hover:bg-slate-100 transition-colors"
                              >
                                ส่วนที่ 1 สถิติการประสบอันตรายหรือเจ็บป่วยเนื่องจากการทำงานภาพรวมทั่วประเทศ
                              </Link> */}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem className="p-0">
                              {/* <Link 
                                to="/graph2568" 
                                className="w-full h-full py-4 px-5 text-[#334e5e] font-medium leading-relaxed block hover:bg-slate-100 transition-colors"
                              >
                                ส่วนที่ 2 2568
                              </Link> */}
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

                      <DropdownMenuItem className="cursor-pointer py-3 text-[#334e5e] hover:bg-slate-50">
                        วารสารประกันสังคม
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              // --- Added dropdown for "หน่วยงาน" strictly as requested ---
              if (link === "หน่วยงาน") {
                return (
                  <DropdownMenu key={link}>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-base font-semibold text-white/90 hover:text-[#d4c391] whitespace-nowrap outline-none shrink-0 transition-all">
                      {link} <ChevronDown size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white shadow-xl">
                      <DropdownMenuItem className="p-0">
                        <Link 
                          to="/emp" 
                          className="w-full h-full py-3 px-4 text-[#334e5e] font-medium block hover:bg-slate-50 transition-colors"
                        >
                          บุคลากร
                        </Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem className="cursor-pointer py-3 px-4 text-[#334e5e] hover:bg-slate-50">
                        โครงสร้างองค์กร
                      </DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <a 
                  key={link} 
                  href={link === "ข่าวประชาสัมพันธ์" ? "#news-section" : "#"} 
                  className="text-base font-semibold text-white/90 hover:text-[#d4c391] whitespace-nowrap transition-all shrink-0"
                >
                  {link}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;