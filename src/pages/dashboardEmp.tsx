"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Payload } from "recharts/types/component/DefaultLegendContent";

interface Employee {
  id?: number;
  Name: string;
  Birthday: string | number;
  Personel_Type: string;
}

interface ChartDataEntry {
  name: string;
  "Gen Alpha": number;
  "Gen Z": number;
  "Gen Y": number;
  "Gen X": number;
  "Baby Boomer": number;
  "Silent Gen": number;
}

interface GenConfig {
  key: keyof Omit<ChartDataEntry, "name">;
  color: string;
}

const getGeneration = (birthday: string | number): string => {
  if (!birthday) return "Unknown";
  const str = birthday.toString();
  let year = 0;
  if (str.includes("/")) {
    year = parseInt(str.split("/").pop() || "0");
  } else {
    year = parseInt(str.slice(-4));
  }
  if (year >= 2013) return "Gen Alpha";
  if (year >= 1997) return "Gen Z";
  if (year >= 1981) return "Gen Y";
  if (year >= 1965) return "Gen X";
  if (year >= 1946) return "Baby Boomer";
  return "Silent Gen";
};

const DashboardEmp: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [hiddenGens, setHiddenGens] = useState<string[]>([]);
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("http://localhost:3000/employees/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("Unauthorized or fetch failed");
      return res.json();
    })
    .then((result) => {
      setEmployees(result.data || []);
    })
    .catch((err) => {
      console.error("Dashboard fetch error:", err);
      setEmployees([]);
    });
}, []);

  const allChartData = useMemo<ChartDataEntry[]>(() => {
    const map: Record<string, Record<string, number>> = {};
    employees.forEach((emp) => {
      const type = emp.Personel_Type || "Unknown";
      const gen = getGeneration(emp.Birthday);
      if (!map[type]) map[type] = {};
      if (!map[type][gen]) map[type][gen] = 0;
      map[type][gen]++;
    });

    return Object.keys(map).map((type) => ({
      name: type,
      "Gen Alpha": map[type]["Gen Alpha"] || 0,
      "Gen Z": map[type]["Gen Z"] || 0,
      "Gen Y": map[type]["Gen Y"] || 0,
      "Gen X": map[type]["Gen X"] || 0,
      "Baby Boomer": map[type]["Baby Boomer"] || 0,
      "Silent Gen": map[type]["Silent Gen"] || 0,
    }));
  }, [employees]);

  const displayedData = useMemo(() => {
    if (selectedTypes.length === 0) return allChartData;
    return allChartData.filter((item) => selectedTypes.includes(item.name));
  }, [allChartData, selectedTypes]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleLegendClick = (data: Payload): void => {
    const key = data.dataKey;
    if (typeof key === "string") {
      setHiddenGens((prev) =>
        prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
      );
    }
  };

  const gens: GenConfig[] = [
    { key: "Gen Alpha", color: "#818cf8" },
    { key: "Gen Z", color: "#34d399" },
    { key: "Gen Y", color: "#fbbf24" },
    { key: "Gen X", color: "#f87171" },
    { key: "Baby Boomer", color: "#f472b6" },
    { key: "Silent Gen", color: "#94a3b8" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow p-8 container mx-auto space-y-6">
        
        {/* Swapped Header: Name on Left, Back Button on Right */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-[#334e5e] tracking-tight">อัตราคนในแต่ละเจเนอเรชั่นของลูกจ้างประเภทต่างๆ
          </h1>
          <button 
            onClick={() => navigate("/emp")} 
            className="px-5 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
          >
            Back to Employees →
          </button>
        </div>

        {/* Chart Container */}
        <div className="flex bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 h-[650px] gap-8">
          
          {/* Chart Area */}
          <div className="flex-[4] relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayedData} margin={{ top: 20, right: 10, left: -20, bottom: 100 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  height={120}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip cursor={{ fill: "#f8fafc", radius: 10 }} />
                
                <Legend 
                  onClick={handleLegendClick}
                  verticalAlign="top" 
                  align="left" 
                  wrapperStyle={{ paddingBottom: '30px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }} 
                />

                {gens.map((gen) => (
                  <Bar 
                    key={gen.key} 
                    dataKey={gen.key} 
                    stackId="a" 
                    fill={gen.color} 
                    hide={hiddenGens.includes(gen.key as string)}
                    barSize={50}
                  >
                    {displayedData.map((entry, i) => (
                      <Cell 
                        key={`cell-${entry.name}-${i}`} 
                        fillOpacity={selectedTypes.length > 0 && !selectedTypes.includes(entry.name) ? 0.2 : 1} 
                      />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Internal Filter Side-Box */}
          <div className="flex-1 border-l border-slate-100 pl-8 flex flex-col h-full overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Controls</h3>
            
            {/* Reset Filter Button: Inside, sitting slightly above options */}
            <button
              onClick={() => setSelectedTypes([])}
              className="w-full mb-4 py-2.5 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all uppercase tracking-tighter shadow-sm"
            >
              Reset Filters
            </button>

            <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              <span className="text-[9px] font-bold text-slate-300 uppercase block mb-1">Personnel Type</span>
              {allChartData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => toggleType(item.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    selectedTypes.includes(item.name)
                      ? "bg-[#334e5e] text-white border-[#334e5e] shadow-md translate-x-1"
                      : "bg-white text-slate-500 border-slate-100 hover:border-slate-300"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardEmp;