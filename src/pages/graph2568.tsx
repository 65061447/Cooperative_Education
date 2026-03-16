"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  Bar, BarChart
} from "recharts";
import { 
  RotateCcw, LayoutDashboard, 
  Table as TableIcon, EyeOff, MousePointer2, ChevronDown
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

// --- Strict Type Definitions ---
type ExcelValue = string | number | null | undefined;
type ExcelRow = ExcelValue[];

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

interface SeriesConfig {
  key: DataSeriesKey;
  label: string;
  color: string;
}

const SERIES_MAP: SeriesConfig[] = [
  { key: "ตาย", label: "ตาย", color: "#EF4444" },
  { key: "ทุพพลภาพ", label: "ทุพพลภาพ", color: "#A855F7" },
  { key: "สูญเสีย", label: "สูญเสียอวัยวะ", color: "#F59E0B" },
  { key: "หยุดงานเกิน3", label: "หยุดงาน > 3 วัน", color: "#3B82F6" },
  { key: "หยุดงานไม่เกิน3", label: "หยุดงาน <= 3 วัน", color: "#10B981" },
  { key: "รวม", label: "รวมทั้งหมด", color: "#1E293B" },
];

const Graph2568: React.FC = () => {
  const [allSheetsData, setAllSheetsData] = useState<Record<string, AccidentData2568[]>>({});
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [visibleSeries, setVisibleSeries] = useState<DataSeriesKey[]>(SERIES_MAP.map(s => s.key));
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const parseNum = (val: ExcelValue): number => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const cleaned = val.replace(/,/g, "").trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  useEffect(() => {
    const loadExcel = async (): Promise<void> => {
      try {
        const response = await fetch("/Cooperative_Education/Book68.xlsx");
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const dataStore: Record<string, AccidentData2568[]> = {};

        // --- SORT ASCENDING (A -> B, 1 -> 2) ---
        const sortedSheetNames = [...workbook.SheetNames].sort((a, b) => a.localeCompare(b));

        sortedSheetNames.forEach((sheetName: string) => {
          if (sheetName === "6" || (sheetName.includes("6") && sheetName.length < 3)) return;
          
          const sheet = workbook.Sheets[sheetName];
          const raw = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { header: 1 });

          const isSheet14 = sheetName.includes("14");
          const isSheet23 = sheetName.includes("23") || sheetName.includes("ขนาด");
          const isSheet13 = sheetName.includes("13") || sheetName.includes("22") || sheetName.includes("อายุ");
          const isSheet21 = sheetName.includes("21") || sheetName.includes("ผล");
          const isDisease = sheetName.includes("โรค");

          const processed: AccidentData2568[] = [];
          const diseaseTargetRows = [9, 12, 13, 15, 17, 20, 21, 23, 27];

          for (let i = 0; i < raw.length; i++) {
            const row = raw[i];
            if (!row || row.length === 0) continue;

            let idx_cat = 0;
            let idx_data = 1;
            let idx_total = 6;

            if (isDisease) {
              if (!diseaseTargetRows.includes(i)) continue;
              if (i !== 27) {
                idx_cat = 1; idx_data = 2; idx_total = 7; 
              } else {
                idx_cat = 0; idx_data = 2; idx_total = 7; 
              }
            } 
            else if (isSheet23) {
              idx_cat = 0; idx_data = 1; idx_total = 6;
            } 
            else if (isSheet14) {
              idx_cat = 1; idx_data = 2; idx_total = 7;
            } 
            else if (isSheet13) {
              idx_cat = 0; idx_data = 3; idx_total = 8;
            }

            const currentCategory: string = String(row[idx_cat] || "").replace(/\s+/g, ' ').trim();
            const col0: string = String(row[0] || "").trim();

            if (currentCategory.includes("หมายเหตุ") || currentCategory.includes("ที่มา:")) break;

            if (isSheet21 && processed.length > 0) {
              const last = processed[processed.length - 1];
              if (currentCategory.includes("ปรากฎ") || currentCategory.includes("ปรากฏ") || 
                  currentCategory.includes("ที่เกี่ยวข้อง") || currentCategory.includes("ออกซิเจน") || 
                  currentCategory.includes("จำแนกได้")) {
                last.category += ` ${currentCategory}`;
                last.ตาย += parseNum(row[idx_data]);
                last.ทุพพลภาพ += parseNum(row[idx_data + 1]);
                last.สูญเสีย += parseNum(row[idx_data + 2]);
                last.หยุดงานเกิน3 += parseNum(row[idx_data + 3]);
                last.หยุดงานไม่เกิน3 += parseNum(row[idx_data + 4]);
                last.รวม += parseNum(row[idx_total]);
                continue; 
              }
            }

            const shouldSkip = 
              currentCategory === "" || 
              currentCategory === "0" ||
              currentCategory === "ตาย" || 
              currentCategory === "ลำดับ" ||
              currentCategory.includes("จำแนกตาม") ||
              currentCategory.includes("สิ่งที่ทำให้") ||
              currentCategory.includes("อวัยวะที่") ||
              currentCategory.includes("ผลของการ") ||
              currentCategory.includes("กลุ่มอายุ") ||
              currentCategory.includes("ขนาดสถาน") ||
              currentCategory.includes("ความรุนแรง") ||
              currentCategory.includes("ระหว่างวันที่") ||
              currentCategory.includes("สาเหตุที่") ||
              currentCategory.includes("หรือเจ็บป่วย") ||
              currentCategory.includes("ตารางที่") ||
              (currentCategory.includes("รวม") && !isDisease) || 
              currentCategory.includes("ปี 2568") ||
              currentCategory.includes("ประเภทกิจการ") ||
              currentCategory === "นายจ้าง" ||
              (sheetName.includes("13") && currentCategory.includes("หน่วยงาน"));

            if (!shouldSkip || (isDisease && diseaseTargetRows.includes(i))) {
              let finalLabel = currentCategory;
              if (isSheet14 && !isSheet23) {
                finalLabel = `${col0} ${currentCategory}`.trim();
              }

              processed.push({
                category: finalLabel,
                ตาย: parseNum(row[idx_data]),
                ทุพพลภาพ: parseNum(row[idx_data + 1]),
                สูญเสีย: parseNum(row[idx_data + 2]),
                หยุดงานเกิน3: parseNum(row[idx_data + 3]),
                หยุดงานไม่เกิน3: parseNum(row[idx_data + 4]), 
                รวม: parseNum(row[idx_total]),
              });
            }
          }

          if (processed.length > 0) {
            let displayName = sheetName;
            if (sheetName === "13") displayName = "13.การประสบอันตรายในแต่ละหน่วยงาน";
            else if (sheetName === "14") displayName = "14.ประเภทกิจการ";
            else if (sheetName.includes("18.สาเหตุ")) displayName = "18.สาเหตุที่ประสบอันตราย";
            else if (sheetName.includes("โรค")) displayName = "24.โรคที่เกิดขึ้นตามลักษณะหรือสภาพของงาน";
            else if (sheetName.includes("19.สิ่ง")) displayName = "19.สิ่งที่ทำให้ประสบอันตราย";
            else if (sheetName.includes("20.อวัยวะ")) displayName = "20.อวัยวะที่ประสบอันตราย";
            else if (sheetName.includes("21.ผล")) displayName = "21.ผลของการประสบอันตราย";
            else if (sheetName.includes("22.อายุ")) displayName = "22.กลุ่มอายุ";
            else if (sheetName.includes("23.ขนาด")) displayName = "23.ขนาดสถานประกอบการ";

            dataStore[displayName] = processed;
          }
        });

        setAllSheetsData(dataStore);
        const keys = Object.keys(dataStore);
        if (keys.length > 0) setActiveSheet(keys[0]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    loadExcel();
  }, []);

  const resetFilters = (): void => {
    setVisibleSeries(SERIES_MAP.map(s => s.key));
    setIsFiltered(false);
  };

  const handleToggle = (key: DataSeriesKey): void => {
    if (!isFiltered) {
      setVisibleSeries([key]);
      setIsFiltered(true);
    } else {
      const next = visibleSeries.includes(key) ? visibleSeries.filter(k => k !== key) : [...visibleSeries, key];
      if (next.length === 0) resetFilters();
      else setVisibleSeries(next);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Ascending Order Locked...</div>;

  const currentData = allSheetsData[activeSheet] || [];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full p-2 md:p-6 space-y-6">
        
        <div className="bg-slate-50 p-5 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
              <LayoutDashboard size={20} className="text-blue-600" />
            </div>
            <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Data Analysis 2568</h1>
          </div>
          <div className="relative w-full md:w-96">
            <select 
              value={activeSheet}
              onChange={(e) => { setActiveSheet(e.target.value); resetFilters(); }}
              className="w-full bg-white border border-slate-200 p-3.5 rounded-2xl font-bold text-[11px] appearance-none outline-none shadow-sm cursor-pointer pr-10"
            >
              {Object.keys(allSheetsData).map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
          </div>
        </div>

        <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="mb-8 flex flex-wrap gap-2 items-center">
             <button onClick={resetFilters} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black flex items-center gap-2 hover:bg-black transition-all">
                <RotateCcw size={12} /> RESET ALL
              </button>
              <div className="h-6 w-[1px] bg-slate-100 mx-2" />
              {SERIES_MAP.map((s) => {
                const isActive = visibleSeries.includes(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => handleToggle(s.key)}
                    style={{ backgroundColor: isActive ? s.color : '#fff', color: isActive ? '#fff' : '#94A3B8' }}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${isActive ? 'border-transparent shadow-md' : 'border-slate-50 hover:border-slate-200'}`}
                  >
                    {isActive ? <MousePointer2 size={12} /> : <EyeOff size={12} />}
                    {s.label}
                  </button>
                );
              })}
          </div>

          <div className="w-full">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="h-[600px]" style={{ minWidth: currentData.length > 8 ? `${currentData.length * 110}px` : '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F8FAFC" />
                    <XAxis 
                      dataKey="category" 
                      angle={-35} 
                      textAnchor="end" 
                      interval={0} 
                      height={140}
                      tick={{fontSize: 10, fontWeight: 700, fill: '#64748B'}}
                      axisLine={{stroke: '#F1F5F9'}}
                    />
                    <YAxis axisLine={false} tickLine={false} width={85} tick={{fontSize: 12, fontWeight: 600, fill: '#CBD5E1'}} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'}} />
                    {SERIES_MAP.map(s => (
                      <Bar 
                        key={s.key}
                        hide={!visibleSeries.includes(s.key)}
                        name={s.label}
                        dataKey={s.key}
                        fill={s.color}
                        radius={[6, 6, 0, 0]}
                        barSize={visibleSeries.length === 1 ? 60 : 18} 
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <TableIcon size={14} /> Full Sheet View
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] text-left">
              <thead>
                <tr className="bg-white text-slate-300 font-bold border-b border-slate-50">
                  <th className="px-8 py-5">Category Detail</th>
                  {SERIES_MAP.map(s => <th key={s.key} className="px-4 py-5 text-center">{s.label}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-700">{row.category}</td>
                    <td className="px-4 py-4 text-center text-red-500 font-black">{row.ตาย.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center text-slate-400">{row.ทุพพลภาพ.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center text-slate-400">{row.สูญเสีย.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center text-slate-400">{row.หยุดงานเกิน3.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-600">{row.หยุดงานไม่เกิน3.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center font-black text-slate-900 bg-slate-50/30">{row.รวม.toLocaleString()}</td>
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