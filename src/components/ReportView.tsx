import React, { useState } from 'react';
import {
  AlertTriangle,
  FileCheck,
  FileText,
  FileCode,
  Send,
  Printer,
  Phone
} from 'lucide-react';
import { SelectedStudent } from '../types.ts';
import {
  formatPhoneDisplay,
  createWhatsAppOfficialMessage,
  openWhatsAppChat
} from '../utils/phoneUtils.ts';

interface ReportViewProps {
  students: SelectedStudent[];
  degree: string;
  problem: string;
  procedures: string[];
  warnings: string[];
  isSaved: boolean;
  onSaveToArchive: () => void;
  onOpenWhatsApp: (selectedProcs: string[]) => void;
  onShowAlert: (message: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  students = [],
  degree,
  problem,
  procedures = [],
  warnings = [],
  isSaved,
  onSaveToArchive,
  onOpenWhatsApp,
  onShowAlert
}) => {
  const [checkedProcs, setCheckedProcs] = useState<boolean[]>(() =>
    (procedures || []).map(() => true)
  );

  const toggleProc = (index: number) => {
    setCheckedProcs((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const todayStr = new Date().toLocaleDateString('ar-SA');
  const distinctClasses = Array.from(new Set(students.map((s) => s.cls))).join(
    ' ، '
  );

  const handleSendSingleWhatsApp = (student: SelectedStudent) => {
    const selectedProcs = procedures.filter((_, idx) => checkedProcs[idx]);
    const message = createWhatsAppOfficialMessage({
      studentName: student.name,
      className: student.cls,
      problemDesc: problem,
      degree,
      procedures: selectedProcs
    });
    openWhatsAppChat(student.phone || '', message);
  };

  const handleExportPDF = () => {
    const element = document.getElementById('report-container');
    if (!element) return;

    const stdName =
      students.length > 1
        ? 'مشكلة_جماعية'
        : students[0]?.name.replace(/\s+/g, '_') || 'تقرير_سلوكي';

    // Check if html2pdf is available globally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdf = (window as any).html2pdf;
    if (typeof html2pdf === 'function') {
      const opt = {
        margin: 0.3,
        filename: `تقرير_${stdName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          windowWidth: document.documentElement.scrollWidth
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .catch(() => {
          window.print();
        });
    } else {
      window.print();
    }
  };

  const handleExportWord = () => {
    const stdName = students
      .map((s) => `${s.name} (الصف: ${s.cls} - جوال ولي الأمر: ${formatPhoneDisplay(s.phone)})`)
      .join(' <br> ');
    const stdClass = distinctClasses;
    const stdProblem = problem;
    const stdDegree = degree;

    let proceduresHTML = '';
    procedures.forEach((proc, index) => {
      const isChecked = checkedProcs[index];
      const checkSymbol = isChecked
        ? '<span style="color:#27ae60; font-size:12pt;">&#9745;</span>'
        : '<span style="color:#95a5a6; font-size:12pt;">&#9744;</span>';
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fbfb';
      proceduresHTML += `<tr bgcolor="${bgColor}">
        <td style="border: 1px solid #b2ebf2; text-align: center; vertical-align: middle; padding: 10px; font-family: 'Tajawal', Tahoma, sans-serif; font-size: 10pt;">${checkSymbol}</td>
        <td style="border: 1px solid #b2ebf2; text-align: center; font-weight: bold; color: #16a085; padding: 10px; font-family: 'Tajawal', Tahoma, sans-serif; font-size: 10pt;">الإجراء ${index + 1}</td>
        <td style="border: 1px solid #b2ebf2; padding: 10px; color: #2c3e50; font-family: 'Tajawal', Tahoma, sans-serif; line-height: 1.6; font-size: 10pt;">${proc}</td>
      </tr>`;
    });

    const wordHTML = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>تقرير سلوكي</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap');
    body { font-family: 'Tajawal', Tahoma, Arial, sans-serif !important; direction: rtl; font-size: 10pt; }
  </style>
</head>
<body dir="rtl" style="font-family: 'Tajawal', Tahoma, Arial, sans-serif; color: #2c3e50; font-size: 10pt;">
  <table width="100%" cellpadding="0" cellspacing="0" style="border: none; margin-bottom: 20px; font-family: 'Tajawal', Tahoma, sans-serif;">
    <tr>
      <td width="33%" style="border: none; text-align: right; line-height: 1.8; font-size: 10pt; font-weight: bold; color: #34495e;">
        المملكة العربية السعودية<br>وزارة التعليم<br>إدارة التعليم بمحافظة الأحساء<br>مدرسة الجشة المتوسطة
      </td>
      <td width="34%" style="border: none; text-align: center; vertical-align: top;">
        <h2 style="margin: 0; margin-top: 10px; color: #16a085; border-bottom: 2px solid #16a085; display: inline-block; padding-bottom: 5px; font-size: 12pt;">تقرير معالجة مشكلة سلوكية</h2>
      </td>
      <td width="33%" style="border: none; text-align: left; vertical-align: top; color: #7f8c8d; font-size: 10pt;">
        <br><strong>تاريخ التقرير:</strong> ${todayStr}
      </td>
    </tr>
  </table>
  <table width="100%" cellpadding="10" cellspacing="0" border="1" bordercolor="#b2ebf2" style="border-collapse: collapse; margin-bottom: 20px; font-family: 'Tajawal', Tahoma, sans-serif;">
    <tr>
      <th width="20%" bgcolor="#f0fbfc" style="background-color: #f0fbfc; color: #16a085; text-align: right; font-size: 10pt; vertical-align:top;">اسم الطالب (أو الطلاب):</th>
      <td width="80%" colspan="3" style="font-weight: bold; font-size: 10pt; color: #2c3e50; line-height:1.6;">${stdName}</td>
    </tr>
    <tr>
      <th width="20%" bgcolor="#f0fbfc" style="background-color: #f0fbfc; color: #16a085; text-align: right; font-size: 10pt;">الصف:</th>
      <td width="30%" style="color: #2c3e50; font-size: 10pt;">${stdClass}</td>
      <th width="20%" bgcolor="#ffebee" style="background-color: #ffebee; color: #c62828; text-align: right; font-size: 10pt;">درجة المخالفة:</th>
      <td width="30%" style="font-weight: bold; color: #c62828; font-size: 10pt;">${stdDegree}</td>
    </tr>
    <tr>
      <th width="20%" bgcolor="#f0fbfc" style="background-color: #f0fbfc; color: #16a085; text-align: right; vertical-align: top; font-size: 10pt;">المشكلة السلوكية:</th>
      <td colspan="3" style="line-height: 1.8; color: #34495e; background-color: #fdfefe; font-size: 10pt;">${stdProblem}</td>
    </tr>
  </table>
  <h3 style="color: #16a085; font-family: 'Tajawal', Tahoma, sans-serif; margin-bottom: 10px; font-size: 11pt;">الإجراءات التربوية والعلاجية المنفذة:</h3>
  <table width="100%" cellpadding="0" cellspacing="0" border="1" bordercolor="#b2ebf2" style="border-collapse: collapse; font-family: 'Tajawal', Tahoma, sans-serif;">
    <thead>
      <tr bgcolor="#16a085">
        <th width="10%" style="padding: 10px; color: white; text-align: center; font-size: 10pt;">المنفذ</th>
        <th width="20%" style="padding: 10px; color: white; text-align: center; font-size: 10pt;">الإجراء</th>
        <th width="70%" style="padding: 10px; color: white; text-align: right; font-size: 10pt;">وصف الإجراء التفصيلي</th>
      </tr>
    </thead>
    <tbody>${proceduresHTML}</tbody>
  </table>
  <br><br>
  <table width="100%" cellpadding="10" cellspacing="0" style="border: none; text-align: center; margin-top: 30px; font-family: 'Tajawal', Tahoma, sans-serif; color: #34495e;">
    <tr>
      <td style="border: none; width: 33%; font-size: 10pt;"><strong style="color: #16a085;">توقيع الطالب (أو الطلاب)</strong><br><br><br>........................</td>
      <td style="border: none; width: 33%; font-size: 10pt;"><strong style="color: #16a085;">توقيع وكيل المدرسة</strong><br><br><br>........................</td>
      <td style="border: none; width: 34%; font-size: 10pt;"><strong style="color: #16a085;">توقيع مدير المدرسة</strong><br><br><br>........................</td>
    </tr>
  </table>
</body>
</html>`;

    const blob = new Blob([wordHTML], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName =
      students.length > 1
        ? 'مشكلة_جماعية'
        : students[0]?.name.replace(/\s+/g, '_') || 'تقرير';
    a.download = `تقرير_سلوكي_${fileName}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePrintableHTML = () => {
    const stdNames = students
      .map((s) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:7px 12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:5px;">
          <div><strong>${s.name}</strong> <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:11px; margin-right:6px; font-weight:600;">${s.cls}</span></div>
          <div style="direction:ltr; font-family:monospace; font-size:12px; color:#334155; font-weight:bold;">${formatPhoneDisplay(s.phone)}</div>
        </div>
      `)
      .join('');

    let proceduresRows = '';
    procedures.forEach((proc, index) => {
      const isChecked = checkedProcs[index];
      const checkSymbol = isChecked ? '&#9745;' : '&#9744;';
      const checkColor = isChecked ? '#16a085' : '#94a3b8';
      const rowBg = isChecked ? '#f0fdf4' : (index % 2 === 0 ? '#ffffff' : '#f8fafc');
      proceduresRows += `
        <tr style="background-color: ${rowBg};">
          <td style="border: 1px solid #cbd5e1; text-align: center; vertical-align: middle; padding: 8px; font-size: 16px; color: ${checkColor}; font-weight: bold;">${checkSymbol}</td>
          <td style="border: 1px solid #cbd5e1; text-align: center; padding: 8px; font-weight: bold; color: #16a085;">الإجراء ${index + 1}</td>
          <td style="border: 1px solid #cbd5e1; padding: 8px 12px; color: #1e293b; line-height: 1.6;">${proc}</td>
        </tr>
      `;
    });

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>تقرير دراسة حالة ومخالفة سلوكية - مدرسة الجشة المتوسطة</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Tajawal', Tahoma, Arial, sans-serif;
      direction: rtl;
      background: #ffffff;
      color: #1e293b;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page {
      size: A4 portrait;
      margin: 12mm 12mm 15mm 12mm;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      tr { page-break-inside: avoid; }
    }
    .top-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      text-align: center;
    }
    .btn-print {
      background: #16a085;
      color: white;
      border: none;
      padding: 10px 24px;
      font-weight: 700;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .btn-close {
      background: #64748b;
      color: white;
      border: none;
      padding: 10px 18px;
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #16a085;
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .school-info {
      font-size: 12px;
      font-weight: bold;
      line-height: 1.6;
      color: #334155;
      text-align: right;
    }
    .title-box {
      text-align: center;
    }
    .title-box h1 {
      font-size: 18px;
      color: #16a085;
      font-weight: 800;
      margin-bottom: 4px;
    }
    .title-box span {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .date-box {
      font-size: 11px;
      color: #64748b;
      font-weight: bold;
      text-align: left;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      font-size: 12px;
    }
    th {
      background-color: #f1f5f9;
      color: #16a085;
      font-weight: 700;
    }
    .section-title {
      font-size: 12px;
      font-weight: bold;
      color: #16a085;
      margin: 16px 0 8px 0;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 4px;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      text-align: center;
      margin-top: 35px;
      padding-top: 10px;
    }
    .sig-block {
      width: 30%;
      font-size: 12px;
      font-weight: bold;
      color: #334155;
    }
    .sig-title {
      color: #16a085;
      margin-bottom: 25px;
    }
    .sig-dots {
      color: #94a3b8;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="top-actions no-print">
    <button class="btn-print" onclick="window.print()">🖨️ طباعة التقرير الآن (Ctrl + P)</button>
    <button class="btn-close" onclick="window.close()">✖ إغلاق النافذة</button>
  </div>

  <div class="header-box">
    <div class="school-info">
      المملكة العربية السعودية<br>
      وزارة التعليم<br>
      إدارة التعليم بمحافظة الأحساء<br>
      مدرسة الجشة المتوسطة
    </div>
    <div class="title-box">
      <h1>تقرير معالجة مشكلة سلوكية</h1>
      <span>وفق قواعد السلوك والمواظبة المعتمدة</span>
    </div>
    <div class="date-box">
      التاريخ: ${todayStr}
    </div>
  </div>

  <table>
    <tbody>
      <tr>
        <th style="width: 25%; text-align: right;">بيانات الطلاب وأولياء الأمور</th>
        <td>${stdNames}</td>
      </tr>
      <tr>
        <th style="text-align: right;">الصف الدراسي</th>
        <td><strong>${distinctClasses}</strong></td>
      </tr>
      <tr>
        <th style="text-align: right;">وصف الموقف (المشكلة السلوكية)</th>
        <td style="white-space: pre-line; line-height: 1.6;">${problem}</td>
      </tr>
      <tr>
        <th style="background-color: #fee2e2; color: #991b1b; text-align: right;">درجة المخالفة</th>
        <td style="background-color: #fef2f2; color: #b91c1c; font-weight: 800; font-size: 13px;">${degree}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">
    الإجراءات التربوية والعلاجية المحددة للجميع:
  </div>

  <table>
    <thead>
      <tr style="background-color: #e2e8f0; color: #16a085;">
        <th style="width: 50px; text-align: center;">المنفذ</th>
        <th style="width: 90px; text-align: center;">الإجراء</th>
        <th style="text-align: right;">وصف الإجراء التفصيلي</th>
      </tr>
    </thead>
    <tbody>
      ${proceduresRows}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-block">
      <div class="sig-title">توقيع الطلاب المعنيين</div>
      <div class="sig-dots">...................................</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">توقيع وكيل المدرسة</div>
      <div class="sig-dots">...................................</div>
    </div>
    <div class="sig-block">
      <div class="sig-title">توقيع مدير المدرسة</div>
      <div class="sig-dots">...................................</div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;
  };

  const handlePrint = () => {
    const printableHTML = generatePrintableHTML();

    // Strategy 1: Open clean print tab/window (bypasses iframe sandbox, allows native print dialog)
    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank');
    } catch (err) {
      console.warn('window.open blocked:', err);
    }

    if (printWindow) {
      try {
        printWindow.document.open();
        printWindow.document.write(printableHTML);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          try {
            printWindow?.print();
          } catch {
            // inside printWindow the script will also handle it
          }
        }, 400);
        return;
      } catch (err) {
        console.warn('Failed writing to print window:', err);
      }
    }

    // Strategy 2: Hidden iframe on current page
    try {
      let iframe = document.getElementById('report-print-frame') as HTMLIFrameElement | null;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'report-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(printableHTML);
        doc.close();

        setTimeout(() => {
          try {
            iframe?.contentWindow?.focus();
            iframe?.contentWindow?.print();
          } catch (iframeErr) {
            console.warn('Iframe print failed:', iframeErr);
            window.print();
          }
        }, 400);
        return;
      }
    } catch (err) {
      console.warn('Iframe strategy failed:', err);
    }

    // Strategy 3: Standard window.print() fallback
    try {
      window.print();
    } catch {
      // Strategy 4: Fallback to PDF export if system print dialog is completely blocked
      handleExportPDF();
      onShowAlert('تم تنزيل ملف التقرير كـ PDF لطباعته مباشرة نظراً لقيود المتصفح على أمر الطباعة.');
    }
  };

  const handleWhatsAppClick = () => {
    const selectedProcs = procedures.filter((_, idx) => checkedProcs[idx]);
    if (selectedProcs.length === 0) {
      onShowAlert('يرجى اختيار إجراء واحد على الأقل.');
      return;
    }
    onOpenWhatsApp(selectedProcs);
  };

  return (
    <div id="report-wrapper" className="mb-8 animate-fadeIn">
      {/* Early Warning Panel */}
      {warnings.length > 0 && (
        <div
          id="early-warning-panel"
          className="bg-red-50/90 border-r-4 border-red-600 text-red-800 p-4 mb-5 rounded-xl shadow-xs no-print"
        >
          <div className="flex items-center gap-2 font-bold text-sm md:text-base mb-1">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>🚨 إنذار مبكر لوجود مشكلات سابقة للطلاب:</span>
          </div>
          <ul
            id="alert-warning-list"
            className="pr-6 list-disc space-y-1 text-xs md:text-sm font-semibold"
          >
            {warnings.map((warn, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: warn }} />
            ))}
          </ul>
        </div>
      )}

      {/* Official Report Card Document */}
      <div
        id="report-container"
        className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-lg text-[#2c3e50] leading-relaxed relative"
      >
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-[#16a085] pb-4 mb-6 gap-3">
          <div className="text-right leading-snug font-bold text-xs md:text-sm text-gray-700">
            المملكة العربية السعودية
            <br />
            وزارة التعليم
            <br />
            إدارة التعليم بمحافظة الأحساء
            <br />
            مدرسة الجشة المتوسطة
          </div>

          <div className="text-center">
            <h3 className="text-base md:text-xl font-black text-[#16a085]">
              تقرير معالجة مشكلة سلوكية
            </h3>
            <span className="text-xs text-gray-500 font-semibold">
              وفق قواعد السلوك والمواظبة المعتمدة
            </span>
          </div>

          <div className="text-left text-xs text-gray-500 font-medium">
            <span>التاريخ: {todayStr}</span>
          </div>
        </div>

        {/* Student & Problem Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300 text-xs md:text-sm">
            <tbody>
              <tr>
                <th className="border border-gray-300 bg-[#f0fbfc] text-[#16a085] p-3 text-right font-bold w-1/4">
                  بيانات الطلاب وأولياء الأمور
                </th>
                <td id="rep-name" className="border border-gray-300 p-3 text-gray-800">
                  <div className="space-y-2">
                    {students.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{s.name}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                            {s.cls}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center gap-1 text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700"
                            dir="ltr"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-bold">{formatPhoneDisplay(s.phone)}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSendSingleWhatsApp(s)}
                            className="bg-[#25d366] hover:bg-[#128c7e] text-white text-xs font-bold py-1 px-3 rounded-lg flex items-center gap-1 shadow-2xs transition-all active:scale-95 no-print cursor-pointer"
                            title="إرسال إشعار فوري لولي الأمر عبر واتساب"
                          >
                            <Send className="w-3 h-3" />
                            <span>إرسال واتساب</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 bg-[#f0fbfc] text-[#16a085] p-3 text-right font-bold">
                  الصف
                </th>
                <td id="rep-class" className="border border-gray-300 p-3 text-gray-800">
                  {distinctClasses}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 bg-[#f0fbfc] text-[#16a085] p-3 text-right font-bold">
                  وصف الموقف (المشكلة)
                </th>
                <td id="rep-problem" className="border border-gray-300 p-3 text-gray-800 whitespace-pre-line leading-relaxed">
                  {problem}
                </td>
              </tr>
              <tr>
                <th className="border border-gray-300 bg-[#ffebee] text-red-800 p-3 text-right font-bold">
                  درجة المخالفة
                </th>
                <td id="rep-degree" className="border border-gray-300 p-3 font-extrabold text-red-700 bg-red-50/40">
                  {degree}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Procedures Table */}
        <h4 className="text-xs md:text-sm font-bold text-[#16a085] border-b border-dashed border-gray-300 pb-2 mb-3">
          الإجراءات التربوية والعلاجية المحددة للجميع (ضع علامة صح أمام المنفذ):
        </h4>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse border border-gray-300 text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-100 text-[#16a085]">
                <th className="border border-gray-300 p-2.5 text-center w-14">
                  المنفذ
                </th>
                <th className="border border-gray-300 p-2.5 text-center w-24">
                  الإجراء
                </th>
                <th className="border border-gray-300 p-2.5 text-right">
                  وصف الإجراء التفصيلي
                </th>
              </tr>
            </thead>
            <tbody id="rep-procedures-body">
              {procedures.map((proc, index) => {
                const isChecked = checkedProcs[index];
                return (
                  <tr
                    key={index}
                    className={`transition-colors ${
                      isChecked
                        ? 'bg-emerald-50/70 font-semibold border-emerald-300 text-emerald-950'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <td className="border border-gray-300 p-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProc(index)}
                        className="w-4 h-4 cursor-pointer accent-[#16a085]"
                      />
                    </td>
                    <td className="border border-gray-300 p-2.5 text-center font-bold text-[#16a085]">
                      الإجراء {index + 1}
                    </td>
                    <td className="border border-gray-300 p-2.5 leading-relaxed">
                      {proc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-4 text-center mt-10 pt-4 text-xs md:text-sm font-bold text-gray-700">
          <div>
            <div className="text-[#16a085] mb-6">توقيع الطلاب المعنيين</div>
            <div className="text-gray-400 font-mono">......................</div>
          </div>
          <div>
            <div className="text-[#16a085] mb-6">توقيع وكيل المدرسة</div>
            <div className="text-gray-400 font-mono">......................</div>
          </div>
          <div>
            <div className="text-[#16a085] mb-6">توقيع مدير المدرسة</div>
            <div className="text-gray-400 font-mono">......................</div>
          </div>
        </div>
      </div>

      {/* Buttons Container */}
      <div className="flex flex-wrap justify-center gap-3 mt-6 no-print">
        {!isSaved && (
          <button
            id="btnSaveArchive"
            onClick={onSaveToArchive}
            className="flex-1 min-w-[200px] bg-[#27ae60] hover:bg-[#219653] text-white py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <FileCheck className="w-5 h-5" />
            <span>✅ الحفظ والأرشفة في سجل الطلاب</span>
          </button>
        )}

        <button
          id="btnExportPDF"
          onClick={handleExportPDF}
          className="flex-1 min-w-[130px] bg-[#e74c3c] hover:bg-[#c0392b] text-white py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <FileText className="w-5 h-5" />
          <span>تصدير PDF</span>
        </button>

        <button
          id="btnExportWord"
          onClick={handleExportWord}
          className="flex-1 min-w-[130px] bg-[#2980b9] hover:bg-[#2471a3] text-white py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <FileCode className="w-5 h-5" />
          <span>تصدير Word</span>
        </button>

        <button
          id="btnWhatsApp"
          onClick={handleWhatsAppClick}
          className="flex-1 min-w-[200px] bg-[#25d366] hover:bg-[#128c7e] text-white py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Send className="w-5 h-5" />
          <span>الرسالة الرسمية للواتساب</span>
        </button>

        <button
          id="btnPrintReport"
          onClick={handlePrint}
          className="bg-gray-700 hover:bg-gray-800 text-white py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          title="طباعة التقرير مباشرة"
        >
          <Printer className="w-5 h-5" />
          <span>طباعة</span>
        </button>
      </div>
    </div>
  );
};
