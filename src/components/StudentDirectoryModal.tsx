import React, { useState } from 'react';
import { BookOpen, Search, Phone, Send, Copy, Check, X, Users, Filter } from 'lucide-react';
import { Student } from '../types.ts';
import { formatPhoneDisplay, openWhatsAppChat } from '../utils/phoneUtils.ts';
import { normalizeClass } from '../data/students.ts';

interface StudentDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classMap: Map<string, string>;
  onSelectStudentForReport?: (student: Student) => void;
}

export const StudentDirectoryModal: React.FC<StudentDirectoryModalProps> = ({
  isOpen,
  onClose,
  students,
  classMap,
  onSelectStudentForReport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('الكل');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  if (!isOpen) return null;

  const sortedClasses = Array.from(classMap.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      (s.phone && s.phone.includes(searchQuery.trim()));
    const matchesClass =
      selectedClass === 'الكل' ||
      s.normalizedClass === selectedClass ||
      normalizeClass(s.class) === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleCopyPhone = (phone: string, studentName: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(studentName);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleQuickWhatsApp = (student: Student) => {
    const message = `السلام عليكم ورحمة الله وبركاته
المكرم ولي أمر الطالب / ${student.name} المحترم (${student.class})
تحية طيبة من مدرسة الجشة المتوسطة،
نود التواصل معكم بشأن ابنكم.
شاكرين تعاونكم معنا.`;
    openWhatsAppChat(student.phone, message);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 p-3 sm:p-5 flex items-center justify-center backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-3xl w-full rounded-2xl p-5 md:p-6 shadow-2xl border border-emerald-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-emerald-100 pb-3 mb-4 shrink-0">
          <div>
            <h3 className="text-lg md:text-xl font-black text-[#16a085] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span>دليل هواتف أولياء أمور الطلاب</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              قاعدة البيانات المعتمدة لطلاب مدرسة الجشة المتوسطة مع أرقام جوالات أولياء الأمور
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats and Search Controls */}
        <div className="space-y-3 mb-4 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>إجمالي الطلاب المسجلين: {students.length} طالباً مع أرقام الجوالات</span>
            </span>
            <span className="text-gray-500 font-medium">
              النتائج المعروضة: {filteredStudents.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الطالب أو رقم الجوال..."
                className="w-full p-2.5 pr-9 border border-[#b2ebf2] rounded-xl text-xs md:text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Class Filter */}
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2.5 border border-[#b2ebf2] rounded-xl text-xs md:text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white cursor-pointer"
              >
                <option value="الكل">جميع الفصول الدراسية ({students.length} طالباً)</option>
                {sortedClasses.map(([normKey, displayValue]) => {
                  const count = students.filter(
                    (s) => s.normalizedClass === normKey || normalizeClass(s.class) === normKey
                  ).length;
                  return (
                    <option key={normKey} value={normKey}>
                      {displayValue} ({count} طالباً)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50/40">
          <table className="w-full border-collapse text-xs md:text-sm text-right">
            <thead className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold z-10 shadow-xs">
              <tr>
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">اسم الطالب</th>
                <th className="p-3">الفصل</th>
                <th className="p-3">رقم جوال ولي الأمر</th>
                <th className="p-3 text-center w-36">إجراء التواصل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => (
                  <tr
                    key={student.name + idx}
                    className="hover:bg-emerald-50/60 transition-colors"
                  >
                    <td className="p-2.5 text-center text-gray-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 font-bold text-gray-800">
                      {student.name}
                    </td>
                    <td className="p-2.5 text-gray-600 font-medium">
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-xs">
                        {student.class}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-xs" dir="ltr">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-bold text-emerald-800 tracking-wide">
                          {formatPhoneDisplay(student.phone)}
                        </span>
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleQuickWhatsApp(student)}
                          className="bg-[#25d366] hover:bg-[#128c7e] text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                          title="فتح محادثة واتساب فورية"
                        >
                          <Send className="w-3 h-3" />
                          <span>واتساب</span>
                        </button>
                        <button
                          onClick={() => handleCopyPhone(student.phone, student.name)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="نسخ الرقم للحافظة"
                        >
                          {copiedPhone === student.name ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-xs">
                    لا توجد نتائج مطابقة لبحثك
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500">
            جميع الأرقام مربوطة برمز المملكة الدولي (966+) وجاهزة للإرسال
          </span>
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
