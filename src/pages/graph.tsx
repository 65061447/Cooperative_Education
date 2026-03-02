"use client";

import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from "recharts";
import { 
  FileSpreadsheet, FileImage, 
  FileText, Table as TableIcon, 
  BarChart3
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

// --- Interface ---
interface AccidentData {
  ปี: string;
  ตาย: number;
  ทุพพลภาพ: number;
  สูญเสีย: number;
  หยุดงานเกิน3: number;
  หยุดงานไม่เกิน3: number;
  รวม: number;
}

type ExcelRow = (string | number | undefined | null)[];

const Graph: React.FC = () => {
  const [yearlyData, setYearlyData] = useState<AccidentData[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null); // Ref for the whole table section

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
        setYearlyData(data);
      } catch (err) { console.error(err); }
    };
    loadExcel();
  }, []);

  const handleExport = async (target: 'chart' | 'table', type: 'excel' | 'png' | 'pdf') => {
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(yearlyData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data_Summary");
      XLSX.writeFile(wb, `Accident_Data_${target}.xlsx`);
      return;
    }

    const element = target === 'chart' ? chartRef.current : tableRef.current;
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { 
        backgroundColor: "#ffffff",
        style: { padding: '20px' } 
      });

      if (type === 'pdf') {
        const pdf = new jsPDF("l", "mm", "a4");
        // Maintain aspect ratio for PDF export
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, "PNG", 10, 10, pdfWidth, pdfHeight);
        pdf.save(`${target}_report.pdf`);
      } else {
        const link = document.createElement("a");
        link.download = `${target}_export.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 py-10 space-y-10">
        
        {/* Section 1: Page Header */}
        <div className="border-l-4 border-blue-600 pl-5">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            ตารางที่ 6 จำนวนวินิจฉัยการประสบอันตรายหรือเจ็บป่วยเนื่องจากการทำงาน 2558-2567
          </h1>
          <p className="text-slate-500 italic text-sm mt-1">
            แสดงสถิติย้อนหลัง 10 ปี (พ.ศ. {yearlyData[0]?.ปี} - {yearlyData[yearlyData.length-1]?.ปี})
          </p>
        </div>

        {/* Section 2: Chart Analysis */}
        <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100">
          <div ref={chartRef} className="bg-white p-4">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={22} /> ตารางที่ 6 จำนวนวินิจฉัยการประสบอันตรายหรือเจ็บป่วยเนื่องจากการทำงาน 2558-2567
            </h2>
            <div className="w-full h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={yearlyData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="ปี" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" align="center" wrapperStyle={{paddingBottom: '20px'}} />
                  <Bar dataKey="หยุดงานไม่เกิน3" name="หยุดงาน ≤ 3 วัน" stackId="a" fill="#94a3b8" />
                  <Bar dataKey="หยุดงานเกิน3" name="หยุดงาน > 3 วัน" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="สูญเสีย" name="สูญเสียอวัยวะ" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="ทุพพลภาพ" name="ทุพพลภาพ" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="ตาย" name="ตาย (แท่ง)" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="รวม" name="รวมทั้งหมด" stroke="#1e293b" strokeWidth={4} dot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-10 pt-8 border-t border-slate-50">
            <button onClick={() => handleExport('chart', 'excel')} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-100 text-sm">
              <FileSpreadsheet size={16} /> Export Excel
            </button>
            <button onClick={() => handleExport('chart', 'png')} className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-100 text-sm">
              <FileImage size={16} /> Save Image
            </button>
            <button onClick={() => handleExport('chart', 'pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200 text-sm">
              <FileText size={16} /> Save PDF
            </button>
          </div>
        </section>

        {/* Section 3: Data Table */}
        <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {/* Main container holding the title and the table for export */}
          <div ref={tableRef} className="bg-white p-6 md:p-8 space-y-6">
            
            {/* Table Title - Now inside the ref area */}
            <div className="flex items-center gap-2 px-2">
              <TableIcon size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800">
                ตารางที่ 6 จำนวนวินิจฉัยการประสบอันตรายหรือเจ็บป่วยเนื่องจากการทำงาน 2558-2567
              </h3>
            </div>

            {/* Table Itself */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-tight">
                  <tr>
                    <th className="px-6 py-5 whitespace-nowrap">ปี พ.ศ.</th>
                    <th className="px-6 py-5 text-red-600">ตาย</th>
                    <th className="px-6 py-5 whitespace-nowrap">ทุพพลภาพ</th>
                    <th className="px-6 py-5 whitespace-nowrap">สูญเสียอวัยวะ</th>
                    <th className="px-6 py-5 whitespace-nowrap">หยุดงาน {'>'} 3 วัน</th>
                    <th className="px-6 py-5 whitespace-nowrap">หยุดงาน {'<'} 3 วัน</th>
                    <th className="px-6 py-5 font-black bg-blue-50 text-blue-800 text-center whitespace-nowrap">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {yearlyData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{row.ปี}</td>
                      <td className="px-6 py-4 font-semibold">{row.ตาย.toLocaleString()}</td>
                      <td className="px-6 py-4">{row.ทุพพลภาพ.toLocaleString()}</td>
                      <td className="px-6 py-4">{row.สูญเสีย.toLocaleString()}</td>
                      <td className="px-6 py-4">{row.หยุดงานเกิน3.toLocaleString()}</td>
                      <td className="px-6 py-4">{row.หยุดงานไม่เกิน3.toLocaleString()}</td>
                      <td className="px-6 py-4 font-black text-blue-700 bg-blue-50/20 text-center">{row.รวม.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Buttons (Outside the ref area so they don't get saved) */}
          <div className="flex flex-wrap justify-center gap-4 py-8 bg-slate-50/50 border-t border-slate-100">
            <button onClick={() => handleExport('table', 'excel')} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-100 text-sm">
              <FileSpreadsheet size={16} /> Export Table Excel
            </button>
            <button onClick={() => handleExport('table', 'png')} className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-100 text-sm">
              <FileImage size={16} /> Save Table Image
            </button>
            <button onClick={() => handleExport('table', 'pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all border border-slate-200 text-sm">
              <FileText size={16} /> Save Table PDF
            </button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Graph;   