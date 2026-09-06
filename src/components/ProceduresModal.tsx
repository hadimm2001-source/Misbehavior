import React from 'react';
import { X, CheckSquare } from 'lucide-react';
import { ArchiveRecord } from '../types.ts';

interface ProceduresModalProps {
  isOpen: boolean;
  record: ArchiveRecord | null;
  onClose: () => void;
}

export const ProceduresModal: React.FC<ProceduresModalProps> = ({
  isOpen,
  record,
  onClose
}) => {
  if (!isOpen || !record) return null;

  return (
    <div
      id="procsModal"
      className="fixed inset-0 bg-black/60 z-50 p-4 flex items-center justify-center backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-xl w-full rounded-2xl p-6 shadow-2xl border border-emerald-100 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-emerald-200 pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#16a085] font-bold text-lg">
            <CheckSquare className="w-5 h-5" />
            <h3>الإجراءات المعتمدة للمشكلة السلوكية</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-xl mb-4 border border-emerald-100 text-xs md:text-sm text-gray-700 leading-relaxed">
          <p className="font-bold text-[#16a085] mb-1">
            الطالب: {record.name} - ({record.cls})
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">المشكلة:</span> {record.problem}
          </p>
        </div>

        <ul className="space-y-3 pr-2 list-none">
          {record.procedures && record.procedures.length > 0 ? (
            record.procedures.map((proc, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm text-gray-800 bg-gray-50/80 p-3 rounded-lg border border-gray-100"
              >
                <span className="bg-[#16a085] text-white text-xs font-bold px-2 py-0.5 rounded-md shrink-0">
                  الإجراء {index + 1}
                </span>
                <span className="leading-relaxed">{proc}</span>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500 py-4">
              لا توجد إجراءات مسجلة لهذه المشكلة.
            </li>
          )}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#16a085] hover:bg-[#138d75] text-white py-2.5 px-4 rounded-xl font-bold transition-all shadow-md active:scale-98"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};
