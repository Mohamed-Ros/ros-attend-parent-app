import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Hourglass, XCircle } from 'lucide-react';
import { Dialog } from '../../lib/dialog';
import { ApiClient } from '../../services/apiClient';
import { ExamTaking } from './ExamTaking';
import { ExamResultView } from './ExamResultView';
import { SmartExamItem } from './types';
import { Badge, Button, Card, SectionTitle } from '../ui';

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

/** Online exams the child can take, at the top of the grades page. */
export const SmartExamsSection: React.FC<{ studentId: string | number; onResultsChanged?: () => void }> = ({ studentId, onResultsChanged }) => {
  const [exams, setExams] = useState<SmartExamItem[]>([]);
  const [taking, setTaking] = useState<number | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  const load = useCallback(() => {
    ApiClient.get<{ exams: SmartExamItem[] }>(`/parent/student/${studentId}/smart-exams`)
      .then((r) => setExams(r.exams || []))
      .catch(() => setExams([]));
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const start = async (exam: SmartExamItem) => {
    if (exam.state === 'available') {
      const res = await Dialog.fire({
        title: exam.title,
        html: `<div style="line-height:1.9">
          ${exam.questions_count} سؤال · ${exam.total_points} درجة<br>
          ${exam.duration_minutes ? `<b>الوقت: ${exam.duration_minutes} دقيقة</b> — بيبدأ أول ما تضغط ابدأ ومش بيقف لو خرجت.` : 'مفيش وقت محدد.'}
          ${exam.closes_at ? `<br>آخر ميعاد: ${fmtDate(exam.closes_at)}` : ''}
        </div>`,
        showCancelButton: true,
        confirmButtonText: 'ابدأ الامتحان',
        cancelButtonText: 'بعدين',
      });
      if (!res.isConfirmed) return;
    }
    setTaking(exam.id);
  };

  if (exams.length === 0) return null;

  return (
    <>
      <section className="space-y-3">
        <SectionTitle>امتحانات أونلاين</SectionTitle>
        {exams.map((exam) => (
          <Card key={exam.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <h3 className="text-body font-semibold">{exam.title}</h3>
                <p className="text-meta text-ink-2">
                  {exam.questions_count} سؤال · {exam.total_points} درجة{exam.duration_minutes ? ` · ${exam.duration_minutes} دقيقة` : ''}
                </p>
              </div>
              {exam.state === 'result' && (
                <span className="text-title tabular dir-ltr shrink-0">
                  {exam.score} / {exam.total_points}
                </span>
              )}
            </div>

            {exam.state === 'available' && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-meta text-ink-2">{exam.closes_at ? `متاح حتى ${fmtDate(exam.closes_at)}` : 'متاح الآن'}</span>
                <Button block={false} className="h-10 px-4" onClick={() => start(exam)}>
                  ابدأ الامتحان
                </Button>
              </div>
            )}
            {exam.state === 'in_progress' && (
              <div className="flex items-center justify-between gap-3">
                <Badge tone="warning" icon={Hourglass}>
                  بدأته{exam.deadline_at ? ` · التسليم قبل ${fmtDate(exam.deadline_at)}` : ''}
                </Badge>
                <Button block={false} className="h-10 px-4" onClick={() => start(exam)}>
                  كمّل الحل
                </Button>
              </div>
            )}
            {exam.state === 'submitted' && (
              <Badge tone="success" icon={CheckCircle2}>
                تم التسليم — النتيجة بعد مراجعة المدرس
              </Badge>
            )}
            {exam.state === 'result' && (
              <Button variant="secondary" className="h-10" onClick={() => setViewing(exam.id)}>
                عرض التصحيح
              </Button>
            )}
            {exam.state === 'upcoming' && (
              <Badge tone="info" icon={CalendarClock}>
                يفتح {fmtDate(exam.opens_at)}
              </Badge>
            )}
            {exam.state === 'missed' && (
              <Badge tone="danger" icon={XCircle}>
                فات ميعاد الامتحان
              </Badge>
            )}
          </Card>
        ))}
      </section>

      {taking !== null && (
        <ExamTaking
          studentId={studentId}
          paperId={taking}
          onClose={() => {
            setTaking(null);
            load();
          }}
        />
      )}
      {viewing !== null && (
        <ExamResultView
          studentId={studentId}
          paperId={viewing}
          onClose={() => {
            setViewing(null);
            onResultsChanged?.();
          }}
        />
      )}
    </>
  );
};
