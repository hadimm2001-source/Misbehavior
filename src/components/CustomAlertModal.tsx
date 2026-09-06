import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface CustomAlertModalProps {
  isOpen: boolean;
  message: string;
  type?: 'info' | 'success' | 'warning';
  onClose: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  isOpen,
  message,
  type = 'info',
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="customAlertModal"
      className="fixed inset-0 bg-black/60 z-50 p-4 flex items-center justify-center backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-md w-full rounded-2xl p-6 text-center shadow-2xl border border-emerald-100 transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          {type === 'success' ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          ) : (
            <AlertCircle className="w-12 h-12 text-[#16a085]" />
          )}
        </div>

        <div
          id="customAlertText"
          className="text-base text-[#2c3e50] leading-relaxed font-medium mb-6 whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: message }}
        />

        <button
          onClick={onClose}
          className="w-full bg-[#16a085] hover:bg-[#138d75] text-white py-3 px-6 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-98"
        >
          حسناً
        </button>
      </div>
    </div>
  );
};
