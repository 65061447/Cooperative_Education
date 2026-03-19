"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, PlusCircle, Calendar as CalendarIcon, Phone, 
  CreditCard, Briefcase, RefreshCw, Loader2, User, Save, MapPin, Building,
  Search, Filter, X
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Employee {
  id?: number;
  Name: string;
  Citizen_id: string | number;
  Birthday: string | number;
  Tel: string;
  Department: string;
  Division: string;
  Position: string;
  Entry_Date: string | number;
}

const Emp: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // --- UI Search States (What the user sees/types) ---
  const [searchName, setSearchName] = useState("");
  const [searchPosition, setSearchPosition] = useState("all");
  const [searchGen, setSearchGen] = useState("all");

  // --- Active Filter States (What the table actually uses) ---
  const [activeFilters, setActiveFilters] = useState({
    name: "",
    position: "all",
    gen: "all"
  });
  
  const [formData, setFormData] = useState<Employee>({
    Name: "", Citizen_id: "", Birthday: "", Tel: "", 
    Department: "", Division: "", Position: "", Entry_Date: ""
  });

  // --- Generation Logic (A.D. from DB) ---
  const getGeneration = (birthdayAD: string | number) => {
    if (!birthdayAD || birthdayAD === 0) return null;
    const str = birthdayAD.toString().replace(/[^0-9]/g, "").padStart(8, '0');
    const year = parseInt(str.slice(-4)); 
    if (isNaN(year) || year > 2100 || year < 1900) return null; 

    if (year >= 2013) return { label: "Gen Alpha", color: "bg-indigo-50 text-indigo-600 border-indigo-100" };
    if (year >= 1997) return { label: "Gen Z", color: "bg-emerald-50 text-emerald-600 border-emerald-100" };
    if (year >= 1981) return { label: "Gen Y", color: "bg-sky-50 text-sky-600 border-sky-100" };
    if (year >= 1965) return { label: "Gen X", color: "bg-orange-50 text-orange-600 border-orange-100" };
    if (year >= 1946) return { label: "Baby Boomer", color: "bg-rose-50 text-rose-600 border-rose-100" };
    return { label: "Silent Gen", color: "bg-slate-50 text-slate-600 border-slate-100" };
  };

  // --- Helpers for Database Sync ---
  const dateToADNumber = (date: Date | undefined): number => {
    if (!date) return 0;
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString(); 
    return parseInt(`${d}${m}${y}`);
  };

  const formatADtoBEText = (num: string | number) => {
    if (!num || num === 0) return "-";
    const str = num.toString().replace(/[^0-9]/g, "").padStart(8, '0');
    if (str.length < 8) return num.toString();
    const day = str.slice(0, 2);
    const month = str.slice(2, 4);
    const yearAD = parseInt(str.slice(4));
    const yearBE = yearAD + 543;
    return `${day}/${month}/${yearBE}`;
  };

  const handleFetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/employees");
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { handleFetchData(); }, []);

  // --- MANUAL SEARCH TRIGGER ---
  const handleSearch = () => {
    setActiveFilters({
      name: searchName,
      position: searchPosition,
      gen: searchGen
    });
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchPosition("all");
    setSearchGen("all");
    setActiveFilters({ name: "", position: "all", gen: "all" });
  };

  // --- Filtering Logic (Now uses activeFilters) ---
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesName = emp.Name.toLowerCase().includes(activeFilters.name.toLowerCase());
      const matchesPosition = activeFilters.position === "all" || emp.Position === activeFilters.position;
      
      const genData = getGeneration(emp.Birthday);
      const matchesGen = activeFilters.gen === "all" || genData?.label === activeFilters.gen;

      return matchesName && matchesPosition && matchesGen;
    });
  }, [employees, activeFilters]);

  const uniquePositions = useMemo(() => {
    const positions = employees.map(emp => emp.Position).filter(pos => pos);
    return Array.from(new Set(positions));
  }, [employees]);

  const handleAddEmployee = async () => {
    const payload = {
      ...formData,
      Citizen_id: formData.Citizen_id.toString().replace(/[^0-9]/g, ""),
      Birthday: Number(formData.Birthday) || 0,
      Entry_Date: Number(formData.Entry_Date) || 0,
    };

    try {
      const response = await fetch("http://localhost:3000/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsAddOpen(false);
        handleFetchData(); 
        setFormData({ Name: "", Citizen_id: "", Birthday: "", Tel: "", Department: "", Division: "", Position: "", Entry_Date: "" });
      }
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-[#334e5e] flex items-center gap-3">
            <LayoutDashboard className="text-[#d4c391] w-8 h-8" /> 
            ข้อมูลบุคลากร <span className="text-slate-300 font-light text-xl">| Staff</span>
          </h1>
          
          <div className="flex gap-3">
            <Button onClick={handleFetchData} variant="outline" className="h-12 px-4 rounded-xl border-slate-200 bg-white" disabled={isLoading}>รีเฟลชข้อมูล
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            </Button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#d4c391] hover:bg-[#c6b47e] text-[#334e5e] font-bold h-12 px-6 rounded-xl shadow-lg transition-transform active:scale-95">
                  <PlusCircle className="mr-2" /> เพิ่มบุคลากรใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white rounded-3xl p-0 flex flex-col border-none shadow-2xl overflow-hidden">
                <div className="bg-[#334e5e] p-6 text-white shrink-0">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <PlusCircle className="text-[#d4c391]" /> เพิ่มข้อมูลพนักงานใหม่
                  </DialogTitle>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase text-slate-400 ml-1">ชื่อ-นามสกุล</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                      <Input placeholder="ระบุชื่อและนามสกุล..." className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Name} onChange={(e)=>setFormData({...formData, Name: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">เลขบัตรประชาชน</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <Input placeholder="Citizen ID" className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Citizen_id} onChange={(e)=>setFormData({...formData, Citizen_id: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">วันเกิด (พ.ศ.)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e]">
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#d4c391]" />
                            {formatADtoBEText(formData.Birthday) === "-" ? "เลือกวันเกิด" : formatADtoBEText(formData.Birthday)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl border-none shadow-xl z-[110]" align="start">
                          <Calendar mode="single" captionLayout="dropdown" onSelect={(date) => setFormData({...formData, Birthday: dateToADNumber(date)})} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">เบอร์โทรศัพท์</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <Input placeholder="08x-xxx-xxxx" className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Tel} onChange={(e)=>setFormData({...formData, Tel: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">ตำแหน่ง</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <Input placeholder="ระบุตำแหน่ง..." className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Position} onChange={(e)=>setFormData({...formData, Position: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">ฝ่าย / Division</Label>
                      <Input placeholder="Division..." className="h-12 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Division} onChange={(e)=>setFormData({...formData, Division: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">แผนก / Department</Label>
                      <Input placeholder="Department..." className="h-12 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Department} onChange={(e)=>setFormData({...formData, Department: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">วันที่เริ่มงาน (พ.ศ.)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e]">
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#d4c391]" />
                            {formatADtoBEText(formData.Entry_Date) === "-" ? "เลือกวันเริ่มงาน" : formatADtoBEText(formData.Entry_Date)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl border-none shadow-xl z-[110]" align="start">
                          <Calendar mode="single" captionLayout="dropdown" onSelect={(date) => setFormData({...formData, Entry_Date: dateToADNumber(date)})} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
                  <Button variant="ghost" onClick={()=>setIsAddOpen(false)} className="flex-1 h-12 font-bold text-slate-400">ยกเลิก</Button>
                  <Button onClick={handleAddEmployee} className="bg-[#334e5e] hover:bg-[#253945] text-white flex-[2] h-12 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <Save size={18} /> บันทึกข้อมูล
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* --- MANUAL SEARCH BAR --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <User size={12} /> ค้นหาจากชื่อ
              </Label>
              <Input 
                placeholder="พิมพ์ชื่อพนักงาน..." 
                className="h-11 border-slate-100 bg-slate-50/50 rounded-xl"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <Briefcase size={12} /> ตำแหน่ง
              </Label>
              <Select value={searchPosition} onValueChange={setSearchPosition}>
                <SelectTrigger className="h-11 border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e]">
                  <SelectValue placeholder="ทุกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
                  {uniquePositions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <Filter size={12} /> Generation
              </Label>
              <Select value={searchGen} onValueChange={setSearchGen}>
                <SelectTrigger className="h-11 border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e]">
                  <SelectValue placeholder="ทุก Gen" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">ทุก Gen</SelectItem>
                  <SelectItem value="Gen Alpha">Gen Alpha</SelectItem>
                  <SelectItem value="Gen Z">Gen Z</SelectItem>
                  <SelectItem value="Gen Y">Gen Y</SelectItem>
                  <SelectItem value="Gen X">Gen X</SelectItem>
                  <SelectItem value="Baby Boomer">Baby Boomer</SelectItem>
                  <SelectItem value="Silent Gen">Silent Gen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ค้นหา Button (Manual Trigger) */}
            <Button 
              className="h-11 bg-[#334e5e] hover:bg-[#253945] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
              onClick={handleSearch}
            >
              <Search size={18} /> ค้นหา
            </Button>

            {/* Clear Button */}
            <Button 
              variant="ghost"
              className="h-11 text-slate-400 hover:text-rose-500 font-bold rounded-xl flex items-center justify-center gap-1"
              onClick={handleClearFilters}
            >
              <X size={16} /> ล้างข้อมูล
            </Button>
          </div>
        </div>

        {/* --- FULL DATA TABLE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/50 text-[#334e5e] text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Employee Info</th>
                <th className="px-6 py-5 text-center">Citizen ID</th>
                <th className="px-6 py-5">Position & Org</th>
                <th className="px-6 py-5 text-center">Birthday & Gen</th>
                <th className="px-6 py-5 text-center">Contact</th>
                <th className="px-6 py-5 text-right">Start Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium italic">
                    ไม่พบข้อมูลที่ตรงกับการค้นหา
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const gen = getGeneration(emp.Birthday);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#d4c391]/10 flex items-center justify-center text-[#d4c391] group-hover:bg-[#d4c391] group-hover:text-white transition-all shadow-sm">
                          <User size={20} />
                        </div>
                        <span className="font-bold text-[#334e5e] text-sm tracking-tight">{emp.Name}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          {emp.Citizen_id || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                          <Briefcase size={12} className="text-[#d4c391]" /> {emp.Position}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-black mt-0.5 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1"><Building size={10} /> {emp.Department}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} /> {emp.Division}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-slate-500">{formatADtoBEText(emp.Birthday)}</span>
                          {gen && (
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-tighter ${gen.color}`}>
                              {gen.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-black text-slate-600">{emp.Tel}</td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-xs font-black text-[#d4c391] bg-[#d4c391]/5 px-3 py-1.5 rounded-lg border border-[#d4c391]/20">
                           {formatADtoBEText(emp.Entry_Date)}
                         </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Emp;