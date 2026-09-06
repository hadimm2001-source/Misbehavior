import React, { useState } from 'react';
import {
  Archive,
  Search,
  Filter,
  ListOrdered,
  Trash2,
  Eye,
  FileSpreadsheet,
  Phone,
  Send
} from 'lucide-react';
import { ArchiveRecord, Student } from '../types.ts';
import { normalizeClass } from '../data/students.ts';
import {
  formatPhoneDisplay,
  createWhatsAppOfficialMessage,
  openWhatsAppChat
} from '../utils/phoneUtils.ts';

interface ArchiveTableProps {
  archive: ArchiveRecord[];
  classMap: Map<string, string>;
  allStudents?: Student[];
  onViewProcedures: (record: ArchiveRecord) => void;
  onDeleteRecord?: (id: string) => void;
}

export const ArchiveTable: React.FC<ArchiveTableProps> = ({
  archive = [],
  classMap,
  allStudents = [],
  onViewProcedures,
  onDeleteRecord
}) => {
  const [filterName, setFilterName] = useState('');
  const [filterClass, setFilterClass] = useState('الكل');
  const [filterDegree, setFilterDegree] = useState('الكل');
  const [filterCount, setFilterCount] = useState('الكل');

  const safeArchive = archive || [];

  const getRecordPhone = (record: ArchiveRecord): string => {
    if (record.phone) return record.phone;
    const std = allStudents.find((s) => s.name === record.name);
    return std?.phone || '';
  };

  const handleSendWhatsAppForRecord = (record: ArchiveRecord) => {
    const phone = getRecordPhone(record);
    const message = createWhatsAppOfficialMessage({
      studentName: record.name,
      className: record.cls,
      problemDesc: record.problem,
      degree: record.degree,
      procedures: record.procedures,
      dateStr: record.date
    });
    openWhatsAppChat(phone, message);
  };

  const filteredRecords = safeArchive.filter((record) => {
    const matchName = record.name
      .toLowerCase()
      .includes(filterName.trim().toLowerCase());
    const matchClass =
      filterClass === 'الكل' || normalizeClass(record.cls) === filterClass;
    const matchDegree =
      filterDegree === 'الكل' ||
      (record.degree && record.degree.includes(filterDegree));
    const matchCount =
      filterCount === 'الكل'
        ? true
        : filterCount === '1'
        ? record.count === 1
        : record.count >= 2;

    return matchName && matchClass && matchDegree && matchCount;
  });

  const sortedClasses = Array.from(classMap.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  const exportArchiveToCSV = () => {
    if (filteredRecords.length === 0) return;
    const headers = ['التاريخ', 'اسم الطالب', 'الصف', 'جوال ولي الأمر', 'المشكلة السلوكية', 'درجة المخالفة', 'عدد المرات'];
    const rows = filteredRecords.map((r) => [
      `"${r.date}"`,
      `"${r.name}"`,
      `"${r.cls}"`,
      `"${formatPhoneDisplay(getRecordPhone(r))}"`,
      `"${r.problem.replace(/\n/g, ' ')}"`,
      `"${r.degree}"`,
      `"${r.count}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `أرشيف_المشكلات_السلوكية_${new Date().toLocaleDateString('ar-SA')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="archive-section"
      className="bg-white rounded-2xl p-5 md:p-7 shadow-sm border border-emerald-100/80 border-t-4 border-t-[#16a085] no-print"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h2 className="text-[#16a085] text-base md:text-lg font-bold flex items-center gap-2">
          <Archive className="w-5 h-5 text-[#16a085]" />
          <span>أرشيف معالجة المشكلات السلوكية للطلاب</span>
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-[#16a085] border border-emerald-200 px-3 py-1 rounded-full font-bold">
            السجلات: {filteredRecords.length} من {archive.length}
          </span>
          {filteredRecords.length > 0 && (
            <button
              onClick={exportArchiveToCSV}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="تصدير السجلات المفلترة إلى Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصدير CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Filter Name */}
        <div className="relative">
          <input
            type="text"
            id="filterArchiveName"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="ابحث باسم الطالب..."
            className="w-full p-2.5 pr-8 border border-[#b2ebf2] rounded-xl text-xs md:text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-1 focus:ring-emerald-500/20"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Class */}
        <div>
          <select
            id="filterArchiveClass"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full p-2.5 border border-[#b2ebf2] rounded-xl text-xs md:text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-1 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="الكل">جميع الصفوف</option>
            {sortedClasses.map(([normKey, displayValue]) => (
              <option key={normKey} value={normKey}>
                {displayValue}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Degree */}
        <div>
          <select
            id="filterArchiveDegree"
            value={filterDegree}
            onChange={(e) => setFilterDegree(e.target.value)}
            className="w-full p-2.5 border border-[#b2ebf2] rounded-xl text-xs md:text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-1 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="الكل">جميع الدرجات</option>
            <option value="الأولى">الدرجة الأولى</option>
            <option value="الثانية">الدرجة الثانية</option>
            <option value="الثالثة">الدرجة الثالثة</option>
            <option value="الرابعة">الدرجة الرابعة</option>
            <option value="الخامسة">الدرجة الخامسة</option>
            <option value="السادسة">الدرجة السادسة</option>
          </select>
        </div>

        {/* Filter Count */}
        <div>
          <select
            id="filterArchiveCount"
            value={filterCount}
            onChange={(e) => setFilterCount(e.target.value)}
            className="w-full p-2.5 border border-[#b2ebf2] rounded-xl text-xs md:text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-1 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="الكل">الكل (مرات التكرار)</option>
            <option value="1">مرة واحدة فقط</option>
            <option value="2">تكرار المخالفة (مرتان فأكثر)</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-xs md:text-sm text-center min-w-[760px]" id="archiveTable">
          <thead>
            <tr className="bg-[#16a085] text-white font-bold">
              <th className="p-3 w-24">التاريخ</th>
              <th className="p-3 text-right">اسم الطالب</th>
              <th className="p-3">الصف</th>
              <th className="p-3">جوال ولي الأمر</th>
              <th className="p-3 text-right">المشكلة السلوكية</th>
              <th className="p-3 w-24">الدرجة</th>
              <th className="p-3 w-14">المرات</th>
              <th className="p-3 w-36">الإجراءات والواتساب</th>
            </tr>
          </thead>
          <tbody id="archiveBody" className="divide-y divide-gray-200 text-gray-700">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => {
                const phone = getRecordPhone(record);
                return (
                  <tr
                    key={record.id || index}
                    className={`hover:bg-emerald-50/40 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="p-3 font-mono text-[11px] text-gray-500">
                      {record.date}
                    </td>
                    <td className="p-3 font-bold text-gray-800 text-right">
                      {record.name}
                    </td>
                    <td className="p-3 font-medium text-gray-600">
                      {record.cls}
                    </td>
                    <td className="p-3 font-mono text-xs" dir="ltr">
                      <div className="flex items-center justify-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span className="font-bold">{formatPhoneDisplay(phone)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right text-gray-700 leading-snug whitespace-pre-line max-w-xs">
                      {record.problem}
                    </td>
                    <td className="p-3">
                      <span className="inline-block bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-full text-[11px] border border-red-200 whitespace-nowrap">
                        {record.degree}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-black text-xs px-2 py-0.5 rounded-full ${
                          record.count >= 2
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {record.count}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendWhatsAppForRecord(record)}
                          className="bg-[#25d366] hover:bg-[#128c7e] text-white px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                          title="إرسال إشعار فوري لولي الأمر عبر واتساب"
                        >
                          <Send className="w-3 h-3" />
                          <span>واتساب</span>
                        </button>

                        <button
                          onClick={() => onViewProcedures(record)}
                          className="bg-[#e0f7fa] hover:bg-[#b2ebf2] text-[#16a085] border border-[#b2ebf2] px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="عرض تفاصيل الإجراءات المتخذة"
                        >
                          <Eye className="w-3 h-3" />
                          <span>الخطوات</span>
                        </button>

                        {onDeleteRecord && (
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                            title="حذف هذا السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400 text-sm">
                  لا توجد سجلات مطابقة لمعايير البحث في الأرشيف.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
