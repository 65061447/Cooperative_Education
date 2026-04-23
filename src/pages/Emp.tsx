"use client";

import Login from "@/components/Login";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router-dom";
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
  Activity,
  Fingerprint,
  Monitor,
  Terminal,
  Code,
  Cpu,
  Shield,
  Database,
  Settings,
  Wrench,
  FileText,
  LogOut // Added for Logout
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

// --- PDF LIBRARIES ---
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

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
interface SessionUser{
  role? : string;
}
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const Emp: React.FC = () => {
  // --- REF FOR PDF CAPTURE (ADD THIS TO PRESERVE THAI) ---
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------
  // --- STATE MANAGEMENT ---
  // ---------------------------------------------------------
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [userRole, setUserRole] = useState<string>("User");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
  const token = sessionStorage.getItem("token");
  setIsAuthenticated(!!token);
  }, []);
  const [totalPages, setTotalPages] = useState(1);
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
  const [searchPersonelType, setSearchPersonelType] = useState("all");
  const [searchStatus, setSearchStatus] = useState("all");

  // --- ACTIVE FILTERS (LOGIC) ---
  const [activeFilters, setActiveFilters] = useState({
    name: "",
    position: "all",
    gen: "all",
    division: "all",
    personelType: "all",
    status: "all"
  });
  
  // --- FORM DATA STATE ---
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

  // --- SORTING STATE ---
const isAdmin = React.useMemo(() => userRole === "Admin", [userRole]);
  const [sortConfig, setSortConfig] = useState<{ 
    key: 'Entry_Date' | 'Gen' | 'Level' | 'id' | 'Position_No', 
    direction: 'asc' | 'desc' 
  }>({
    key: 'Position_No',
    direction: 'asc'
  });

 useEffect(() => {
  const fetchUser = async () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      setUserRole("User");
      setIsAuthenticated(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setUserRole("User");
        setIsAuthenticated(false);
        return;
      }

      const data = await res.json();
      setUserRole(data.role || "User");
      setIsAuthenticated(true);

    } catch (err) {
      console.error(err);
      setUserRole("User");
      setIsAuthenticated(false);
    }
  };

  fetchUser();

  // 👇 IMPORTANT: re-run when token changes in sessionStorage
  const onStorageChange = fetchUser;

  window.addEventListener("storage", onStorageChange);
  window.addEventListener("userLogout", onStorageChange);

  return () => {
    window.removeEventListener("storage", onStorageChange);
    window.removeEventListener("userLogout", onStorageChange);
  };
}, []);
useEffect(() => {
  console.log("RAW USER:", sessionStorage.getItem("user"));
  console.log("ROLE:", userRole);
  console.log("IS ADMIN:", isAdmin);
}, [userRole]);
useEffect(() => {
  const checkAuth = () => {
    const token = sessionStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  checkAuth();

  window.addEventListener("storage", checkAuth);
  return () => window.removeEventListener("storage", checkAuth);
}, []);
  // ---------------------------------------------------------
  // --- HELPERS: UI STYLING ---
  // ---------------------------------------------------------

  /**
   * กำหนดสีและ Icon ตามระดับตำแหน่ง
   */
  console.log("ROLE:", userRole, "isAdmin:", isAdmin);
const getLevelStyle = (level? : string) => {
  const l = level?.trim() || "";

  // --- SSO Level Specific Badges ---
  if (l.includes("4")) {
    return { 
      color: "border-indigo-400 bg-indigo-100 text-indigo-900 font-black ring-1 ring-indigo-300 shadow-sm", 
      icon: <Shield size={10} className="text-indigo-600" /> 
    };
  }
  if (l.includes("3")) {
    return { 
      color: "border-indigo-200 bg-indigo-50 text-indigo-800 font-bold", 
      icon: <Shield size={10} className="text-indigo-500" /> 
    };
  }
  if (l.includes("2")) {
    return { 
      color: "border-blue-200 bg-blue-50 text-blue-800 font-bold", 
      icon: <Shield size={10} className="text-blue-500" /> 
    };
  }
  if (l.includes("1")) {
    return { 
      color: "border-blue-100 bg-blue-50/50 text-blue-700", 
      icon: <Shield size={10} className="text-blue-400" /> 
    };
  }

  // --- Standard Position Styles ---
  switch (level) {
    case 'บริหารสูง':
      return { color: "border-purple-200 bg-purple-50 text-purple-700 font-black shadow-sm", icon: <LayoutDashboard size={10} className="text-purple-500" /> };
    case 'บริหารต้น':
      return { color: "border-purple-100 bg-purple-50/50 text-purple-600", icon: <LayoutDashboard size={10} /> };

    case 'อำนวยการสูง':
      return { color: "border-amber-200 bg-amber-50 text-amber-700 font-black shadow-sm", icon: <Monitor size={10} className="text-amber-600" /> };
    case 'อำนวยการต้น':
      return { color: "border-amber-100 bg-amber-50/50 text-amber-600", icon: <Monitor size={10} /> };

    case 'เชี่ยวชาญ': 
      return { color: "border-rose-200 bg-rose-50 text-rose-700 font-black", icon: <Shield size={10} className="text-rose-500" /> };

    case 'ชำนาญการพิเศษ': 
      return { color: "border-blue-200 bg-blue-50 text-blue-700", icon: <Terminal size={10} className="text-blue-500" /> };

    case 'ชำนาญการ': 
      return { color: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: <Code size={10} className="text-emerald-500" /> };

    case 'ปฏิบัติการ': 
      return { color: "border-slate-200 bg-slate-50 text-slate-600", icon: <Cpu size={10} className="text-slate-400" /> };

    case 'อาวุโส':
      return { color: "border-cyan-200 bg-cyan-50 text-cyan-700", icon: <Database size={10} className="text-cyan-500" /> };
    case 'ชำนาญงาน':
      return { color: "border-slate-200 bg-slate-50 text-slate-500", icon: <Settings size={10} /> };
    case 'ปฏิบัติงาน':
      return { color: "border-slate-100 bg-slate-50/30 text-slate-400", icon: <Wrench size={10} /> };

    default:
      return { color: "border-slate-100 bg-slate-50 text-slate-500", icon: <Activity size={10} /> };
  }
};
const getLevelPriority = (level? : string) => {
  const l = level?.trim() || "";

  // --- Tier 1: Top Management (SSO 4 / C10-C11) ---
  if (l.includes("4")) return 17;
  if (l.includes("บริหารสูง")) return 16;
  if (l.includes("ทรงคุณวุฒิ")) return 15;

  // --- Tier 2: Senior Management & Expert (SSO 3 / C9) ---
  if (l.includes("3")) return 14; 
  if (l.includes("บริหารต้น")) return 14;
  if (l.includes("อำนวยการสูง")) return 13;
  if (l.includes("เชี่ยวชาญ")) return 12;

  // --- Tier 3: Middle Management (SSO 2 / C8) ---
  if (l.includes("2")) return 11;
  if (l.includes("อำนวยการต้น")) return 11;
  if (l.includes("ชำนาญการพิเศษ")) return 10;
  if (l.includes("ส.4")) return 10;

  // --- Tier 4: Professional (SSO 1 / C6-C7) ---
  if (l.includes("1")) return 9;
  if (l.includes("ชำนาญการ")) return 9;
  
  // --- Tier 5: Practitioner ---
  if (l.includes("ปฏิบัติการ")) return 8;

  // --- Tier 6: General Track ---
  if (l.includes("ทักษะพิเศษ")) return 7;
  if (l.includes("อาวุโส")) return 6;
  if (l.includes("ชำนาญงาน")) return 5;
  if (l.includes("ปฏิบัติงาน")) return 4;

  return 0;
};

  const handleSort = (key: 'Entry_Date' | 'Gen' | 'Level' | 'id' | 'Position_No') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ---------------------------------------------------------
  // --- HELPERS: PDF GENERATION (Thai Character Support) ---
  // ---------------------------------------------------------

  // const exportToPDF = async () => {
  //   if (!tableRef.current) return;
  //   setIsLoading(true);

  //   try {
  //     // Capture the table as an image to preserve Thai characters perfectly
  //     const canvas = await html2canvas(tableRef.current, {
  //       scale: 2, // High resolution
  //       useCORS: true,
  //       backgroundColor: "#ffffff"
  //     });

  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF("l", "mm", "a4");
      
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  //     pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
  //     pdf.save("Employee_Report_Thai.pdf");
  //   } catch (error) {
  //     console.error("PDF Export Error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // ---------------------------------------------------------
  // --- DATA TRANSFORMATION ---
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // --- API HANDLERS ---
  // ---------------------------------------------------------
const handleSafeFetch = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages) return;
  handleFetchData(newPage);
};
  const handleFetchData = async (
  pageNumber = page,
  filters = activeFilters
) => {
  try {
    setIsLoading(true);

    const token = sessionStorage.getItem("token");

    const query = new URLSearchParams({
      page: String(pageNumber),
      limit: String(limit),
      search: filters.name || "", // ✅ NOW VALID
      sortKey: sortConfig.key,
      sortDir: sortConfig.direction,
    });

    const response = await fetch(`${API_URL}/employees/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Fetch failed");

    const result = await response.json();

    setEmployees(result.data);
    setTotalPages(result.totalPages);
    setPage(result.page);

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
  const newFilters = {
    name: searchName,
    position: searchPosition,
    gen: searchGen,
    division: searchDivision,
    personelType: searchPersonelType,
    status: searchStatus,
  };

  setActiveFilters(newFilters);

  // ✅ PASS DIRECTLY (no delay bug anymore)
  handleFetchData(1, newFilters);
};

  const handleClearFilters = () => {
    setSearchName("");
    setSearchPosition("all");
    setSearchGen("all");
    setSearchDivision("all");
    setSearchPersonelType("all");
    setSearchStatus("all");
    setActiveFilters({ 
      name: "", 
      position: "all", 
      gen: "all", 
      division: "all", 
      personelType: "all",
      status: "all"
    });
    setSortConfig({ key: 'Position_No', direction: 'asc' });
  };

  const filteredEmployees = useMemo(() => {
    const filtered = (employees || []).filter((emp) => {
      // FIX: Null-safe string comparison to prevent "toLowerCase of null" error
      const empName = emp.Name || "";
      const matchesName = empName.toLowerCase().includes((activeFilters.name || "").toLowerCase());
      
      const matchesPosition = activeFilters.position === "all" || emp.Position === activeFilters.position;
      const matchesDivision = activeFilters.division === "all" || emp.Actual_Task === activeFilters.division;
      const matchesPersonelType = activeFilters.personelType === "all" || emp.Personel_Type === activeFilters.personelType;
      const matchesStatus = activeFilters.status === "all" || emp.Status === activeFilters.status;
      
      const genData = getGeneration(emp.Birthday);
      const matchesGen = activeFilters.gen === "all" || genData?.label === activeFilters.gen;
      return matchesName && matchesPosition && matchesGen && matchesDivision && matchesPersonelType && matchesStatus;
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

  const uniquePositions = useMemo(() => Array.from(new Set((employees || []).map(emp => emp.Position).filter(Boolean))), [employees]);
  const uniqueDivisions = useMemo(() => Array.from(new Set((employees || []).map(emp => emp.Actual_Task).filter(Boolean))), [employees]);
  const uniquePersonelTypes = useMemo(() => Array.from(new Set((employees || []).map(emp => emp.Personel_Type).filter(Boolean))), [employees]);

  // ---------------------------------------------------------
  // --- AUTH / LOGOUT LOGIC ---
  // ---------------------------------------------------------

    if (!isAuthenticated) {
     return <Login onLoginSuccess={() => { setIsAuthenticated(true);window.location.reload()}} />;
    }
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
const token = sessionStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/employees/${endpoint}`, {
      method: "POST",
      headers: { 
       "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setIsAddOpen(false);
      handleFetchData();
    } else {
      console.error("❌ Save failed:", await response.text());
    }
  } catch (error) {
    console.error("❌ Save error:", error);
  }
};

  const confirmDelete = async () => {
    const token = sessionStorage.getItem("token");
    if (!selectedEmployee?.id) return;
    try {
      const response = await fetch(`${API_URL}/employees/delete`, {
        method: "POST",
        headers: { 
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
          },
        
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
        
        {/* --- TOP HEADER SECTION --- */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#334e5e] flex items-center gap-3">
              <LayoutDashboard className="text-[#d4c391] w-8 h-8" /> 
              ข้อมูลบุคลากร <span className="text-slate-300 font-light text-xl">| Staff</span>
            </h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-11">
              ระบบสารสนเทศเพื่อการบริหารจัดการทรัพยากรบุคคล สำนักบริหารเทคโนโลยีสารสนเทศ
            </p>
          </div>
          
          <div className="flex gap-3">
<Button
  onClick={() => handleFetchData(page)}
  variant="outline"
  className="h-12 px-4 rounded-xl border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
  disabled={isLoading}
>
  รีเฟรช{" "}
  {isLoading ? (
    <Loader2 className="animate-spin h-4 w-4" />
  ) : (
    <RefreshCw className="ml-2 h-4 w-4" />
  )}
</Button>

            {/* Added Logout Button */}
            <button 
            onClick={() => navigate("/dashboardEmp")} 
            className="px-5 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
          >
            ดูสถิติ →
          </button>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
             {isAdmin && ( <Button onClick={handleOpenAdd} className="bg-[#d4c391] hover:bg-[#c6b47e] text-[#334e5e] font-bold h-12 px-6 rounded-xl shadow-lg shadow-[#d4c391]/20 transition-all active:scale-95">
                <PlusCircle className="mr-2 h-5 w-5" /> เพิ่มบุคลากรใหม่
              </Button> )}
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white rounded-3xl p-0 flex flex-col border-none shadow-2xl overflow-hidden">
                <div className="bg-[#334e5e] p-6 text-white shrink-0 relative overflow-hidden">
                  <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    {isEditing ? <Pencil className="text-[#d4c391]" /> : <PlusCircle className="text-[#d4c391]" />}
                    {isEditing ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มข้อมูลพนักงานใหม่"}
                  </DialogTitle>
                </div>
                
                <div className="p-8 space-y-6 overflow-y-auto flex-grow custom-scrollbar">
                  {/* Name Input */}
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

                  {/* ID & Birthday Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">เลขบัตรประชาชน</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <Input 
                          placeholder="Citizen ID" 
                          className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                          value={formData.Citizen_id} 
                          onChange={(e)=>setFormData({...formData, Citizen_id: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1">วันเกิด (พ.ศ.)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-12 justify-start border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e] hover:bg-white transition-colors">
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

                  {/* Tel & Position Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">เบอร์โทรศัพท์</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <Input 
                          placeholder="08x-xxx-xxxx" 
                          className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
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
                          className="h-12 pl-10 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                          value={formData.Position} 
                          onChange={(e)=>setFormData({...formData, Position: e.target.value})} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personnel Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ประเภทบุคลากร</Label>
                      <Input 
                        placeholder="ข้าราชการ/ลูกจ้าง..." 
                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                        value={formData.Personel_Type} 
                        onChange={(e)=>setFormData({...formData, Personel_Type: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ระดับ</Label>
                      <Input 
                        placeholder="ชำนาญการ..." 
                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                        value={formData.Position_Level} 
                        onChange={(e)=>setFormData({...formData, Position_Level: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">เลขที่ตำแหน่ง</Label>
                      <Input 
                        placeholder="เลขที่..." 
                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                        value={formData.Position_No} 
                        onChange={(e)=>setFormData({...formData, Position_No: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Task Management */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ภาระงานตามกรอบ (Assign)</Label>
                      <Input 
                        placeholder="ระบุภาระงาน..." 
                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                        value={formData.Assign_Task} 
                        onChange={(e)=>setFormData({...formData, Assign_Task: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400 ml-1 tracking-tighter">ภาระงานตามจริง (Actual)</Label>
                      <Input 
                        placeholder="ระบุภาระงาน..." 
                        className="h-12 border-slate-100 bg-slate-50/50 rounded-xl focus:ring-[#d4c391] focus:border-[#d4c391]" 
                        value={formData.Actual_Task} 
                        onChange={(e)=>setFormData({...formData, Actual_Task: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Status & Entry Date Row */}
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
                          <Button variant="outline" className="w-full h-12 justify-start border-slate-100 bg-slate-50/50 rounded-xl text-[#334e5e] hover:bg-white transition-colors">
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

                {/* Footer buttons */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
                  <Button variant="ghost" onClick={()=>setIsAddOpen(false)} className="flex-1 h-12 font-bold text-slate-400 hover:text-slate-600">
                    ยกเลิก
                  </Button>
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
              <Button variant="ghost" onClick={()=>setIsDeleteOpen(false)} className="flex-1 h-11 font-bold text-slate-400 hover:text-slate-600">ยกเลิก</Button>
              <Button onClick={confirmDelete} className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-100 transition-all active:scale-95">ยืนยันการลบ</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* --- SEARCH FILTER SECTION --- */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
            <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><User size={12} /> ชื่อพนักงาน</Label>
              <Input placeholder="ค้นหาชื่อ..." className="h-11 rounded-xl bg-slate-50/30 border-slate-100 focus:ring-[#d4c391]" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Layers size={12} /> ประเภท</Label>
              <Select value={searchPersonelType} onValueChange={setSearchPersonelType}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกประเภท" /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">ทุกประเภทบุคลากร</SelectItem>
                  {uniquePersonelTypes.map((type) => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-cent gap-1"><Briefcase size={12} /> ตำแหน่ง</Label>
              <Select value={searchPosition} onValueChange={setSearchPosition}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกตำแหน่ง" /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">ทุกตำแหน่งงาน</SelectItem>
                  {uniquePositions.map((pos) => (<SelectItem key={pos} value={pos}>{pos}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><MapPin size={12} /> ฝ่าย (ตามจริง)</Label>
              <Select value={searchDivision} onValueChange={setSearchDivision}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุกฝ่าย" /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">ทุกฝ่าย (ตามจริง)</SelectItem>
                  {uniqueDivisions.map((div) => (<SelectItem key={div} value={div}>{div}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><Filter size={12} /> Gen</Label>
              <Select value={searchGen} onValueChange={setSearchGen}>
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/30 border-slate-100 text-[#334e5e] font-medium"><SelectValue placeholder="ทุก Gen" /></SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
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
                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                  <SelectItem value="all">ทุกสถานะ</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="InActive">InActive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="h-11 bg-[#334e5e] hover:bg-[#253945] text-white font-bold rounded-xl flex-1 transition-all active:scale-95" onClick={handleSearch}>
                <Search size={16} />
              </Button>
              <Button variant="outline" className="h-11 bg-rose-500 hover:bg-rose-600 text-white border-rose-500 font-bold rounded-xl flex-1 transition-all active:scale-95" onClick={handleClearFilters}>
                <X size={16}/>
              </Button>
            </div>
          </div>
        </div>

        {/* --- MAIN DATA TABLE SECTION (ADDED REF HERE) --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-hidden">
        <div ref={tableRef} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-slate-50/50 text-[#334e5e] text-[10px] font-black uppercase tracking-tighter">
              <tr>
                <th className="w-[30px] px-1 py-3 text-center">#</th>
                <th className="w-[181px] px-10 py-3">ชื่อ / ประเภท</th>
                <th className="w-[100px] px-1 py-3 text-center">IdCard</th>
                <th className="w-[60px] px-1 py-3 text-center cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Position_No')}>
                  <div className="flex items-center justify-center gap-1">
                    เลขตำแหน่ง {sortConfig.key === 'Position_No' ? (sortConfig.direction === 'asc' ? <ChevronUp size={8}/> : <ChevronDown size={8}/>) : <ArrowUpDown size={8}/>}
                  </div>
                </th>
                <th className="w-[135px] px-6 py-3 ">ตำแหน่ง</th>
                <th className="w-[85px] px-1 py-3 text-center cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Level')}>
                  <div className="flex items-center justify-center gap-1">
                    ระดับ {sortConfig.key === 'Level' ? (sortConfig.direction === 'asc' ? <ChevronUp size={8}/> : <ChevronDown size={8}/>) : <ArrowUpDown size={8}/>}
                  </div>
                </th>
                <th className="w-[80px] px-1 py-3 text-center whitespace-nowrap">ตามกรอบ</th>
                <th className="w-[85px] px-1 py-3 text-center whitespace-nowrap">ตามจริง (ฝ่าย)</th>
                <th className="w-[80px] px-1 py-3 text-center cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Gen')}>
                  <div className="flex items-center justify-center gap-1">
                    Gen {sortConfig.key === 'Gen' ? (sortConfig.direction === 'asc' ? <ChevronUp size={8}/> : <ChevronDown size={8}/>) : <ArrowUpDown size={8}/>}
                  </div>
                </th>
                <th className="w-[85px] px-1 py-3 text-center">เบอร์โทร</th>
                <th className="w-[65px] px-1 py-3 text-center">สถานะ</th>
                <th className="w-[70px] px-1 py-3 text-right cursor-pointer transition-colors hover:bg-slate-100/50" onClick={() => handleSort('Entry_Date')}>
                  <div className="flex items-center justify-end gap-1">
                    เริ่มงาน {sortConfig.key === 'Entry_Date' ? (sortConfig.direction === 'asc' ? <ChevronUp size={8}/> : <ChevronDown size={8}/>) : <ArrowUpDown size={8}/>}
                  </div>
                </th>
                <th className="w-[55px] px-1 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            
            <tbody className="divide-y-0">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <Search size={48} strokeWidth={1} className="opacity-20" />
                      <p className="text-sm font-medium italic tracking-wide">ไม่พบข้อมูลบุคลากร</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp, idx) => {
                  const gen = getGeneration(emp.Birthday);
                  const levelStyle = getLevelStyle(emp.Position_Level);
                  
                  return (
                    <tr key={emp.id || idx} className="hover:bg-slate-50/40 transition-all group">
                      <td className="px-1 py-2 text-center align-middle font-bold text-slate-300 text-[9px] border-b border-gray">
                        {(idx + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-2 py-2 align-middle border-b border-gray">
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-6 h-6 rounded-lg bg-[#d4c391]/10 flex items-center justify-center text-[#d4c391] shrink-0">
                            <User size={12} />
                          </div>
                          <div className="truncate min-w-0 flex flex-col items-start justify-center">
                             <button
                                onClick={() => {
                                  if (isAdmin) handleOpenEdit(emp);
                                }}
                                className={`font-bold text-left truncate block w-full text-[11px] ${
                                  isAdmin
                                    ? "text-[#334e5e] hover:text-[#d4c391] transition-colors cursor-pointer"
                                    : "text-slate-400 cursor-not-allowed"
                                }`}
                              >
                                {emp.Name}
                              </button>
                            <span className="text-[7px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-tighter inline-flex items-center whitespace-nowrap min-w-fit">
                              {emp.Personel_Type || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex items-center justify-center gap-1 font-mono font-bold text-slate-400 text-[9px]">
                          <Fingerprint size={9} className="text-slate-300" />
                          {emp.Citizen_id || "-"}
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex items-center justify-center h-full">
                          <span className="font-bold text-black text-[10px] opacity-[70%]">{emp.Position_No || "-"}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 align-middle border-b border-gray">
                        <div className="flex flex-col items-start justify-center min-w-0 h-full">
                          <div className="font-bold text-slate-600 truncate text-[10px] leading-tight w-full">
                            {emp.Position}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex items-center justify-center h-full">
                          <div className={`inline-flex items-center justify-center gap-1 text-[7px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-tighter ${levelStyle.color}`}>
                            {levelStyle.icon} <span className="truncate max-w-[50px]">{emp.Position_Level || "-"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex items-center justify-center h-full">
                          <div className="inline-block text-[8px] font-black text-black bg-blue-100 px-1.5 py-1 rounded border border-blue-100 max-w-[75px] break-words leading-tight text-center">
                            {emp.Assign_Task || "0"}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex items-center justify-center h-full">
                          <div className="inline-block text-[8px] font-black text-black bg-red-100 px-1.5 py-1 rounded border border-red-100 max-w-fit leading-tight text-center">
                            {emp.Actual_Task || "0"}
                          </div>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="font-bold text-slate-500 text-[9px] tracking-tighter">{formatToBEText(emp.Birthday)}</span>
                          {gen && <span className={`px-1 py-0.5 text-[7px] font-black rounded leading-none ${gen.color}`}>{gen.label}</span>}
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex items-center justify-center h-full font-black text-slate-600 text-[9px]">
                          {emp.Tel || "-"}
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex items-center justify-center h-full">
                          <span className={`px-1 rounded-sm text-[7px] font-black border uppercase tracking-tighter ${emp.Status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                            {emp.Status || "Active"}
                          </span>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-right align-middle border-b border-gray">
                        <div className="flex items-center justify-end h-full">
                          <span className="font-black text-black text-[9px]">{formatToBEText(emp.Entry_Date)}</span>
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center align-middle border-b border-gray">
                        <div className="flex justify-center gap-0.5 items-center h-full">
                          {isAdmin && (<Button variant="ghost" size="icon" onClick={() => handleOpenEdit(emp)} className="h-5 w-5 text-blue-500 hover:bg-blue-50">
                            <Pencil size={10} />
                          </Button> )}
                         {isAdmin && ( <Button variant="ghost" size="icon" onClick={() => { setSelectedEmployee(emp); setIsDeleteOpen(true); }} className="h-5 w-5 text-rose-400 hover:bg-rose-50">
                            <Trash2 size={10} />
                          </Button> )}
                        </div>
                      </td>
                    </tr>
                    
                  );
                })
              )}
            </tbody>
          </table>
        </div>
         {/* PAGINATION FOOTER (THIS IS THE FIX) */}
{/* <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">

  LEFT SIDE
  <div className="flex items-center gap-2">
    <Button
      onClick={() => handleSafeFetch(1)}
      disabled={page <= 1 || isLoading}
      className="rounded-xl w-12 h-10 text-lg font-black"
    >
      {"</"}
    </Button>

    <Button
      onClick={() => handleSafeFetch(page - 1)}
      disabled={page <= 1 || isLoading}
      className="rounded-xl px-4 h-10"
    >
      Prev
    </Button>
  </div>

  CENTER 
  <div className="text-xs text-slate-400 font-bold">
    Page {page} / {totalPages}
  </div>

  RIGHT SIDE 
  <div className="flex items-center gap-2">
    <Button
      onClick={() => handleSafeFetch(page + 1)}
      disabled={page >= totalPages || isLoading}
      className="rounded-xl px-4 h-10"
    >
      Next
    </Button>

    <Button
      onClick={() => handleSafeFetch(totalPages)}
      disabled={page >= totalPages || isLoading}
      className="rounded-xl w-12 h-10 text-lg font-black"
    >
      {"/>"}
    </Button>
  </div>

</div>*/}
</div>

        {/* --- SUMMARY INFO FOOTER --- */}
        <div className="mt-4 flex justify-between items-center px-2">
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Total Personnel: <span className="text-[#334e5e]">{filteredEmployees.length}</span> Records
            </p>
            {/* <Button 
              onClick={exportToPDF}
              variant="outline" 
              className="h-8 px-4 rounded-lg border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[9px] font-black uppercase flex items-center gap-2 transition-all active:scale-95"
            >
              <FileText size={12} /> Save to PDF
            </Button> */}
          </div>
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