import React, { useState, useEffect } from 'react';
import { User, Lightbulb, Calendar, BookOpen, UserPlus } from 'lucide-react';

interface HeaderProps {
  isSynced: boolean;
  onOpenDirectory?: () => void;
  onOpenAddStudent?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSynced,
  onOpenDirectory,
  onOpenAddStudent
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const today = new Date();
    try {
      const formatted = today.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setCurrentDateStr(formatted);
    } catch {
      setCurrentDateStr(today.toLocaleDateString('ar-EG'));
    }
  }, []);

  return (
    <header className="bg-gradient-to-l from-[#27ae60] to-[#2980b9] text-white p-5 md:p-6 rounded-2xl mb-6 shadow-lg shadow-emerald-950/10 no-print">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* School & Counselor Info */}
        <div className="text-center md:text-right w-full md:w-auto">
          <h1 className="text-xl md:text-2xl font-black mb-1.5 tracking-tight">
            مدرسة الجشة المتوسطة
          </h1>
          <div className="text-xs md:text-sm text-emerald-100 flex items-center justify-center md:justify-start gap-1.5 font-medium">
            <User className="w-4 h-4 opacity-90" />
            <span>الموجه الطلابي: عبدالهادي بن محمد المحسن</span>
          </div>
        </div>

        {/* Center Title & Sync Bulb */}
        <div className="flex items-center justify-center gap-3 text-lg md:text-2xl font-extrabold text-white text-center drop-shadow-sm">
          <span>نظام معالجة المشكلات السلوكية</span>
          <div
            className={`inline-flex items-center transition-all duration-300 cursor-help ${
              isSynced
                ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                : 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]'
            }`}
            title={isSynced ? 'مزامنة وحفظ فوري نشط' : 'حفظ محلي آمن في المتصفح'}
          >
            <Lightbulb className="w-7 h-7 fill-current animate-pulse" />
          </div>
        </div>

        {/* Actions & Date Container */}
        <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-2">
          {onOpenDirectory && (
            <button
              onClick={onOpenDirectory}
              type="button"
              className="flex items-center gap-1.5 font-bold text-xs bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all shadow-xs cursor-pointer active:scale-95"
              title="عرض وبحث دليل أرقام جوالات الطلاب وأولياء الأمور"
            >
              <BookOpen className="w-4 h-4 text-emerald-200" />
              <span>دليل أرقام الطلاب</span>
            </button>
          )}

          {onOpenAddStudent && (
            <button
              onClick={onOpenAddStudent}
              type="button"
              className="flex items-center gap-1.5 font-bold text-xs bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-full backdrop-blur-md border border-white/20 transition-all shadow-xs cursor-pointer active:scale-95"
              title="إضافة طالب جديد للقائمة"
            >
              <UserPlus className="w-4 h-4 text-emerald-200" />
              <span>إضافة طالب</span>
            </button>
          )}

          <div className="flex items-center gap-2 font-bold text-xs md:text-sm bg-white/15 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
            <Calendar className="w-4 h-4 text-emerald-200" />
            <span id="currentDateDisplay">{currentDateStr || 'جارِ التحميل...'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
