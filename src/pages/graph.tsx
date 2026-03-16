"use client";

import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Footer from "@/components/Footer";
import {
  XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend,
  Bar, ComposedChart, Line
} from "recharts";
import { 
  FileSpreadsheet, FileImage, 
  FileText, Table as TableIcon, 
  BarChart3, RotateCcw
} from "lucide-react";

import Header from "@/components/Header";

// --- Interfaces ---
interface AccidentData {
  ปี: string;
  ตาย: number;
  ทุพพลภาพ: number;
  สูญเสีย: number;
  หยุดงานเกิน3: number;
  หยุดงานไม่เกิน3: number;
  รวม: number;
}

interface LegendItem {
  dataKey?: string | number;
  value?: string;
  color?: string;
  payload?: {
    dataKey?: string;
  };
}

type ExcelRow = (string | number | undefined | null)[];

const Graph: React.FC = () => {
  const [yearlyData, setYearlyData] = useState<AccidentData[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);

  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const FIXED_TITLE = "ตารางที่ 6 จำนวนวินิจฉัยการประสบอันตรายหรือเจ็บป่วยเนื่องจากการทำงาน 2558-2568";

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const response = await fetch("/Cooperative_Education/Book68.xlsx");
        if (!response.ok) throw new Error("ไม่พบไฟล์ข้อมูล");
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames.find(n => n.includes("6")) || workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { header: 1 });
        
        const data = raw.slice(22, 32).map((row): AccidentData => ({
          ปี: String(row[0] ?? ""),
          ตาย: Number(row[1]) || 0,
          ทุพพลภาพ: Number(row[2]) || 0,
          สูญเสีย: Number(row[3]) || 0,
          หยุดงานเกิน3: Number(row[4]) || 0,
          หยุดงานไม่เกิน3: Number(row[5]) || 0,
          รวม: Number(row[6]) || 0,
        }));

        const row2568 = raw[45];
        if (row2568) {
          data.push({
            ปี: "2568",
            ตาย: Number(row2568[1]) || 0,
            ทุพพลภาพ: Number(row2568[2]) || 0,
            สูญเสีย: Number(row2568[3]) || 0,
            หยุดงานเกิน3: Number(row2568[4]) || 0,
            หยุดงานไม่เกิน3: Number(row2568[5]) || 0,
            รวม: Number(row2568[6]) || 0,
          });
        }
        setYearlyData(data);
      } catch (err) { console.error(err); }
    };
    loadExcel();
  }, []);

  const handleLegendClick = (item: LegendItem) => {
    const key = (item.dataKey || item.payload?.dataKey) as string;
    if (!key) return;
    setSelectedSeries((prev) => {
      if (prev.length === 0) return [key];
      if (prev.includes(key)) return prev.filter(k => k !== key);
      return [...prev, key];
    });
  };

  const isHidden = (dataKey: string) => {
    if (selectedSeries.length === 0) return false;
    return !selectedSeries.includes(dataKey);
  };

  const handleExport = async (target: 'chart' | 'table', type: 'excel' | 'png' | 'pdf') => {
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(yearlyData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${FIXED_TITLE}.xlsx`);
      return;
    }

    const element = target === 'chart' ? chartRef.current : tableRef.current;
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { backgroundColor: "#ffffff", cacheBust: true });
      if (type === 'pdf') {
        const pdf = new jsPDF("l", "mm", "a4");
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, "PNG", 10, 10, pdfWidth, pdfHeight);
        pdf.save(`${FIXED_TITLE}.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `${FIXED_TITLE}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 py-10 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 border-blue-600 pl-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{FIXED_TITLE}</h1>
            <p className="text-slate-500 text-sm font-medium">คลิกที่ชื่อในคำอธิบายกราฟเพื่อเลือกดูเฉพาะส่วนที่ต้องการ</p>
          </div>
        </div>

        {/* --- Section: Chart (Strict Stacked Bar Only) --- */}
        <section className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100">
          <div ref={chartRef} className="bg-white p-2 relative">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={22} /> {FIXED_TITLE}
            </h2>
            <div className="w-full h-[500px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearlyData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="ปี" tick={{fill: '#64748b', fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip formatter={(val: number) => val.toLocaleString()} />
                  <Legend 
                    verticalAlign="top" align="right" layout="vertical" 
                    wrapperStyle={{ paddingLeft: '20px', cursor: 'pointer' }}
                    onClick={(data) => handleLegendClick(data as LegendItem)}
                  />
                  <Bar hide={isHidden("หยุดงานไม่เกิน3")} name="หยุดงาน ≤ 3 วัน" dataKey="หยุดงานไม่เกิน3" stackId="a" fill="#00537a" />
                  <Bar hide={isHidden("หยุดงานเกิน3")} name="หยุดงาน > 3 วัน" dataKey="หยุดงานเกิน3" stackId="a" fill="#1697a6" />
                  <Bar hide={isHidden("สูญเสีย")} name="สูญเสียอวัยวะ" dataKey="สูญเสีย" stackId="a" fill="#0e606b" />
                  <Bar hide={isHidden("ทุพพลภาพ")} name="ทุพพลภาพ" dataKey="ทุพพลภาพ" stackId="a" fill="#ffc24b" />
                  <Bar hide={isHidden("ตาย")} name="ตาย" dataKey="ตาย" stackId="a" fill="#f47068" radius={[4, 4, 0, 0]} />
                  <Line hide={isHidden("รวม")} name="รวม" type="monotone" dataKey="รวม" stroke="#0a2344" strokeWidth={4} />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="absolute right-0 top-[180px] pr-4">
                <button onClick={() => setSelectedSeries([])} className={`flex items-center gap-1.5 text-xs font-bold transition-all ${selectedSeries.length > 0 ? "text-red-500 opacity-100" : "opacity-0 pointer-events-none"}`}>
                  <RotateCcw size={12} /> ล้างการเลือก
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-10 pt-8 border-t border-slate-50">
            <button onClick={() => handleExport('chart', 'excel')} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 text-sm"><FileSpreadsheet size={16} /> Export Excel</button>
            <button onClick={() => handleExport('chart', 'png')} className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 text-sm"><FileImage size={16} /> Save Chart Image</button>
            <button onClick={() => handleExport('chart', 'pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 text-sm"><FileText size={16} /> Save Chart PDF</button>
          </div>
        </section>

        {/* --- Section: Table --- */}
        <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div ref={tableRef} className="bg-white p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-2">
              <TableIcon size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800">{FIXED_TITLE}</h3>
            </div>
            
            <div className="w-full">
              <table className="w-full text-[13px] md:text-sm text-left border-collapse table-auto">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                  <tr>
                    <th className="px-2 py-4">ปี พ.ศ.</th>
                    <th className="px-2 py-4 text-red-600">ตาย</th>
                    <th className="px-2 py-4">ทุพพลภาพ</th>
                    <th className="px-2 py-4">สูญเสียอวัยวะ</th>
                    <th className="px-2 py-4">หยุดงาน {'>'} 3 วัน</th>
                    <th className="px-2 py-4">หยุดงาน {'<'} 3 วัน</th>
                    <th className="px-2 py-4 font-black bg-blue-50 text-blue-800 text-center">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {yearlyData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-2 py-3 font-bold text-slate-900">{row.ปี}</td>
                      <td className="px-2 py-3 font-semibold">{row.ตาย.toLocaleString()}</td>
                      <td className="px-2 py-3">{row.ทุพพลภาพ.toLocaleString()}</td>
                      <td className="px-2 py-3">{row.สูญเสีย.toLocaleString()}</td>
                      <td className="px-2 py-3">{row.หยุดงานเกิน3.toLocaleString()}</td>
                      <td className="px-2 py-3">{row.หยุดงานไม่เกิน3.toLocaleString()}</td>
                      <td className="px-2 py-3 font-black text-blue-700 bg-blue-50/20 text-center">{row.รวม.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 py-8 bg-slate-50/50 border-t border-slate-100">
            <button onClick={() => handleExport('table', 'excel')} className="flex items-center gap-2 px-5 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs"><FileSpreadsheet size={14} /> Export Table Excel</button>
            <button onClick={() => handleExport('table', 'png')} className="flex items-center gap-2 px-5 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold text-xs"><FileImage size={14} /> Save Table Image</button>
            <button onClick={() => handleExport('table', 'pdf')} className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs"><FileText size={14} /> Save Table PDF</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Graph;