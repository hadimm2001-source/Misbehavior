import React, { useState, useEffect } from 'react';
import { User, Lightbulb, Calendar } from 'lucide-react';

interface HeaderProps {
  isSynced: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isSynced }) => {
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
    <header className="bg-gradient-to-l from-[#27ae60] to-[#2980b9] text-white px-5 py-4 md:px-6 md:py-5 rounded-2xl mb-6 shadow-lg shadow-emerald-950/10 no-print">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
        {/* School & Counselor Info */}
        <div className="text-center md:text-right shrink-0">
          <h1 className="text-sm md:text-base lg:text-lg font-bold tracking-tight whitespace-nowrap leading-tight text-white">
            مدرسة الجشة المتوسطة
          </h1>
          <div className="text-[11px] md:text-xs text-emerald-100 flex items-center justify-center md:justify-start gap-1 font-medium whitespace-nowrap mt-0.5">
            <User className="w-3.5 h-3.5 opacity-90 shrink-0" />
            <span className="whitespace-nowrap">الموجه الطلابي: عبدالهادي بن محمد المحسن</span>
          </div>
        </div>

        {/* Center Title & Sync Bulb */}
        <div className="flex items-center justify-center gap-2.5 text-base md:text-xl lg:text-2xl font-extrabold text-white text-center drop-shadow-sm whitespace-nowrap">
          <span>نظام معالجة المشكلات السلوكية</span>
          <div
            className={`inline-flex items-center transition-all duration-300 cursor-help ${
              isSynced
                ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                : 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.7)]'
            }`}
            title={isSynced ? 'مزامنة وحفظ فوري نشط' : 'حفظ محلي آمن في المتصفح'}
          >
            <Lightbulb className="w-6 h-6 md:w-7 md:h-7 fill-current animate-pulse shrink-0" />
          </div>
        </div>

        {/* Date Container */}
        <div className="flex items-center justify-center md:justify-end shrink-0">
          <div className="flex items-center gap-2 font-bold text-xs md:text-sm bg-white/15 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-inner whitespace-nowrap">
            <Calendar className="w-4 h-4 text-emerald-200 shrink-0" />
            <span id="currentDateDisplay" className="whitespace-nowrap">
              {currentDateStr || 'جارِ التحميل...'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
