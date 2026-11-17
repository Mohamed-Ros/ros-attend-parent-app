import React from 'react';
import { Check, LogOut } from 'lucide-react';
import { Student } from '../types';
import { groupByTeacher } from '../lib/teachers';
import { Avatar, BottomSheet, Button } from './ui';

interface AccountSheetProps {
  open: boolean;
  onClose: () => void;
  student: Student;
  studentsList: Student[];
  onSwitchStudent: (student: Student) => void;
  onLogout: () => void;
}

/** Child switcher (grouped by teacher when there is more than one) + logout. Shared by every hero. */
export const AccountSheet: React.FC<AccountSheetProps> = ({ open, onClose, student, studentsList, onSwitchStudent, onLogout }) => {
  const multiple = studentsList.length > 1;
  const groups = groupByTeacher(studentsList);
  const showTeachers = groups.length > 1;

  return (
    <BottomSheet open={open} onClose={onClose} title={multiple ? 'تبديل الابن' : 'الحساب'}>
      {multiple && (
        <div className="space-y-4 max-h-[55vh] overflow-y-auto -mx-1 px-1">
          {groups.map((g) => (
            <section key={g.key} className="space-y-2">
              {showTeachers && (
                <h3 className="text-meta font-semibold text-ink-2">
                  {g.title}
                  {g.subject ? <span className="font-normal text-ink-3"> · {g.subject}</span> : null}
                </h3>
              )}
              <ul className="space-y-2">
                {g.students.map((s) => {
                  const current = s.id === student.id;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onSwitchStudent(s);
                          onClose();
                        }}
                        aria-current={current ? 'true' : undefined}
                        className={`w-full flex items-center gap-3 p-3 rounded-control border text-right ${current ? 'border-brand bg-brand-soft' : 'border-line bg-surface'}`}
                      >
                        <Avatar name={s.name} size={36} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-body font-semibold truncate">{s.name}</span>
                          <span className="block text-caption text-ink-2 truncate">{s.group?.name || 'المجموعة الدراسية'}</span>
                        </span>
                        {current && <Check size={18} className="text-brand" aria-label="الابن الحالي" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      <Button
        variant="danger"
        icon={LogOut}
        onClick={() => {
          onClose();
          onLogout();
        }}
      >
        تسجيل الخروج
      </Button>
    </BottomSheet>
  );
};
