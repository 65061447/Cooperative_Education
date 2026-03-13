"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend,
  Bar, BarChart
} from "recharts";
import { 
  FileSpreadsheet, BarChart3, ChevronDown, 
  RotateCcw, LayoutDashboard, Search, Table as TableIcon
} from "lucide-react";

import { Payload } from "recharts/types/component/DefaultLegendContent";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

// --- 1. Interfaces ---

interface AccidentData2568 {
  category: string;
  ตาย: number;
  ทุพพลภาพ: number;
  สูญเสีย: number;
  หยุดงานเกิน3: number;
  หยุดงานไม่เกิน3: number;
  รวม: number;
}

type DataSeriesKey = keyof Omit<AccidentData2568, "category">;
type ExcelRow = (string | number | null | undefined)[];

const Graph2568: React.FC = () => {
  const [allSheetsData, setAllSheetsData] = useState<Record<string, AccidentData2568[]>>({});
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [selectedSeries, setSelectedSeries] = useState<DataSeriesKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadExcel = async (): Promise<void> => {
      try {
        const response = await fetch("/Cooperative_Education/Book68.xlsx");
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const dataStore: Record<string, AccidentData2568[]> = {};

        workbook.SheetNames.forEach((sheetName) => {
          if (sheetName.includes("6")) return;
          const sheet = workbook.Sheets[sheetName];
          const raw = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { header: 1 });

          const processed = raw.slice(7, 25).reduce<AccidentData2568[]>((acc, row) => {
            const category = row[0];
            if (typeof category === "string" && category !== "" && !category.includes("รวม")) {
              acc.push({
                category: category,
                ตาย: Number(row[1]) || 0,
                ทุพพลภาพ: Number(row[2]) || 0,
                สูญเสีย: Number(row[3]) || 0,
                หยุดงานเกิน3: Number(row[4]) || 0,
                หยุดงานไม่เกิน3: Number(row[5]) || 0,
                รวม: Number(row[6]) || 0,
              });
            }
            return acc;
          }, []);

          if (processed.length > 0) dataStore[sheetName] = processed;
        });

        setAllSheetsData(dataStore);
        const firstSheet = Object.keys(dataStore)[0];
        if (firstSheet) setActiveSheet(firstSheet);
        setLoading(false);
      } catch (err) {
        console.error("Error loading Excel:", err);
        setLoading(false);
      }
    };
    loadExcel();
  }, []);

  const currentData = allSheetsData[activeSheet] || [];

  const handleLegendClick = (props: Payload): void => {
    const { dataKey } = props;
    if (!dataKey) return;
    const key = dataKey as DataSeriesKey;
    setSelectedSeries(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isHidden = (key: DataSeriesKey): boolean => 
    selectedSeries.length > 0 && !selectedSeries.includes(key);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600 bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <FileSpreadsheet size={48} />
        <span>กำลังเตรียมข้อมูลทางสถิติ...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
        
        {/* --- Control Panel (FIXED: SELECT IS BACK) --- */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Explorer 2568</h1>
              <p className="text-slate-500 text-sm italic">Clean Data Output (Strict Type Mode)</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">เลือกหมวดหมู่</label>
              <div className="relative">
                <select 
                  value={activeSheet}
                  onChange={(e) => setActiveSheet(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  {Object.keys(allSheetsData).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="w-full md:w-40">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">รูปแบบกราฟ</label>
              <div className="relative">
                <select 
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as "bar" | "line")}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                </select>
                <BarChart3 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* --- Chart Section (FIXED: LAYOUT SQUASH) --- */}
        <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-10 px-2">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <Search size={18} className="text-indigo-500" /> 
              ผลการวิเคราะห์: <span className="text-indigo-600">{activeSheet}</span>
            </h2>
            {selectedSeries.length > 0 && (
              <button 
                onClick={() => setSelectedSeries([])} 
                className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-red-100 transition-all"
              >
                <RotateCcw size={14} /> คืนค่าตัวกรอง
              </button>
            )}
          </div>

          <div className="h-[550px] w-full">
            <ResponsiveContainer>
              {chartType === "bar" ? (
                <BarChart 
                  data={currentData} 
                  margin={{ bottom: 120, left: 10, right: 10, top: 20 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="category" 
                    angle={-45} 
                    textAnchor="end" 
                    interval={0} 
                    tick={{fontSize: 11, fontWeight: 600, fill: '#64748B'}} 
                    height={140}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94A3B8'}} />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  />
                  <Legend 
                    onClick={handleLegendClick} 
                    verticalAlign="top" 
                    align="right" 
                    wrapperStyle={{paddingBottom: 40, cursor: 'pointer'}} 
                  />
                  <Bar hide={isHidden("ตาย")} name="ตาย" dataKey="ตาย" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar hide={isHidden("สูญเสีย")} name="สูญเสียอวัยวะ" dataKey="สูญเสีย" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar hide={isHidden("หยุดงานเกิน3")} name="หยุดงาน > 3 วัน" dataKey="หยุดงานเกิน3" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={currentData} margin={{ bottom: 120, left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 11}} height={140} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{borderRadius: '16px'}} />
                  <Legend onClick={handleLegendClick} verticalAlign="top" align="right" wrapperStyle={{paddingBottom: 40, cursor: 'pointer'}} />
                  <Line hide={isHidden("รวม")} name="รวมทั้งหมด" type="monotone" dataKey="รวม" stroke="#1E293B" strokeWidth={3} dot={{r: 4}} />
                  <Line hide={isHidden("ตาย")} name="ตาย" type="monotone" dataKey="ตาย" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </section>

        {/* --- Table Section --- */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
            <TableIcon className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-800">สรุปข้อมูลตาราง</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">รายการ</th>
                  <th className="px-4 py-4 text-center">ตาย</th>
                  <th className="px-4 py-4 text-center">สูญเสียอวัยวะ</th>
                  <th className="px-4 py-4 text-center text-indigo-600">รวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentData.map((row, i) => (
                  <tr key={`${activeSheet}-${i}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{row.category}</td>
                    <td className="px-4 py-4 text-center text-red-500">{row.ตาย.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center">{row.สูญเสีย.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center font-bold text-slate-900 bg-slate-50/30">{row.รวม.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Graph2568;