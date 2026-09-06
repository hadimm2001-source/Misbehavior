import React, { useState } from 'react';
import { UserPlus, X, Check, Phone, GraduationCap, Trash2, Users } from 'lucide-react';
import { Student } from '../types.ts';
import { predefinedClasses, normalizeClass, getFormalClassName } from '../data/students.ts';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (newStudent: Student, addToSelected: boolean) => void;
  customStudents: Student[];
  onDeleteCustomStudent: (studentName: string) => void;
  classMap: Map<string, string>;
  onShowAlert: (msg: string) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onSaveStudent,
  customStudents,
  onDeleteCustomStudent,
  classMap,
  onShowAlert
}) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [isCustomClassMode, setIsCustomClassMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [addToCurrentProblem, setAddToCurrentProblem] = useState(true);

  if (!isOpen) return null;

  // Extract unique classes from classMap & predefinedClasses
  const allClasses = [...predefinedClasses, ...(Array.from(classMap.values()) as string[])]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a: string, b: string) => a.localeCompare(b));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      onShowAlert('يرجى كتابة اسم الطالب.');
      return;
    }

    const finalClassName = isCustomClassMode ? customClass.trim() : selectedClass.trim();
    if (!finalClassName) {
      onShowAlert('يرجى اختيار الصف أو كتابته.');
      return;
    }

    const formalClass = getFormalClassName(finalClassName);
    const norm = normalizeClass(formalClass);

    // Format phone
    let formattedPhone = phone.trim();
    if (formattedPhone) {
      formattedPhone = formattedPhone
        .replace(/[٠-٩]/g, (d) => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
        .replace(/\D/g, '');
      if (formattedPhone.startsWith('05')) {
        formattedPhone = '966' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('5')) {
        formattedPhone = '966' + formattedPhone;
      }
    }

    const newStudent: Student = {
      name: trimmedName,
      class: formalClass,
      normalizedClass: norm,
      phone: formattedPhone
    };

    onSaveStudent(newStudent, addToCurrentProblem);
    
    // Reset form
    setName('');
    setPhone('');
    if (!isCustomClassMode) {
      // keep selectedClass for convenience
    }
  };

  return (
    <div
      id="addStudentModal"
      className="fixed inset-0 bg-black/60 z-50 p-4 flex items-center justify-center backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-[#16a085]/30 pb-3 mb-4">
          <h3 className="text-lg font-bold text-[#16a085] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#16a085]" />
            <span>إضافة طالب جديد يدوياً</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          يمكنك من هنا تسجيل طالب جديد يدوياً مع تحديد صفه ورقم جوال ولي أمره ليتم إدراجه فوراً في قوائم المدرسة وسجلات السلوك.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-[#27ae60] text-xs md:text-sm font-bold mb-1">
              اسم الطالب الثلاثي أو الرباعي: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="newStudentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: خالد محمد بن عبدالعزيز السعيد"
              className="w-full p-3 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
              required
            />
          </div>

          {/* Class selection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[#27ae60] text-xs md:text-sm font-bold">
                الصف / الفصل: <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomClassMode(!isCustomClassMode)}
                className="text-[11px] text-[#16a085] hover:underline font-semibold cursor-pointer"
              >
                {isCustomClassMode ? '← اختيار من القائمة المعتمدة' : '+ كتابة فصل مخصص'}
              </button>
            </div>

            {isCustomClassMode ? (
              <input
                type="text"
                id="newStudentCustomClass"
                value={customClass}
                onChange={(e) => setCustomClass(e.target.value)}
                placeholder="اكتب اسم الصف (مثال: الثالث المتوسط د)"
                className="w-full p-3 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
                required
              />
            ) : (
              <select
                id="newStudentClassSelect"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-3 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
                required
              >
                <option value="" disabled>
                  -- اختر الصف --
                </option>
                {allClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[#27ae60] text-xs md:text-sm font-bold mb-1">
              رقم جوال ولي الأمر (اختياري للرسائل الفورية):
            </label>
            <div className="relative">
              <input
                type="tel"
                id="newStudentPhone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx أو 9665xxxxxxxx"
                dir="ltr"
                className="w-full p-3 pl-10 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all text-left font-mono"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Checkbox add immediately */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="addToCurrentSelection"
              checked={addToCurrentProblem}
              onChange={(e) => setAddToCurrentProblem(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#16a085]"
            />
            <label
              htmlFor="addToCurrentSelection"
              className="text-xs text-gray-700 font-bold cursor-pointer"
            >
              إضافة الطالب مباشرة إلى قائمة الطلاب المحددين للمشكلة الحالية
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-[#16a085] hover:bg-[#138d75] text-white py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>حفظ وإدراج الطالب في النظام</span>
          </button>
        </form>

        {/* Custom Students List Section */}
        {customStudents.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>الطلاب المضافون يدوياً ({customStudents.length}):</span>
              </h4>
            </div>

            <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200 bg-gray-50/50">
              {customStudents.map((std) => (
                <div
                  key={std.name}
                  className="flex items-center justify-between p-2.5 hover:bg-emerald-50/60 transition-colors text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-800">{std.name}</span>
                    <span className="text-gray-500 mr-2">({std.class})</span>
                    {std.phone && (
                      <span className="text-gray-400 mr-2 font-mono" dir="ltr">
                        {std.phone}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomStudent(std.name)}
                    className="text-red-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                    title="حذف الطالب المضاف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
