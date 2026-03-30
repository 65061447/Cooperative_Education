"use client";

  import React, { useState, useEffect, useMemo } from "react";
  import { 
    LayoutDashboard, 
    PlusCircle, 
    Calendar as CalendarIcon, 
    Phone, 
    CreditCard, 
    Briefcase, 
    RefreshCw, 
    Loader2, 
    User, 
    Save, 
    MapPin, 
    Building,
    Search, 
    Filter, 
    X, 
    Pencil, 
    Trash2, 
    AlertCircle, 
    ArrowUpDown, 
    ChevronUp, 
    ChevronDown,
    Layers, 
    Award, 
    Hash, 
    Star, 
    ShieldCheck, 
    Zap, 
    Medal,
    Activity
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

  /**
   * Interface สำหรับข้อมูลพนักงาน
   * กำหนดโครงสร้างข้อมูลให้ตรงกับ Database และการใช้งานใน Form
   */
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
    Personel_Type: string;
    Position_Level: string;
    Position_No: string;
    Assign_Task: string; 
    Actual_Task: string; 
    Status: string;      
  }

  const Emp: React.FC = () => {
    // ---------------------------------------------------------
    // --- STATE MANAGEMENT ---
    // ---------------------------------------------------------
    
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // --- SEARCH & FILTER STATES (UI) ---
    const [searchName, setSearchName] = useState("");
    const [searchPosition, setSearchPosition] = useState("all");
    const [searchGen, setSearchGen] = useState("all");
    const [searchDivision, setSearchDivision] = useState("all");
    const [searchDepartment, setSearchDepartment] = useState("all");
    const [searchPersonelType, setSearchPersonelType] = useState("all");
    const [searchStatus, setSearchStatus] = useState("all");

    // --- ACTIVE FILTERS (LOGIC) ---
    const [activeFilters, setActiveFilters] = useState({
      name: "",
      position: "all",
      gen: "all",
      division: "all",
      department: "all",
      personelType: "all",
      status: "all"
    });
    
    // --- FORM DATA STATE (SET TO ACTIVE BY DEFAULT) ---
    const [formData, setFormData] = useState<Employee>({
      Name: "", 
      Citizen_id: "", 
      Birthday: "", 
      Tel: "", 
      Department: "", 
      Division: "", 
      Position: "", 
      Entry_Date: "",
      Personel_Type: "", 
      Position_Level: "", 
      Position_No: "",
      Assign_Task: "", 
      Actual_Task: "", 
      Status: "Active" 
    });

    // --- SORTING STATE (SET TO POSITION_NO ASC BY DEFAULT) ---
    const [sortConfig, setSortConfig] = useState<{ 
      key: 'Entry_Date' | 'Gen' | 'Level' | 'id' | 'Position_No', 
      direction: 'asc' | 'desc' 
    }>({
      key: 'Position_No',
      direction: 'asc'
    });

    // ---------------------------------------------------------
    // --- HELPERS: UI STYLING ---
    // ---------------------------------------------------------

    /**
     * กำหนดสีและ Icon ตามระดับตำแหน่ง
     */
    const getLevelStyle = (level: string) => {
      const l = level?.trim() || "";
      if (l.includes("เชี่ยวชาญ") || l.includes("ทรงคุณวุฒิ")) {
        return {
          color: "bg-amber-50 text-amber-600 border-amber-200",
          icon: <Star size={12} className="text-amber-500" />
        };
      }
      if (l.includes("ชำนาญการพิเศษ")) {
        return {
          color: "bg-orange-50 text-orange-600 border-orange-200",
          icon: <Award size={12} className="text-orange-500" />
        };
      }
      if (l.includes("ชำนาญการ")) {
        return {
          color: "bg-sky-50 text-sky-600 border-sky-200",
          icon: <ShieldCheck size={12} className="text-sky-500" />
        };
      }
      if (l.includes("ปฏิบัติการ")) {
        return {
          color: "bg-emerald-50 text-emerald-600 border-emerald-200",
          icon: <Zap size={12} className="text-emerald-500" />
        };
      }
      if (l.includes("อาวุโส")) {
        return {
          color: "bg-violet-50 text-violet-600 border-violet-200",
          icon: <Award size={12} className="text-violet-500" />
        };
      }
      if (l.includes("ชำนาญงาน")) {
        return {
          color: "bg-indigo-50 text-indigo-600 border-indigo-200",
          icon: <Medal size={12} className="text-indigo-500" />
        };
      }
      if (l.includes("ปฏิบัติงาน")) {
        return {
          color: "bg-slate-50 text-slate-600 border-slate-200",
          icon: <Zap size={12} className="text-slate-500" />
        };
      }
      return {
        color: "bg-slate-100 text-slate-500 border-slate-200",
        icon: <Award size={12} />
      };
    };

    /**
     * กำหนดลำดับความสำคัญของระดับตำแหน่งเพื่อใช้ในการ Sort
     */
    const getLevelPriority = (level: string) => {
      const l = level?.trim() || "";
      if (l.includes("ทรงคุณวุฒิ")) return 11;
      if (l.includes("เชี่ยวชาญ")) return 10;
      if (l.includes("ชำนาญการพิเศษ")) return 9;
      if (l.includes("ชำนาญการ")) return 8;
      if (l.includes("ปฏิบัติการ")) return 7;
      if (l.includes("อาวุโส")) return 6;
      if (l.includes("ชำนาญงาน")) return 5;
      if (l.includes("ปฏิบัติงาน")) return 4;
      return 0;
    };

    /**
     * จัดการการสลับลำดับการเรียงข้อมูล
     */
    const handleSort = (key: 'Entry_Date' | 'Gen' | 'Level' | 'Position_No') => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    // ---------------------------------------------------------
    // --- DATA TRANSFORMATION ---
    // ---------------------------------------------------------

    /**
     * คำนวณ Generation จากปีเกิด (พ.ศ. หรือ ค.ศ.)
     */
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

    /**
     * แปลงรูปแบบวันที่เป็น พ.ศ. สำหรับแสดงผล
     */
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

    /**
     * แปลง Date Object เป็น String (DD/MM/YYYY)
     */
    const dateToADString = (date: Date | undefined): string => {
      if (!date) return "";
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear().toString(); 
      return `${d}/${m}/${y}`;
    };

    // ---------------------------------------------------------
    // --- API HANDLERS ---
    // ---------------------------------------------------------

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

    useEffect(() => {
      handleFetchData();
    }, []);

    // ---------------------------------------------------------
    // --- SEARCH & FILTER LOGIC ---
    // ---------------------------------------------------------

    const handleSearch = () => {
      setActiveFilters({ 
        name: searchName, 
        position: searchPosition, 
        gen: searchGen,
        division: searchDivision,
        department: searchDepartment,
        personelType: searchPersonelType,
        status: searchStatus
      });
    };

    const handleClearFilters = () => {
      setSearchName("");
      setSearchPosition("all");
      setSearchGen("all");
      setSearchDivision("all");
      setSearchDepartment("all");
      setSearchPersonelType("all");
      setSearchStatus("all");
      setActiveFilters({ 
        name: "", 
        position: "all", 
        gen: "all", 
        division: "all", 
        department: "all",
        personelType: "all",
        status: "all"
      });
      setSortConfig({ key: 'Position_No', direction: 'asc' });
    };

    const filteredEmployees = useMemo(() => {
      const filtered = employees.filter((emp) => {
        const matchesName = emp.Name.toLowerCase().includes(activeFilters.name.toLowerCase());
        const matchesPosition = activeFilters.position === "all" || emp.Position === activeFilters.position;
        const matchesDivision = activeFilters.division === "all" || emp.Division === activeFilters.division;
        const matchesDepartment = activeFilters.department === "all" || emp.Department === activeFilters.department;
        const matchesPersonelType = activeFilters.personelType === "all" || emp.Personel_Type === activeFilters.personelType;
        const matchesStatus = activeFilters.status === "all" || emp.Status === activeFilters.status;
        
        const genData = getGeneration(emp.Birthday);
        const matchesGen = activeFilters.gen === "all" || genData?.label === activeFilters.gen;
        
        return matchesName && matchesPosition && matchesGen && matchesDivision && matchesDepartment && matchesPersonelType && matchesStatus;
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
        } else if (sortConfig.key === 'Level') {
          const priorityA = getLevelPriority(a.Position_Level);
          const priorityB = getLevelPriority(b.Position_Level);
          return sortConfig.direction === 'asc' ? priorityA - priorityB : priorityB - priorityA;
        } else if (sortConfig.key === 'Position_No') {
          const valA = parseInt(a.Position_No) || 0;
          const valB = parseInt(b.Position_No) || 0;
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        } else {
          const idA = a.id || 0;
          const idB = b.id || 0;
          return sortConfig.direction === 'asc' ? idA - idB : idB - idA;
        }
      });
    }, [employees, activeFilters, sortConfig]);

    const uniquePositions = useMemo(() => Array.from(new Set(employees.map(emp => emp.Position).filter(Boolean))), [employees]);
    const uniqueDivisions = useMemo(() => Array.from(new Set(employees.map(emp => emp.Division).filter(Boolean))), [employees]);
    const uniqueDepartments = useMemo(() => Array.from(new Set(employees.map(emp => emp.Department).filter(Boolean))), [employees]);
    const uniquePersonelTypes = useMemo(() => Array.from(new Set(employees.map(emp => emp.Personel_Type).filter(Boolean))), [employees]);

    // ---------------------------------------------------------
    // --- CRUD ACTIONS ---
    // ---------------------------------------------------------

    const handleOpenAdd = () => {
      setIsEditing(false);
      setFormData({ 
        Name: "", 
        Citizen_id: "", 
        Birthday: "", 
        Tel: "", 
        Department: "", 
        Division: "", 
        Position: "", 
        Entry_Date: "",
        Personel_Type: "", 
        Position_Level: "", 
        Position_No: "", 
        Assign_Task: "", 
        Actual_Task: "", 
        Status: "Active" 
      });
      setIsAddOpen(true);
    };

    const handleOpenEdit = (emp: Employee) => {
      setIsEditing(true);
      setFormData({
        ...emp,
        Citizen_id: emp.Citizen_id?.toString() || "",
        Position_No: emp.Position_No?.toString() || "",
        Assign_Task: emp.Assign_Task || "",
        Actual_Task: emp.Actual_Task || "",
        Status: emp.Status || "Active"
      });
      setIsAddOpen(true);
    };

    const handleSaveEmployee = async () => {
      const endpoint = isEditing ? "update" : "add";
      try {
        const response = await fetch(`http://localhost:3000/employees/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
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

    // ---------------------------------------------------------
    // --- UI RENDER ---
    // ---------------------------------------------------------

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          
          {/* --- TOP HEADER SECTION --- */}
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-[#334e5e] flex items-center gap-3">
                <LayoutDashboard className="text-[#d4c391] w-8 h-8" /> 
                ข้อมูลบุคลากร <span className="text-slate-300 font-light text-xl">| Staff</span>
              </h1>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-11">Personnel Management System</p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleFetchData} 
                variant="outline" 
                className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                disabled={isLoading}
              >
                รีเฟรช {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="ml-2 h-4 w-4" />}
              </Button>

              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <Button onClick={handleOpenAdd} className="bg-[#d4c391] hover:bg-[#c6b47e] text-[#334e5e] font-bold h-12 px-6 rounded-xl shadow-lg shadow-[#d4c391]/20 transition-all active:scale-95">
                  <PlusCircle className="mr-2 h-5 w-5" /> เพิ่มบุคลากรใหม่
                </Button>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white rounded-3xl p-0 flex flex-col border-none shadow-2xl overflow-hidden">
                  <div className="bg-[#334e5e] p-6 text-white shrink-0 relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                      {isEditing ? <Pencil className="text-[#d4c391]" /> : <PlusCircle className="text-[#d4c391]" />}
                      {isEditing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มข้อมูลพนักงานใหม่"}
                    </DialogTitle>
                  </div>
                  
                  <div className="p-8 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
                    {/* Form Fields Section */}
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ชื่อ-นามสกุล</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <Input 
                          placeholder="ระบุชื่อและนามสกุล..." 
                          className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                          value={formData.Name} 
                          onChange={(e)=>setFormData({...formData, Name: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">เลขบัตรประชาชน</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                          <Input 
                            placeholder="Citizen ID" 
                            className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" 
                            value={formData.Citizen_id} 
                            onChange={(e)=>setFormData({...formData, Citizen_id: e.target.value})} 
                          />
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
                            <Calendar 
                              mode="single" 
                              captionLayout="dropdown" 
                              onSelect={(date) => setFormData({...formData, Birthday: dateToADString(date)})} 
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">เบอร์โทรศัพท์</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                          <Input 
                            placeholder="08x-xxx-xxxx" 
                            className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" 
                            value={formData.Tel} 
                            onChange={(e)=>setFormData({...formData, Tel: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ตำแหน่ง</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                          <Input 
                            placeholder="ระบุตำแหน่งงาน..." 
                            className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" 
                            value={formData.Position} 
                            onChange={(e)=>setFormData({...formData, Position: e.target.value})} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ประเภทบุคลากร</Label>
                        <Input placeholder="ข้าราชการ/ลูกจ้าง..." className="h-12 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Personel_Type} onChange={(e)=>setFormData({...formData, Personel_Type: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ระดับ</Label>
                        <Input placeholder="ชำนาญการ..." className="h-12 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Position_Level} onChange={(e)=>setFormData({...formData, Position_Level: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">เลขที่ตำแหน่ง</Label>
                        <Input placeholder="เลขที่..." className="h-12 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Position_No} onChange={(e)=>setFormData({...formData, Position_No: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ฝ่าย / Division</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                          <Input placeholder="Division..." className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Division} onChange={(e)=>setFormData({...formData, Division: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">แผนก / Department</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                          <Input placeholder="Department..." className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Department} onChange={(e)=>setFormData({...formData, Department: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ภาระงานตามกรอบ (Assign)</Label>
                        <Input placeholder="ระบุภาระงาน..." className="h-12 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Assign_Task} onChange={(e)=>setFormData({...formData, Assign_Task: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ภาระงานตามจริง (Actual)</Label>
                        <Input placeholder="ระบุภาระงาน..." className="h-12 border-slate-100 bg-slate-50/50 rounded-xl" value={formData.Actual_Task} onChange={(e)=>setFormData({...formData, Actual_Task: e.target.value})} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">สถานะการทำงาน</Label>
                        <Select value={formData.Status} onValueChange={(val)=>setFormData({...formData, Status: val})}>
                          <SelectTrigger className="h-12 border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e]">
                            <SelectValue placeholder="เลือกสถานะ" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="Active" >🟢 Active</SelectItem>
                            <SelectItem value="InActive">🔴 InActive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400 ml-1">วันที่เริ่มงาน (พ.ศ.)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full h-12 justify-start border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e]">
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#d4c391]" />
                              {formData.Entry_Date ? formatToBEText(formData.Entry_Date) : "เลือกวันเริ่มงาน"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 rounded-xl border-none shadow-xl z-[110]" align="start">
                            <Calendar 
                              mode="single" 
                              captionLayout="dropdown" 
                              onSelect={(date) => setFormData({...formData, Entry_Date: dateToADString(date)})} 
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                    <Button variant="ghost" onClick={()=>setIsAddOpen(false)} className="flex-1 h-12 font-bold text-slate-400 hover:text-slate-600">ยกเลิก</Button>
                    <Button onClick={handleSaveEmployee} className="bg-[#334e5e] hover:bg-[#253945] text-white flex-[2] h-12 font-bold rounded-xl shadow-lg shadow-[#334e5e]/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                      <Save size={18} /> บันทึกข้อมูล
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* --- DELETE CONFIRMATION MODAL --- */}
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent className="sm:max-w-[400px] p-8 rounded-[2rem] text-center border-none shadow-2xl">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertCircle size={32} />
              </div>
              <DialogTitle className="text-xl font-bold text-[#334e5e] mb-2 tracking-tight">ยืนยันการลบข้อมูลบุคลากร?</DialogTitle>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                คุณแน่ใจว่าต้องการลบข้อมูลของ <br />
                <span className="font-black text-rose-500 text-base">{selectedEmployee?.Name}</span> <br />
                การดำเนินการนี้ไม่สามารถเรียกคืนได้
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={()=>setIsDeleteOpen(false)} className="flex-1 h-11 font-bold text-slate-400">ยกเลิก</Button>
                <Button onClick={confirmDelete} className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-100 transition-all active:scale-95">ยืนยันการลบ</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* --- SEARCH FILTER SECTION --- */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3 items-end">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><User size={12} /> ชื่อพนักงาน</Label>
                <Input placeholder="ค้นหาชื่อ..." className="h-11 rounded-xl bg-slate-50/30 border-slate-100" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Layers size={12} /> ประเภท</Label>
                <Select value={searchPersonelType} onValueChange={setSearchPersonelType}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกประเภท" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">ทุกประเภทบุคลากร</SelectItem>
                    {uniquePersonelTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Briefcase size={12} /> ตำแหน่ง</Label>
                <Select value={searchPosition} onValueChange={setSearchPosition}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกตำแหน่ง" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">ทุกตำแหน่งงาน</SelectItem>
                    {uniquePositions.map((pos) => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><MapPin size={12} /> ฝ่าย</Label>
                <Select value={searchDivision} onValueChange={setSearchDivision}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกฝ่าย" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">ทุกฝ่าย (Division)</SelectItem>
                    {uniqueDivisions.map((div) => (<SelectItem key={div} value={div}>{div}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Building size={12} /> แผนก</Label>
                <Select value={searchDepartment} onValueChange={setSearchDepartment}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกแผนก" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">ทุกแผนก (Dept)</SelectItem>
                    {uniqueDepartments.map((dept) => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Filter size={12} /> Gen</Label>
                <Select value={searchGen} onValueChange={setSearchGen}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุก Gen" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">ทุก Gen</SelectItem>
                    <SelectItem value="Gen Alpha">Alpha</SelectItem>
                    <SelectItem value="Gen Z">Z</SelectItem>
                    <SelectItem value="Gen Y">Y</SelectItem>
                    <SelectItem value="Gen X">X</SelectItem>
                    <SelectItem value="Baby Boomer">Boomer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Activity size={12} /> สถานะ</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกสถานะ" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">ทุกสถานะ</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="InActive">InActive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button className="h-11 bg-[#334e5e] hover:bg-[#253945] text-white font-bold rounded-xl flex-1 transition-all active:scale-95" onClick={handleSearch}><Search size={16} /></Button>
                <Button variant="outline" className="h-11 bg-rose-500 hover:bg-rose-600 text-white border-rose-500 font-bold rounded-xl flex-1 transition-all active:scale-95" onClick={handleClearFilters}><X size={16}/></Button>
              </div>
            </div>
          </div>

          {/* --- MAIN DATA TABLE SECTION --- */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden text-[16px]">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-slate-50/50 text-[#334e5e] text-[11px] font-black uppercase tracking-tighter">
                <tr>
                  <th className="w-[40px] px-2 py-2 text-center">No.</th>
                  <th className="w-[150px] px-10 py-2">ชื่อ / ประเภท</th>
                  <th className="w-[70px] px-2 py-2 text-center cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Position_No')}>
                    <div className="flex items-center justify-center gap-1">
                      เลขตำแหน่ง {sortConfig.key === 'Position_No' ? (sortConfig.direction === 'asc' ? <ChevronUp size={10}/> : <ChevronDown size={10}/>) : <ArrowUpDown size={10}/>}
                    </div>
                  </th>
                  <th className="w-[120px] px-2 py-2 text-center cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Level')}>
                    <div className="flex items-center justify-center gap-1">
                      ระดับ {sortConfig.key === 'Level' ? (sortConfig.direction === 'asc' ? <ChevronUp size={10}/> : <ChevronDown size={10}/>) : <ArrowUpDown size={10}/>}
                    </div>
                  </th>
                  <th className="w-[150px] px-2 py-2">ตำแหน่ง/ฝ่าย</th>
                  <th className="w-[65px] px-1 py-2 text-center whitespace-nowrap">ตามกรอบ</th>
                  <th className="w-[65px] px-1 py-2 text-center whitespace-nowrap">ตามจริง</th>
                  <th className="w-[100px] px-2 py-2 text-center cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Gen')}>
                    <div className="flex items-center justify-center gap-1">
                      Gen {sortConfig.key === 'Gen' ? (sortConfig.direction === 'asc' ? <ChevronUp size={10}/> : <ChevronDown size={10}/>) : <ArrowUpDown size={10}/>}
                    </div>
                  </th>
                  <th className="w-[100px] px-2 py-2 text-center">เบอร์โทร</th>
                  <th className="w-[80px] px-2 py-2 text-center">สถานะ</th>
                  <th className="w-[70px] px-2 py-2 text-right cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Entry_Date')}>
                    <div className="flex items-center justify-end gap-1 w-[65px]">
                      เริ่มงาน {sortConfig.key === 'Entry_Date' ? (sortConfig.direction === 'asc' ? <ChevronUp size={10}/> : <ChevronDown size={10}/>) : <ArrowUpDown size={10}/>}
                    </div>
                  </th>
                  <th className="w-[70px] px-2 py-2 text-center">จัดการ</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Search size={48} strokeWidth={1} className="opacity-20" />
                        <p className="text-sm font-medium italic tracking-wide">ไม่พบข้อมูลบุคลากรที่ท่านค้นหา</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, idx) => {
                    const gen = getGeneration(emp.Birthday);
                    const levelStyle = getLevelStyle(emp.Position_Level);
                    
                    return (
                      <tr key={emp.id || idx} className="hover:bg-slate-50/40 transition-all group">
                        <td className="px-2 py-2 text-center font-black text-slate-300 text-[11px]">
                          {(idx + 1).toString().padStart(2, '0')}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-8 h-8 rounded-lg bg-[#d4c391]/10 flex items-center justify-center text-[#d4c391] shrink-0">
                              <User size={15} />
                            </div>
                            <div className="truncate min-w-0">
                              <button onClick={() => handleOpenEdit(emp)} className="font-bold text-[#334e5e] hover:text-[#d4c391] transition-colors text-left truncate block w-full text-[13px]">
                                {emp.Name}
                              </button>
                              <span className="text-[8.5px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm uppercase tracking-tighter inline-block">
                                {emp.Personel_Type || "N/A"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className="font-mono font-bold text-[#d4c391] text-[11px]">{emp.Position_No || "-"}</span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className={`inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded-full border uppercase tracking-tighter ${levelStyle.color}`}>
                            {levelStyle.icon} {emp.Position_Level || "-"}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="font-bold text-slate-600 truncate text-[12px]">{emp.Position}</div>
                          <div className="text-[8.5px] text-slate-400 uppercase tracking-tighter">
                            {emp.Division || "-"} / {emp.Department || "-"}
                          </div>
                        </td>
                        <td className="px-1 py-2 text-center">
                          <div className="text-[8.5px] font-black text-blue-600 bg-blue-50 px-1 rounded border border-blue-100 inline-block min-w-[20px]">
                            {emp.Assign_Task || "0"}
                          </div>
                        </td>
                        <td className="px-1 py-2 text-center">
                          <div className="text-[8.5px] font-black text-red-600 bg-red-50 px-1 rounded border border-red-100 inline-block min-w-[20px]">
                            {emp.Actual_Task || "0"}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span className="font-bold text-slate-500 text-[11px] tracking-tighter">{formatToBEText(emp.Birthday)}</span>
                            {gen && <span className={`px-2 py-0.5 text-[9px] font-black rounded tracking-tight leading-none ${gen.color}`}>{gen.label}</span>}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center font-black text-slate-600 text-[11px]">
                          {emp.Tel || "-"}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded-sm text-[8.5px] font-black border uppercase tracking-tighter ${emp.Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                            {emp.Status || "Active"}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <span className="font-black text-[#d4c391] text-[11px]">{formatToBEText(emp.Entry_Date)}</span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <div className="flex justify-center gap-1 group-hover:opacity-100 transition-all duration-300">
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(emp)} className="h-7 w-7 text-blue-500 hover:bg-blue-50 hover:text-blue-600">
                              <Pencil size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedEmployee(emp); setIsDeleteOpen(true); }} className="h-7 w-7 text-rose-400 hover:bg-rose-50 hover:text-rose-500">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* --- SUMMARY INFO FOOTER --- */}
          <div className="mt-4 flex justify-between items-center px-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Total Personnel: <span className="text-[#334e5e]">{filteredEmployees.length}</span> Records
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Active Staff</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">InActive Staff</span>
              </div>
            </div>
          </div>

        </main>
        
        <Footer />
      </div>
    );
  };

  export default Emp;