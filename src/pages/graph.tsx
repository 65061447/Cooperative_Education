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
  BarChart3, Phone, MessageCircle, Facebook, Youtube, Send
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

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

// --- Footer Component (Restored to your original version) ---
const Footer = () => {
  return (
    <footer className="bg-[#334e5e] text-white">
      <div className="container mx-auto px-6 py-9">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-9">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              สำนักงานประกันสังคม
            </h3>
            <div className="text-sm font-medium text-white/90 leading-relaxed">
              <p>สำนักงานใหญ่ 88/28 หมู่ 4 ถ.ติวานนท์</p>
              <p>ต.ตลาดขวัญ อ.เมือง จ.นนทบุรี 11000</p>
              <p className="text-[#d4c391] font-bold mt-2">info@sso1506.com</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              ติดต่อเรา
            </h3>
            <div className="flex items-center gap-3">
              <div className="bg-[#d4c391] p-2 rounded-xl shadow-md">
                <Phone className="h-5 w-5 text-[#334e5e]" />
              </div>
              <div>
                <div className="font-black text-xl leading-none">สายด่วน 1506</div>
                <div className="text-xs text-white/60 mt-1">สอบถามได้ตลอด 24 ชั่วโมง</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#00a8b5] p-2 rounded-xl shadow-md">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <Button variant="link" className="text-white hover:text-[#d4c391] p-0 h-auto font-black text-xl">
                  Live Chat
                </Button>
                <div className="text-xs text-white/60">คุยกับเจ้าหน้าที่โดยตรง</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              ลิงก์ที่สำคัญ
            </h3>
            <ul className="space-y-2 text-sm font-semibold">
              <li><a href="#" className="hover:text-[#d4c391] transition-all">เกี่ยวกับเรา</a></li>
              <li><a href="#" className="hover:text-[#d4c391] transition-all">สิทธิประโยชน์</a></li>
              <li><a href="#" className="hover:text-[#d4c391] transition-all">ดาวน์โหลดแบบฟอร์ม</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#d4c391] border-l-4 border-[#d4c391] pl-4 mb-2">
              ติดตามเรา
            </h3>
            <div className="flex gap-3 mb-4">
              {[Facebook, Youtube, Send].map((Icon, i) => (
                <Button key={i} size="icon" className="h-10 w-10 bg-white/10 hover:bg-[#d4c391] hover:text-[#334e5e] rounded-full transition-all border border-white/5">
                  <Icon className="h-5 w-5" />
                </Button>
              ))}
            </div>
            <div className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
              ผู้เข้าชม: 13,420,709 คน
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-white/20 tracking-widest uppercase">
          <p>© 2026 Social Security Office. All right reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/40 transition-colors">Terms</a>
            <button className="bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-[9px] border border-white/5">
              Re-Consent
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main Page Component ---
const Graph: React.FC = () => {
  const [yearlyData, setYearlyData] = useState<AccidentData[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

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

    const scrollContainer = element.querySelector('.overflow-x-auto') as HTMLElement;
    const originalOverflow = scrollContainer?.style.overflow;
    const originalWidth = scrollContainer?.style.width;

    try {
      if (target === 'table' && scrollContainer) {
        scrollContainer.style.overflow = 'visible';
        scrollContainer.style.width = '1000px'; // Set a fixed width for the export view
      }

      const dataUrl = await toPng(element, { 
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: { padding: '20px' }
      });

      if (target === 'table' && scrollContainer) {
        scrollContainer.style.overflow = originalOverflow || 'auto';
        scrollContainer.style.width = originalWidth || '100%';
      }

      if (type === 'pdf') {
        const pdf = new jsPDF("l", "mm", "a4");
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
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
        
        <div className="border-l-4 border-blue-600 pl-5">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">
            ตารางที่ 6 จำนวนวินิจฉัยการประสบอันตรายหรือเจ็บป่วยเนื่องจากการทำงาน 2558-2567
          </h1>
          <p className="text-slate-500 italic text-sm mt-1">
            แสดงสถิติย้อนหลัง 10 ปี (พ.ศ. {yearlyData[0]?.ปี} - {yearlyData[yearlyData.length-1]?.ปี})
          </p>
        </div>

        {/* Section 2: Chart */}
        <section className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-100">
          <div ref={chartRef} className="bg-white p-4">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={22} /> ตารางที่ 6 สรุปสถิติการประสบอันตราย
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
            <button onClick={() => handleExport('chart', 'excel')} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 text-sm"><FileSpreadsheet size={16} /> Export Excel</button>
            <button onClick={() => handleExport('chart', 'png')} className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 text-sm"><FileImage size={16} /> Save Image</button>
            <button onClick={() => handleExport('chart', 'pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 text-sm"><FileText size={16} /> Save PDF</button>
          </div>
        </section>

        {/* Section 3: Table */}
        <section className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div ref={tableRef} className="bg-white p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 px-2">
              <TableIcon size={20} className="text-blue-600" />
              <h3 className="text-lg font-bold text-slate-800">ตารางที่ 6 จำนวนวินิจฉัยการประสบอันตราย 2558-2567</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-tight">
                  <tr>
                    <th className="px-6 py-5 whitespace-nowrap">ปี พ.ศ.</th>
                    <th className="px-6 py-5 text-red-600">ตาย</th>
                    <th className="px-6 py-5">ทุพพลภาพ</th>
                    <th className="px-6 py-5">สูญเสียอวัยวะ</th>
                    <th className="px-6 py-5">หยุดงาน {'>'} 3 วัน</th>
                    <th className="px-6 py-5">หยุดงาน {'<'} 3 วัน</th>
                    <th className="px-6 py-5 font-black bg-blue-50 text-blue-800 text-center">รวม</th>
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
          <div className="flex flex-wrap justify-center gap-4 py-8 bg-slate-50/50 border-t border-slate-100">
            <button onClick={() => handleExport('table', 'excel')} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold hover:bg-emerald-100 text-sm"><FileSpreadsheet size={16} /> Export Table Excel</button>
            <button onClick={() => handleExport('table', 'png')} className="flex items-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-100 text-sm"><FileImage size={16} /> Save Table Image</button>
            <button onClick={() => handleExport('table', 'pdf')} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 text-sm"><FileText size={16} /> Save Table PDF</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Graph;