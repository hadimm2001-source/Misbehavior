export type ViolationDegreeType = 
  | 'الدرجة الأولى'
  | 'الدرجة الثانية'
  | 'الدرجة الثالثة'
  | 'الدرجة الرابعة'
  | 'الدرجة الخامسة'
  | 'الدرجة السادسة';

export interface Student {
  name: string;
  class: string;
  normalizedClass: string;
  phone: string;
}

export interface ViolationData {
  problems: string[];
  procedures: string[];
}

export interface ArchiveRecord {
  id: string;
  date: string;
  timestamp: number;
  name: string;
  cls: string;
  problem: string;
  degree: string;
  count: number;
  procedures: string[];
  phone?: string;
}

export interface SelectedStudent {
  name: string;
  cls: string;
  phone?: string;
}
