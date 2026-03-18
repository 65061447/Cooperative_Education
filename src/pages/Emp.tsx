"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, ArrowUpDown, LayoutDashboard, 
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";

// --- 1. Types (Updated to prevent the red "result" error) ---
interface Employee {
  id: number;
  name: string;        
  birthday: string;    
  phone: string;       
  position: string;    
  department: string;  
  joinDate: string;    
  // Add these as optional so the map function doesn't error out
  displayBirthday?: string;
  displayJoinDate?: string;
  genGroup?: { label: string; color: string };
}

// --- 2. Helper Functions ---
const getGeneration = (birthDateStr: string) => {
  const year = new Date(birthDateStr).getFullYear();
  if (year <= 1964) return { label: "Baby Boomer", color: "bg-orange-100 text-orange-700" };
  if (year <= 1980) return { label: "Gen X", color: "bg-blue-100 text-blue-700" };
  if (year <= 1996) return { label: "Gen Y", color: "bg-green-100 text-green-700" };
  return { label: "Gen Z", color: "bg-purple-100 text-purple-700" };
};

const formatThaiDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear() + 543;
  return `${d}/${m}/${y}`;
};

const Emp: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Mock Data
  useEffect(() => {
    const data: Employee[] = [
      { id: 1, name: "สมชาย ใจดี", birthday: "1985-05-20", phone: "081-234-5678", position: "Senior Developer", department: "IT", joinDate: "2015-01-10" },
      { id: 2, name: "สมศรี มีสุข", birthday: "1992-11-02", phone: "089-123-4455", position: "HR Manager", department: "HR", joinDate: "2018-03-15" },
      { id: 3, name: "วิชัย ร่ำรวย", birthday: "1978-02-14", phone: "082-999-8877", position: "Director", department: "Admin", joinDate: "2010-05-20" },
      { id: 4, name: "นภา สดใส", birthday: "2000-07-25", phone: "061-444-5566", position: "Junior Designer", department: "Creative", joinDate: "2023-09-01" },
    ];
    setEmployees(data);
  }, []);

  // --- 5. FIXED Logic (No more red lines) ---
  const filteredData = useMemo(() => {
    // Filter first
    const result = employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by Join Date
    result.sort((a, b) => {
      const dateA = new Date(a.joinDate).getTime();
      const dateB = new Date(b.joinDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [employees, searchTerm, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#334e5e] flex items-center gap-2">
            <LayoutDashboard className="text-[#d4c391]" /> รายชื่อบุคลากร (Staff List)
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="ค้นหาชื่อ, ตำแหน่ง, ฝ่าย..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">ชื่อ</th>
                  <th className="px-6 py-4 font-semibold">วันเกิด / Generation</th>
                  <th className="px-6 py-4 font-semibold">เบอร์โทร</th>
                  <th className="px-6 py-4 font-semibold text-lg">ตำแหน่งงาน</th>
                  <th className="px-6 py-4 font-semibold">ฝ่าย</th>
                  <th className="px-6 py-4 font-semibold">
                    <button 
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="flex items-center gap-1 hover:text-[#d4c391] transition-all"
                    >
                      วันที่เข้าทำงาน <ArrowUpDown size={14} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((emp) => {
                  const gen = getGeneration(emp.birthday);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#334e5e]">{emp.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold">{formatThaiDate(emp.birthday)}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${gen.color}`}>
                          {gen.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{emp.phone}</td>
                      <td className="px-6 py-4 text-[#334e5e] font-bold text-base italic">{emp.position}</td>
                      <td className="px-6 py-4 text-slate-600">{emp.department}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatThaiDate(emp.joinDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Emp;