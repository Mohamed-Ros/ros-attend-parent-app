import React, { useState, useEffect } from 'react';
import { BookCheck, CalendarX2, Check, Clock, Star, X } from 'lucide-react';
import { Student } from '../types';
import { ApiClient } from '../services/apiClient';
import { Badge, Chip, ChipRow, EmptyState, ListRow, LoadingBlock, StatStrip, Tone } from '../components/ui';

interface AttendanceProps {
  student: Student;
}

interface AttendanceRecordItem {
  id: number | string;
  date: string;
  status: 'present' | 'absent';
  homework_status?: 'done' | 'not_done' | 'none';
  time: string;
  isExtra: boolean;
  topic: string;
}

type Filter = 'all' | 'present' | 'absent' | 'extra';

export const Attendance: React.FC<AttendanceProps> = ({ student }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [records, setRecords] = useState<AttendanceRecordItem[]>([]);
  const [stats, setStats] = useState({ attendance_rate: 0, homework_done_count: 0, homework_not_done_count: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student?.id) return;
    setLoading(true);
    ApiClient.get<any>(`/parent/student/${student.id}/attendance`)
      .then((res) => {
        if (Array.isArray(res?.records)) setRecords(res.records);
        if (res?.stats) setStats(res.stats);
      })
      .catch((err) => console.warn('[Attendance] Failed to fetch live attendance:', err))
      .finally(() => setLoading(false));
  }, [student?.id]);

  const counts = {
    all: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    extra: records.filter((r) => r.isExtra).length,
  };

  const visible = records.filter((r) =>
    filter === 'present' ? r.status === 'present' : filter === 'absent' ? r.status === 'absent' : filter === 'extra' ? r.isExtra : true,
  );

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: `الكل (${counts.all})` },
    { id: 'present', label: `حاضر (${counts.present})` },
    { id: 'absent', label: `غائب (${counts.absent})` },
    { id: 'extra', label: `إضافية (${counts.extra})` },
  ];

  return (
    <div className="space-y-5">
      <StatStrip
        items={[
          { label: 'نسبة الحضور', value: `${stats.attendance_rate}%` },
          { label: 'واجب مسلّم', value: stats.homework_done_count },
          { label: 'واجب ناقص', value: stats.homework_not_done_count },
        ]}
      />

      <ChipRow>
        {chips.map((c) => (
          <Chip key={c.id} selected={filter === c.id} onClick={() => setFilter(c.id)}>
            {c.label}
          </Chip>
        ))}
      </ChipRow>

      {loading ? (
        <LoadingBlock label="جارٍ تحميل السجل" />
      ) : visible.length === 0 ? (
        <EmptyState icon={CalendarX2} title="لا توجد سجلات" hint="جرّب تغيير التصفية" />
      ) : (
        <ul className="space-y-3">
          {visible.map((rec) => {
            const present = rec.status === 'present';
            const hw: { tone: Tone; label: string } | null =
              present && rec.homework_status === 'done'
                ? { tone: 'success', label: 'الواجب مسلّم' }
                : present && rec.homework_status === 'not_done'
                ? { tone: 'danger', label: 'الواجب غير مسلّم' }
                : null;
            return (
              <li key={rec.id}>
                <ListRow
                  icon={present ? Check : X}
                  tone={present ? 'success' : 'danger'}
                  title={rec.topic}
                  meta={
                    <span className="flex items-center gap-3">
                      <span>{rec.date}</span>
                      {rec.time !== '—' && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} aria-hidden />
                          {rec.time}
                        </span>
                      )}
                    </span>
                  }
                  badge={
                    <span className="flex flex-wrap gap-1.5">
                      <Badge tone={present ? 'success' : 'danger'}>{present ? 'حاضر' : 'غائب'}</Badge>
                      {rec.isExtra && (
                        <Badge tone="warning" icon={Star}>
                          حصة إضافية
                        </Badge>
                      )}
                      {hw && (
                        <Badge tone={hw.tone} icon={BookCheck}>
                          {hw.label}
                        </Badge>
                      )}
                    </span>
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
