import React from 'react';
import { X, Send, Phone, CheckCheck } from 'lucide-react';
import { SelectedStudent, Student } from '../types.ts';
import {
  cleanPhoneForWhatsApp,
  formatPhoneDisplay,
  createWhatsAppOfficialMessage,
  openWhatsAppChat
} from '../utils/phoneUtils.ts';

interface WhatsAppModalProps {
  isOpen: boolean;
  students: SelectedStudent[];
  allStudentsData: Student[];
  degree: string;
  problemDesc: string;
  selectedProcedures: string[];
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  students,
  allStudentsData,
  degree,
  problemDesc,
  selectedProcedures,
  onClose
}) => {
  if (!isOpen) return null;

  const handleSend = (student: SelectedStudent) => {
    const stdData = allStudentsData.find((s) => s.name === student.name);
    const phoneStr = student.phone || (stdData && stdData.phone) || '';

    const message = createWhatsAppOfficialMessage({
      studentName: student.name,
      className: student.cls,
      problemDesc,
      degree,
      procedures: selectedProcedures
    });

    openWhatsAppChat(phoneStr, message);
  };

  return (
    <div
      id="groupWaModal"
      className="fixed inset-0 bg-black/60 z-50 p-4 flex items-center justify-center backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-emerald-100 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[#16a085]/30 pb-3 mb-3">
          <h3 className="text-lg font-bold text-[#16a085] flex items-center gap-2">
            <Send className="w-5 h-5 text-[#25d366]" />
            <span>إرسال رسائل واتساب رسمية لأولياء الأمور</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 mb-4 text-xs text-emerald-900 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>أرقام جوالات أولياء الأمور محملة ومعتمدة آلياً</span>
          </p>
          <p className="text-gray-600">
            تمت صياغة الرسالة الرسمية تلقائياً وفق لائحة السلوك والمواظبة بمدرسة الجشة المتوسطة. اضغط على الزر الأخضر بجانب اسم كل طالب لإرسال الرسالة لولي أمره مباشرة عبر واتساب:
          </p>
        </div>

        <div
          id="groupWaList"
          className="bg-gray-50 border border-gray-200 rounded-xl divide-y divide-gray-200 max-h-72 overflow-y-auto mb-5"
        >
          {students.map((student, idx) => {
            const stdData = allStudentsData.find((s) => s.name === student.name);
            const phoneStr = student.phone || (stdData && stdData.phone) || '';

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 hover:bg-emerald-50/50 transition-colors"
              >
                <div>
                  <div className="font-bold text-gray-800 text-sm">
                    {student.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-medium">({student.cls})</span>
                    <span className="font-mono text-gray-600" dir="ltr">
                      <Phone className="w-3 h-3 text-emerald-600 inline mr-1" />
                      {formatPhoneDisplay(phoneStr)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleSend(student)}
                  className="bg-[#25d366] hover:bg-[#128c7e] text-white text-xs font-bold py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال واتساب</span>
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
