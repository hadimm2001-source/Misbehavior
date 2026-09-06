import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header.tsx';
import { BehaviorForm } from './components/BehaviorForm.tsx';
import { ReportView } from './components/ReportView.tsx';
import { ArchiveTable } from './components/ArchiveTable.tsx';
import { CustomAlertModal } from './components/CustomAlertModal.tsx';
import { ProceduresModal } from './components/ProceduresModal.tsx';
import { WhatsAppModal } from './components/WhatsAppModal.tsx';
import { AddStudentModal } from './components/AddStudentModal.tsx';
import { StudentDirectoryModal } from './components/StudentDirectoryModal.tsx';
import { parseStudentsData, normalizeClass } from './data/students.ts';
import { violationsDatabase } from './data/violations.ts';
import {
  ArchiveRecord,
  SelectedStudent,
  Student,
  ViolationDegreeType
} from './types.ts';

export default function App() {
  // Parse base student and class database
  const { students: baseStudents, classMap: baseClassMap } = useMemo(
    () => parseStudentsData(),
    []
  );

  // Manually added custom students state persisted in localStorage
  const [customStudents, setCustomStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('custom_students_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Save custom students when updated
  useEffect(() => {
    try {
      localStorage.setItem('custom_students_v1', JSON.stringify(customStudents));
    } catch {
      // ignore
    }
  }, [customStudents]);

  // Combined students list
  const allStudents = useMemo(() => {
    return [...baseStudents, ...customStudents];
  }, [baseStudents, customStudents]);

  // Dynamic class map including any newly added classes
  const classMap = useMemo(() => {
    const map = new Map(baseClassMap);
    customStudents.forEach((std) => {
      const norm = std.normalizedClass || normalizeClass(std.class);
      if (std.class && !map.has(norm)) {
        map.set(norm, std.class);
      }
    });
    return map;
  }, [baseClassMap, customStudents]);

  // App States
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>([]);
  const [behaviorArchive, setBehaviorArchive] = useState<ArchiveRecord[]>(() => {
    try {
      const saved = localStorage.getItem('behavior_archive_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Current Generated Report State
  const [currentReport, setCurrentReport] = useState<{
    students: SelectedStudent[];
    degree: ViolationDegreeType;
    problem: string;
    procedures: string[];
    warnings: string[];
    isSaved: boolean;
  } | null>(null);

  // Modal States
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
    type?: 'info' | 'success' | 'warning';
  }>({
    isOpen: false,
    message: ''
  });

  const [activeProcedureRecord, setActiveProcedureRecord] =
    useState<ArchiveRecord | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedProceduresForWA, setSelectedProceduresForWA] = useState<
    string[]
  >([]);

  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);

  // Sync state (local storage is always ready and syncing)
  const isSynced = true;

  // Persist archive updates
  useEffect(() => {
    try {
      localStorage.setItem(
        'behavior_archive_v1',
        JSON.stringify(behaviorArchive)
      );
    } catch {
      // ignore
    }
  }, [behaviorArchive]);

  // Handlers for Group Selection
  const handleAddStudent = (name: string, cls: string, phone?: string) => {
    setSelectedStudents((prev) => [...prev, { name, cls, phone }]);
  };

  const handleRemoveStudent = (nameToRemove: string) => {
    setSelectedStudents((prev) =>
      prev.filter((s) => s.name !== nameToRemove)
    );
  };

  // Handler to save a newly added student
  const handleSaveCustomStudent = (newStudent: Student, addToSelected: boolean) => {
    // Check if student with same name already exists in active list
    const existing = allStudents.find((s) => s.name.trim() === newStudent.name.trim());
    if (existing) {
      setAlertModal({
        isOpen: true,
        message: `⚠️ تنبيه: الطالب "${newStudent.name}" مسجل مسبقاً في الصف (${existing.class}).`,
        type: 'warning'
      });
      return;
    }

    setCustomStudents((prev) => [...prev, newStudent]);
    setIsAddStudentModalOpen(false);

    if (addToSelected) {
      setSelectedStudents((prev) => {
        if (prev.some((s) => s.name === newStudent.name)) return prev;
        return [...prev, { name: newStudent.name, cls: newStudent.class, phone: newStudent.phone }];
      });
    }

    setAlertModal({
      isOpen: true,
      message: `✅ تم إضافة الطالب <b>${newStudent.name}</b> بنجاح إلى صف <b>(${newStudent.class})</b> وسجلات المدرسة!`,
      type: 'success'
    });
  };

  const handleDeleteCustomStudent = (studentName: string) => {
    setCustomStudents((prev) => prev.filter((s) => s.name !== studentName));
    setSelectedStudents((prev) => prev.filter((s) => s.name !== studentName));
  };

  // Generate Report Handler
  const handleGenerateReport = (
    degree: ViolationDegreeType,
    problemSelected: string,
    details: string
  ) => {
    let fullProblemDescription = problemSelected;
    if (details.trim() !== '') {
      fullProblemDescription += `\n(التفاصيل: ${details.trim()})`;
    }

    const procedures = violationsDatabase[degree]?.procedures || [];
    const warnings: string[] = [];

    selectedStudents.forEach((student) => {
      const pastViolations = behaviorArchive.filter(
        (record) => record.name === student.name
      );
      const count = pastViolations.length + 1;
      if (count >= 2) {
        warnings.push(
          `<b>${student.name}:</b> لديه (${count}) مشكلات سلوكية مسجلة مسبقاً.`
        );
      }
    });

    setCurrentReport({
      students: [...selectedStudents],
      degree,
      problem: fullProblemDescription,
      procedures,
      warnings,
      isSaved: false
    });

    setTimeout(() => {
      const element = document.getElementById('report-wrapper');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Save current report to archive
  const handleSaveToArchive = () => {
    if (!currentReport) return;

    const todayStr = new Date().toLocaleDateString('ar-SA');
    const timestamp = Date.now();

    const newRecords: ArchiveRecord[] = currentReport.students.map((student) => {
      const pastCount = behaviorArchive.filter(
        (r) => r.name === student.name
      ).length;

      return {
        id: `${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
        date: todayStr,
        timestamp,
        name: student.name,
        cls: student.cls,
        problem: currentReport.problem,
        degree: currentReport.degree,
        count: pastCount + 1,
        procedures: currentReport.procedures,
        phone: student.phone
      };
    });

    setBehaviorArchive((prev) => [...newRecords, ...prev]);
    setCurrentReport((prev) => (prev ? { ...prev, isSaved: true } : null));

    setAlertModal({
      isOpen: true,
      message:
        '✅ تم اعتماد المشكلة وحفظها بنجاح في سجلات جميع الطلاب المحددين بالأرشيف!',
      type: 'success'
    });
  };

  // Delete record from archive
  const handleDeleteRecord = (id: string) => {
    setBehaviorArchive((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOpenWhatsAppModal = (selectedProcs: string[]) => {
    setSelectedProceduresForWA(selectedProcs);
    setIsWhatsAppModalOpen(true);
  };

  const showAlert = (message: string) => {
    setAlertModal({
      isOpen: true,
      message,
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-[#f0fbfc] text-[#2c3e50] p-3 md:p-6 font-['Tajawal']">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Header
          isSynced={isSynced}
          onOpenDirectory={() => setIsDirectoryModalOpen(true)}
          onOpenAddStudent={() => setIsAddStudentModalOpen(true)}
        />

        {/* Behavior Registration Form */}
        <BehaviorForm
          studentsData={allStudents}
          classMap={classMap}
          selectedStudents={selectedStudents}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
          onGenerateReport={handleGenerateReport}
          onShowAlert={showAlert}
          onOpenAddStudent={() => setIsAddStudentModalOpen(true)}
          onOpenDirectory={() => setIsDirectoryModalOpen(true)}
        />

        {/* Active Report View (if generated) */}
        {currentReport && (
          <ReportView
            students={currentReport.students}
            degree={currentReport.degree}
            problem={currentReport.problem}
            procedures={currentReport.procedures}
            warnings={currentReport.warnings}
            isSaved={currentReport.isSaved}
            onSaveToArchive={handleSaveToArchive}
            onOpenWhatsApp={handleOpenWhatsAppModal}
            onShowAlert={showAlert}
          />
        )}

        {/* Archive Section */}
        <ArchiveTable
          archive={behaviorArchive}
          classMap={classMap}
          allStudents={allStudents}
          onViewProcedures={(record) => setActiveProcedureRecord(record)}
          onDeleteRecord={handleDeleteRecord}
        />

        {/* Modals */}
        <CustomAlertModal
          isOpen={alertModal.isOpen}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        />

        <AddStudentModal
          isOpen={isAddStudentModalOpen}
          onClose={() => setIsAddStudentModalOpen(false)}
          onSaveStudent={handleSaveCustomStudent}
          customStudents={customStudents}
          onDeleteCustomStudent={handleDeleteCustomStudent}
          classMap={classMap}
          onShowAlert={showAlert}
        />

        <ProceduresModal
          isOpen={!!activeProcedureRecord}
          record={activeProcedureRecord}
          onClose={() => setActiveProcedureRecord(null)}
        />

        {currentReport && (
          <WhatsAppModal
            isOpen={isWhatsAppModalOpen}
            students={currentReport.students}
            allStudentsData={allStudents}
            degree={currentReport.degree}
            problemDesc={currentReport.problem}
            selectedProcedures={selectedProceduresForWA}
            onClose={() => setIsWhatsAppModalOpen(false)}
          />
        )}

        <StudentDirectoryModal
          isOpen={isDirectoryModalOpen}
          onClose={() => setIsDirectoryModalOpen(false)}
          allStudents={allStudents}
          classMap={classMap}
          onOpenAddStudent={() => {
            setIsDirectoryModalOpen(false);
            setIsAddStudentModalOpen(true);
          }}
        />
      </div>
    </div>
  );
}
