import React from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { Student } from '../types';
import { Dialog } from '../lib/dialog';
import { Avatar, Button, Card, KeyValueList, ListRow, SectionTitle } from '../components/ui';

interface ProfileProps {
  student: Student;
  onLogout: () => void;
  onChangePassword: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ student, onLogout, onChangePassword }) => {
  const studentCode = student.qr_code || student.phone || 'STU-' + student.id;

  const confirmLogout = () => {
    Dialog.fire({
      title: 'تسجيل الخروج',
      text: 'هل تريد تسجيل الخروج من البوابة؟',
      showCancelButton: true,
      confirmButtonText: 'تسجيل الخروج',
      cancelButtonText: 'إلغاء',
    }).then((r) => r.isConfirmed && onLogout());
  };

  return (
    <div className="space-y-5">
      <Card className="p-4 flex items-center gap-4">
        <Avatar name={student.name} size={56} />
        <div className="min-w-0 space-y-0.5">
          <h2 className="text-title truncate">{student.name}</h2>
          <p className="text-meta text-ink-2 truncate">{student.group?.name || 'المجموعة الدراسية'}</p>
          <p className="text-caption text-ink-3">
            كود الطالب: <span className="dir-ltr inline-block text-ink-2">{studentCode}</span>
          </p>
        </div>
      </Card>

      <section className="space-y-3">
        <SectionTitle>البيانات</SectionTitle>
        <KeyValueList
          items={[
            { label: 'هاتف الطالب', value: <span className="dir-ltr inline-block">{student.phone || '—'}</span> },
            { label: 'هاتف ولي الأمر', value: <span className="dir-ltr inline-block">{student.parent_phone || student.phone || '—'}</span> },
            { label: 'نوع الاشتراك', value: student.subscription_type === 'monthly' ? 'شهري (8 حصص)' : 'بالحصة' },
            { label: 'رقم الميدالية', value: student.medallion_number ? `#${student.medallion_number}` : 'غير محدد' },
          ]}
        />
      </section>

      <section className="space-y-3">
        <SectionTitle>الإعدادات</SectionTitle>
        <ListRow icon={KeyRound} title="تغيير كلمة السر" meta="اختر كلمة سر جديدة لحسابك" onClick={onChangePassword} />
      </section>

      <Button variant="danger" icon={LogOut} onClick={confirmLogout}>
        تسجيل الخروج
      </Button>
    </div>
  );
};
