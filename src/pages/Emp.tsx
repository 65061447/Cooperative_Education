"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, PlusCircle, Calendar as CalendarIcon, Phone, 
  CreditCard, Briefcase, RefreshCw, Loader2, User, Save, MapPin, Building,
  Search, Filter, X, Pencil, Trash2, AlertCircle, ArrowUpDown, ChevronUp, ChevronDown
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchPosition, setSearchPosition] = useState("all");
  const [searchGen, setSearchGen] = useState("all");
  const [searchDivision, setSearchDivision] = useState("all");
  const [searchDepartment, setSearchDepartment] = useState("all");

  const [activeFilters, setActiveFilters] = useState({
    name: "",
    position: "all",
    gen: "all",
    division: "all",
    department: "all"
  });
  
  const [formData, setFormData] = useState<Employee>({
    Name: "", Citizen_id: "", Birthday: "", Tel: "", 
    Department: "", Division: "", Position: "", Entry_Date: ""
  });

  // --- SORTING STATE ---
  const [sortConfig, setSortConfig] = useState<{ key: 'Entry_Date' | 'Gen' | 'id', direction: 'asc' | 'desc' }>({
    key: 'id',
    direction: 'asc'
  });

  const handleSort = (key: 'Entry_Date' | 'Gen') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- SAFE GENERATION LOGIC ---
  const getGeneration = (birthday: string | number) => {
    if (!birthday || birthday === "0" || birthday === 0) return null;
    const str = birthday.toString();
    let year: number;

    if (str.includes("/")) {
      year = parseInt(str.split("/").pop() || "");
    } else {
      year = parseInt(str.slice(-4));
    }
    
    if (isNaN(year) || year > 2100 || year < 1900) return null; 

    if (year >= 2013) return { label: "Gen Alpha", color: "bg-indigo-50 text-indigo-600 border-indigo-100", rank: 6 };
    if (year >= 1997) return { label: "Gen Z", color: "bg-emerald-50 text-emerald-600 border-emerald-100", rank: 5 };
    if (year >= 1981) return { label: "Gen Y", color: "bg-sky-50 text-sky-600 border-sky-100", rank: 4 };
    if (year >= 1965) return { label: "Gen X", color: "bg-orange-50 text-orange-600 border-orange-100", rank: 3 };
    if (year >= 1946) return { label: "Baby Boomer", color: "bg-rose-50 text-rose-600 border-rose-100", rank: 2 };
    return { label: "Silent Gen", color: "bg-slate-50 text-slate-600 border-slate-100", rank: 1 };
  };

  // --- SAFE FORMATTING LOGIC ---
  const formatToBEText = (dateVal: string | number) => {
    if (!dateVal || dateVal === "0" || dateVal === 0) return "-";
    const str = dateVal.toString();
    
    if (str.includes("/")) {
      const [d, m, y] = str.split("/");
      return `${d}/${m}/${parseInt(y) + 543}`;
    }
    
    if (str.length >= 8) {
      const day = str.slice(0, 2);
      const month = str.slice(2, 4);
      const yearBE = parseInt(str.slice(4)) + 543;
      return `${day}/${month}/${yearBE}`;
    }
    return str;
  };

  const dateToADString = (date: Date | undefined): string => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString(); 
    return `${d}/${m}/${y}`;
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

  const handleSearch = () => {
    setActiveFilters({ 
      name: searchName, 
      position: searchPosition, 
      gen: searchGen,
      division: searchDivision,
      department: searchDepartment
    });
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSearchPosition("all");
    setSearchGen("all");
    setSearchDivision("all");
    setSearchDepartment("all");
    setActiveFilters({ 
      name: "", 
      position: "all", 
      gen: "all", 
      division: "all", 
      department: "all" 
    });
    setSortConfig({
      key: 'id',
      direction: 'asc'
    });
  };

  const filteredEmployees = useMemo(() => {
    const filtered = employees.filter((emp) => {
      const matchesName = emp.Name.toLowerCase().includes(activeFilters.name.toLowerCase());
      const matchesPosition = activeFilters.position === "all" || emp.Position === activeFilters.position;
      const matchesDivision = activeFilters.division === "all" || emp.Division === activeFilters.division;
      const matchesDepartment = activeFilters.department === "all" || emp.Department === activeFilters.department;
      
      const genData = getGeneration(emp.Birthday);
      const matchesGen = activeFilters.gen === "all" || genData?.label === activeFilters.gen;
      
      return matchesName && matchesPosition && matchesGen && matchesDivision && matchesDepartment;
    });

    return [...filtered].sort((a, b) => {
      if (sortConfig.key === 'Entry_Date') {
        const parseDate = (dateStr: string | number) => {
          if (!dateStr) return 0;
          const parts = dateStr.toString().split("/");
          if (parts.length !== 3) return 0;
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
        };
        const dateA = parseDate(a.Entry_Date);
        const dateB = parseDate(b.Entry_Date);
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortConfig.key === 'Gen') {
        const rankA = getGeneration(a.Birthday)?.rank || 0;
        const rankB = getGeneration(b.Birthday)?.rank || 0;
        return sortConfig.direction === 'asc' ? rankA - rankB : rankB - rankA;
      } else {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return sortConfig.direction === 'asc' ? idA - idB : idB - idA;
      }
    });
  }, [employees, activeFilters, sortConfig]);

  const uniquePositions = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.Position).filter(Boolean)));
  }, [employees]);

  const uniqueDivisions = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.Division).filter(Boolean)));
  }, [employees]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(employees.map(emp => emp.Department).filter(Boolean)));
  }, [employees]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ Name: "", Citizen_id: "", Birthday: "", Tel: "", Department: "", Division: "", Position: "", Entry_Date: "" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setIsEditing(true);
    setFormData(emp);
    setIsAddOpen(true);
  };

  const handleSaveEmployee = async () => {
    const endpoint = isEditing ? "update" : "add";
    const payload = {
      ...formData,
      Citizen_id: formData.Citizen_id.toString().replace(/[^0-9]/g, ""),
    };

    try {
      const response = await fetch(`http://localhost:3000/employees/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsAddOpen(false);
        handleFetchData(); 
      }
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const confirmDelete = async () => {
    if (!selectedEmployee?.id) return;
    try {
      const response = await fetch("http://localhost:3000/employees/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEmployee.id }),
      });
      if (response.ok) {
        setIsDeleteOpen(false);
        handleFetchData();
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-[#334e5e] flex items-center gap-3">
            <LayoutDashboard className="text-[#d4c391] w-8 h-8" /> 
            ข้อมูลบุคลากร <span className="text-slate-300 font-light text-xl">| Staff</span>
          </h1>
          
          <div className="flex gap-3">
            <Button onClick={handleFetchData} variant="outline" className="h-12 px-4 rounded-xl border-slate-200 bg-white" disabled={isLoading}>
              รีเฟรชข้อมูล {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            </Button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <Button onClick={handleOpenAdd} className="bg-[#d4c391] hover:bg-[#c6b47e] text-[#334e5e] font-bold h-12 px-6 rounded-xl shadow-lg">
                <PlusCircle className="mr-2" /> เพิ่มบุคลากรใหม่
              </Button>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white rounded-3xl p-0 flex flex-col border-none shadow-2xl overflow-hidden">
                <div className="bg-[#334e5e] p-6 text-white shrink-0">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {isEditing ? <Pencil className="text-[#d4c391]" /> : <PlusCircle className="text-[#d4c391]" />}
                    {isEditing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มข้อมูลพนักงานใหม่"}
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
                            {formData.Birthday ? formatToBEText(formData.Birthday) : "เลือกวันเกิด"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl border-none shadow-xl z-[110]" align="start">
                          <Calendar mode="single" captionLayout="dropdown" onSelect={(date) => setFormData({...formData, Birthday: dateToADString(date)})} />
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
                            {formData.Entry_Date ? formatToBEText(formData.Entry_Date) : "เลือกวันเริ่มงาน"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl border-none shadow-xl z-[110]" align="start">
                          <Calendar mode="single" captionLayout="dropdown" onSelect={(date) => setFormData({...formData, Entry_Date: dateToADString(date)})} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 border-t flex gap-3 shrink-0">
                  <Button variant="ghost" onClick={()=>setIsAddOpen(false)} className="flex-1 h-12 font-bold text-slate-400">ยกเลิก</Button>
                  <Button onClick={handleSaveEmployee} className="bg-[#334e5e] hover:bg-[#253945] text-white flex-[2] h-12 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                    <Save size={18} /> บันทึกข้อมูล
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-[400px] p-8 rounded-[2rem] text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle size={32} /></div>
            <DialogTitle className="text-xl font-bold text-[#334e5e] mb-2">ยืนยันการลบข้อมูล?</DialogTitle>
            <p className="text-sm text-slate-400 mb-6">คุณแน่ใจว่าต้องการลบข้อมูลของ <span className="font-black">{selectedEmployee?.Name}</span></p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={()=>setIsDeleteOpen(false)} className="flex-1">ยกเลิก</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl">ยืนยันลบ</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* --- SEARCH BAR --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <User size={12} /> ค้นหาชื่อ
              </Label>
              <Input placeholder="พิมพ์ชื่อ..." className="h-11 rounded-xl" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <Briefcase size={12} /> ตำแหน่ง
              </Label>
              <Select value={searchPosition} onValueChange={setSearchPosition}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="ทุกตำแหน่ง" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกตำแหน่ง</SelectItem>
                  {uniquePositions.map((pos) => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <MapPin size={12} /> ฝ่าย
              </Label>
              <Select value={searchDivision} onValueChange={setSearchDivision}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="ทุกฝ่าย" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกฝ่าย (Division)</SelectItem>
                  {uniqueDivisions.map((div) => (<SelectItem key={div} value={div}>{div}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <Building size={12} /> แผนก
              </Label>
              <Select value={searchDepartment} onValueChange={setSearchDepartment}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="ทุกแผนก" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุกแผนก (Department)</SelectItem>
                  {uniqueDepartments.map((dept) => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                <Filter size={12} /> Gen
              </Label>
              <Select value={searchGen} onValueChange={setSearchGen}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="ทุก Gen" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทุก Generation</SelectItem>
                  <SelectItem value="Gen Alpha">Gen Alpha</SelectItem>
                  <SelectItem value="Gen Z">Gen Z</SelectItem>
                  <SelectItem value="Gen Y">Gen Y</SelectItem>
                  <SelectItem value="Gen X">Gen X</SelectItem>
                  <SelectItem value="Baby Boomer">Baby Boomer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button className="h-11 bg-[#334e5e] text-white font-bold rounded-xl flex-1 hover:bg-[#253945]" onClick={handleSearch}><Search size={18} className="mr-2"/> ค้นหา</Button>
              <Button 
                variant="outline" 
                className="h-11 bg-rose-500 text-white hover:bg-white hover:text-rose-500 border-rose-500 font-bold rounded-xl flex items-center gap-1 px-4 transition-colors" 
                onClick={handleClearFilters}
              >
                <X size={16}/> ล้าง
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-slate-50/50 text-[#334e5e] text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-4 py-5 text-center">No.</th>
                <th className="px-6 py-5">ชื่อ</th>
                <th className="px-6 py-5 text-center">เลขบัตรประชาชน</th>
                <th className="px-6 py-5">ตำแหน่งงาน/แผนก</th>
                <th 
                  className="px-6 py-5 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('Gen')}
                >
                  <div className="flex items-center justify-center gap-1">
                    วันเกิด {sortConfig.key === 'Gen' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>) : <ArrowUpDown size={12}/>}
                  </div>
                </th>
                <th className="px-6 py-5 text-center">เบอร์โทรศัพท์</th>
                <th 
                  className="px-6 py-5 text-right cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('Entry_Date')}
                >
                  <div className="flex items-center justify-end gap-1">
                    วันที่เริ่มเข้าทำงาน {sortConfig.key === 'Entry_Date' ? (sortConfig.direction === 'asc' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>) : <ArrowUpDown size={12}/>}
                  </div>
                </th>
                <th className="px-6 py-5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium italic">ไม่พบข้อมูลที่ตรงกับการค้นหา</td></tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const gen = getGeneration(emp.Birthday);
                  return (
                    <tr key={emp.id || idx} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-4 py-4 text-center font-black text-slate-300 text-xs">{idx + 1}</td>
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#d4c391]/10 flex items-center justify-center text-[#d4c391]"><User size={20} /></div>
                        <button onClick={() => handleOpenEdit(emp)} className="font-bold text-[#334e5e] text-sm hover:text-[#d4c391] transition-colors text-left">{emp.Name}</button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{emp.Citizen_id || "-"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-600 flex items-center gap-1.5"><Briefcase size={12} className="text-[#d4c391]" /> {emp.Position}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-black mt-0.5 flex flex-wrap gap-2">
                          <span className="flex items-center gap-1"><Building size={10} /> {emp.Department}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} /> {emp.Division}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-slate-500">{formatToBEText(emp.Birthday)}</span>
                          {gen && <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-tighter ${gen.color}`}>{gen.label}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-black text-slate-600">{emp.Tel}</td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-xs font-black text-[#d4c391] bg-[#d4c391]/5 px-3 py-1.5 rounded-lg border border-[#d4c391]/20">{formatToBEText(emp.Entry_Date)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(emp)} className="text-blue-500 hover:bg-blue-50"><Pencil size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedEmployee(emp); setIsDeleteOpen(true); }} className="text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></Button>
                        </div>
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