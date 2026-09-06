import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Plus, Search, X, Check, UserPlus, Phone } from 'lucide-react';
import { SelectedStudent, Student, ViolationDegreeType } from '../types.ts';
import { violationsDatabase } from '../data/violations.ts';
import { formatPhoneDisplay } from '../utils/phoneUtils.ts';

interface BehaviorFormProps {
  studentsData: Student[];
  classMap: Map<string, string>;
  selectedStudents: SelectedStudent[];
  onAddStudent: (name: string, cls: string, phone?: string) => void;
  onRemoveStudent: (name: string) => void;
  onGenerateReport: (
    degree: ViolationDegreeType,
    problem: string,
    details: string
  ) => void;
  onShowAlert: (message: string) => void;
  onOpenAddStudent: () => void;
}

export const BehaviorForm: React.FC<BehaviorFormProps> = ({
  studentsData = [],
  classMap,
  selectedStudents = [],
  onAddStudent,
  onRemoveStudent,
  onGenerateReport,
  onShowAlert,
  onOpenAddStudent
}) => {
  const [selectedClassNorm, setSelectedClassNorm] = useState<string>('');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    Array<{ degree: ViolationDegreeType; problem: string }>
  >([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Violation selection
  const [selectedDegree, setSelectedDegree] = useState<ViolationDegreeType | ''>('');
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  const [behaviorDetails, setBehaviorDetails] = useState<string>('');

  // Update students dropdown when class changes
  useEffect(() => {
    if (!selectedClassNorm) {
      setAvailableStudents([]);
      setSelectedStudentName('');
      return;
    }
    const filtered = (studentsData || [])
      .filter((s) => s.normalizedClass === selectedClassNorm)
      .sort((a, b) => a.name.localeCompare(b.name));
    setAvailableStudents(filtered);
    setSelectedStudentName('');
  }, [selectedClassNorm, studentsData]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const words = trimmed.split(/\s+/);
    const results: Array<{ degree: ViolationDegreeType; problem: string }> = [];

    (Object.keys(violationsDatabase) as ViolationDegreeType[]).forEach((deg) => {
      violationsDatabase[deg].problems.forEach((prob) => {
        const isMatch = words.every((word) => prob.includes(word));
        if (isMatch) {
          results.push({ degree: deg, problem: prob });
        }
      });
    });

    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleSelectSearchResult = (deg: ViolationDegreeType, prob: string) => {
    setSelectedDegree(deg);
    setSelectedProblem(prob);
    setSearchQuery('');
    setShowSearchResults(false);
    onShowAlert(
      `تم اختيار المشكلة آلياً بنجاح:<br><br><span style="color:#16a085; font-weight:bold;">${prob}</span><br>وهي مصنفة من <b>${deg}</b>.`
    );
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deg = e.target.value as ViolationDegreeType;
    setSelectedDegree(deg);
    setSelectedProblem('');
  };

  const handleAddStudentClick = () => {
    if (!selectedClassNorm || !selectedStudentName) {
      onShowAlert('يرجى اختيار الصف واسم الطالب أولاً.');
      return;
    }

    const formalClass = classMap.get(selectedClassNorm) || selectedClassNorm;
    const stdData =
      availableStudents.find((s) => s.name === selectedStudentName) ||
      studentsData.find(
        (s) => s.name === selectedStudentName && s.normalizedClass === selectedClassNorm
      );

    if (selectedStudents.some((s) => s.name === selectedStudentName)) {
      onShowAlert('هذا الطالب مضاف مسبقاً في القائمة.');
      return;
    }

    onAddStudent(selectedStudentName, formalClass, stdData?.phone);
    setSelectedStudentName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      onShowAlert('يرجى اختيار وإضافة طالب واحد على الأقل للقائمة.');
      return;
    }
    if (!selectedDegree || !selectedProblem) {
      onShowAlert(
        'يرجى تحديد درجة المخالفة واختيار المشكلة السلوكية من القوائم المنسدلة.'
      );
      return;
    }
    onGenerateReport(selectedDegree, selectedProblem, behaviorDetails);
  };

  const sortedClasses = Array.from(classMap.entries()).sort((a, b) =>
    a[1].localeCompare(b[1])
  );

  return (
    <div className="bg-white rounded-2xl p-5 md:p-7 shadow-sm border border-emerald-100/80 border-t-4 border-t-[#16a085] mb-6 no-print">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h2 className="text-[#16a085] text-base md:text-lg font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#16a085]" />
          <span>تسجيل المشكلة السلوكية (حسب الدليل الإجرائي المعتمد)</span>
        </h2>

        <button
          type="button"
          id="btnOpenAddStudent"
          onClick={onOpenAddStudent}
          className="bg-emerald-50 hover:bg-emerald-100 text-[#16a085] border border-emerald-300 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
          title="إضافة طالب جديد يدوياً إلى النظام"
        >
          <UserPlus className="w-4 h-4 text-[#16a085]" />
          <span>إضافة طالب</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Class & Student */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#27ae60] text-xs md:text-sm">
              1. اختر الصف:
            </label>
            <select
              id="studentClass"
              value={selectedClassNorm}
              onChange={(e) => setSelectedClassNorm(e.target.value)}
              className="w-full p-3 md:p-3.5 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value="" disabled>
                -- اختر الصف --
              </option>
              {sortedClasses.map(([normKey, displayValue]) => (
                <option key={normKey} value={normKey}>
                  {displayValue}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-[#27ae60] text-xs md:text-sm">
                2. اختر اسم الطالب وأضفه للقائمة:
              </label>
              <button
                type="button"
                onClick={onOpenAddStudent}
                className="text-[11px] text-[#16a085] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                <span>طالب جديد؟ أضفه هنا</span>
              </button>
            </div>
            <div className="flex gap-2">
              <select
                id="studentSelect"
                value={selectedStudentName}
                onChange={(e) => setSelectedStudentName(e.target.value)}
                disabled={!selectedClassNorm}
                className="flex-1 p-3 md:p-3.5 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-60 cursor-pointer"
              >
                <option value="" disabled>
                  {selectedClassNorm
                    ? '-- اختر اسم الطالب --'
                    : '-- بانتظار تحديد الصف --'}
                </option>
                {availableStudents.map((student) => (
                  <option key={student.name} value={student.name}>
                    {student.name} {student.phone ? ` 📱 (جوال: ${formatPhoneDisplay(student.phone)})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddStudentClick}
                className="bg-[#16a085] hover:bg-[#138d75] text-white px-4 py-3 rounded-xl text-xs md:text-sm font-bold flex items-center gap-1 shrink-0 transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Students Chips */}
        {selectedStudents.length > 0 && (
          <div
            id="selectedStudentsContainer"
            className="flex flex-wrap gap-2 pt-1 pb-1"
          >
            {selectedStudents.map((std) => (
              <div
                key={std.name}
                className="bg-emerald-50 text-[#27ae60] border border-emerald-300/80 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-2xs"
              >
                <span>
                  {std.name} ({std.cls})
                </span>
                {std.phone && (
                  <span
                    className="font-mono bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1"
                    dir="ltr"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{formatPhoneDisplay(std.phone)}</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveStudent(std.name)}
                  className="text-red-500 hover:text-red-700 font-black text-sm p-0.5 rounded-full hover:bg-red-50 transition-colors"
                  title="حذف الطالب من القائمة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Smart Search Box */}
        <div
          ref={searchWrapperRef}
          className="relative pt-4 mt-3 border-t border-dashed border-gray-200"
        >
          <label className="block text-[#16a085] text-xs md:text-sm font-bold mb-1.5">
            🔍 لا تعرف الدرجة؟ ابحث عن المشكلة هنا وسيقوم النظام باختيارها آلياً:
          </label>
          <div className="relative">
            <input
              type="text"
              id="problemSearchInput"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowSearchResults(true);
              }}
              placeholder="اكتب كلمة من المشكلة (مثال: غياب، تدخين، جوال، شجار، هروب)..."
              className="w-full p-3 pr-10 md:p-3.5 md:pr-11 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
            <Search className="w-4 h-4 text-[#16a085] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {showSearchResults && (
            <div
              id="problemSearchResults"
              className="absolute top-full right-0 left-0 bg-white border border-[#b2ebf2] rounded-xl mt-1 max-h-64 overflow-y-auto z-40 shadow-xl divide-y divide-gray-100"
            >
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      handleSelectSearchResult(item.degree, item.problem)
                    }
                    className="p-3 hover:bg-emerald-50/70 cursor-pointer flex justify-between items-center transition-colors text-xs md:text-sm"
                  >
                    <span className="font-semibold text-gray-800 leading-snug">
                      {item.problem}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold shrink-0 mr-2 border border-red-200">
                      {item.degree}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-xs md:text-sm">
                  لا توجد مشكلة مطابقة لبحثك في الدليل الإجرائي.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Degree & Problem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#27ae60] text-xs md:text-sm">
              3. درجة المخالفة:
            </label>
            <select
              id="violationDegree"
              value={selectedDegree}
              onChange={handleDegreeChange}
              className="w-full p-3 md:p-3.5 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value="" disabled>
                -- اختر الدرجة أولاً --
              </option>
              <option value="الدرجة الأولى">مخالفات الدرجة الأولى</option>
              <option value="الدرجة الثانية">مخالفات الدرجة الثانية</option>
              <option value="الدرجة الثالثة">مخالفات الدرجة الثالثة</option>
              <option value="الدرجة الرابعة">مخالفات الدرجة الرابعة</option>
              <option value="الدرجة الخامسة">مخالفات الدرجة الخامسة</option>
              <option value="الدرجة السادسة">مخالفات الدرجة السادسة</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-[#27ae60] text-xs md:text-sm">
              4. نوع المشكلة السلوكية المحددة:
            </label>
            <select
              id="violationProblem"
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              disabled={!selectedDegree}
              className="w-full p-3 md:p-3.5 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-60 cursor-pointer"
            >
              <option value="" disabled>
                {selectedDegree
                  ? '-- اختر المشكلة السلوكية --'
                  : '-- بانتظار تحديد الدرجة --'}
              </option>
              {selectedDegree &&
                violationsDatabase[selectedDegree]?.problems.map((prob) => (
                  <option key={prob} value={prob}>
                    {prob}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Additional Details */}
        <div className="flex flex-col gap-1.5 pt-1">
          <label className="font-bold text-[#27ae60] text-xs md:text-sm">
            تفاصيل إضافية عن الموقف (اختياري - ستُدمج مع وصف المشكلة الرسمي):
          </label>
          <textarea
            id="behaviorDetails"
            value={behaviorDetails}
            onChange={(e) => setBehaviorDetails(e.target.value)}
            rows={3}
            placeholder="مثال: حدث ذلك أثناء حصة الرياضيات وتم سحب الجهاز منه..."
            className="w-full p-3 md:p-3.5 border border-[#b2ebf2] rounded-xl text-sm bg-gray-50/70 focus:outline-none focus:border-[#16a085] focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all resize-y"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full mt-4 bg-[#16a085] hover:bg-[#138d75] text-white py-3.5 md:py-4 px-6 rounded-xl font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <Check className="w-5 h-5" />
          <span>إصدار التقرير واعتماد الإجراءات</span>
        </button>
      </form>
    </div>
  );
};
