import { Student } from '../types';

/** The backend falls back to this number when a teacher has no phone on file; it is not a real contact. */
const PLACEHOLDER_PHONE = '01000000000';

/** Teacher name as the API sends it (honorific already stripped). The generic "المعلم" means "unknown". */
export const teacherName = (s: Pick<Student, 'teacher_name'>): string => {
  const n = (s.teacher_name || '').trim();
  return n === 'المعلم' ? '' : n;
};

/** "أ. محمد" or '' when unknown. */
export const teacherTitle = (s: Pick<Student, 'teacher_name'>): string => {
  const n = teacherName(s);
  return n ? `أ. ${n}` : '';
};

/** Stable identity of the teacher a child belongs to. */
export const teacherKey = (s: Student): string => String(s.tenant_id ?? (teacherName(s) || ''));

export const countTeachers = (list: Student[]): number => new Set(list.map(teacherKey)).size;

export interface TeacherGroup {
  key: string;
  title: string;
  subject?: string;
  students: Student[];
}

/** Children bucketed by teacher, keeping the order in which each teacher first appears. */
export const groupByTeacher = (list: Student[]): TeacherGroup[] => {
  const map = new Map<string, TeacherGroup>();
  list.forEach((s) => {
    const key = teacherKey(s);
    const g = map.get(key) ?? { key, title: teacherTitle(s) || 'المعلم', subject: s.teacher_subject || undefined, students: [] };
    g.students.push(s);
    map.set(key, g);
  });
  return [...map.values()];
};

/** The teacher's contact number, or null when there is none (so the UI can hide the button instead of calling a fake number). */
export const centerPhoneOf = (s: Student): string | null => {
  const digits = (s.center_phone || s.group?.center_phone || '').replace(/[^0-9]/g, '');
  if (digits.length < 9 || digits.endsWith(PLACEHOLDER_PHONE.slice(1))) return null;
  return digits.startsWith('0') ? `20${digits.slice(1)}` : digits;
};
