import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ApiClient } from '../../services/apiClient';
import { ExamTaking } from './ExamTaking';
import { ExamResultView } from './ExamResultView';
import { SmartExamItem } from './types';

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

/** Online exams the child can take, at the top of the grades page. */
export const SmartExamsSection: React.FC<{ studentId: string | number; onResultsChanged?: () => void }> = ({ studentId, onResultsChanged }) => {
  const [exams, setExams] = useState<SmartExamItem[]>([]);
  const [taking, setTaking] = useState<number | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);

  const load = useCallback(() => {
    ApiClient.get<{ exams: SmartExamItem[] }>(`/parent/student/${studentId}/smart-exams`)
      .then(r => setExams(r.exams || []))
      .catch(() => setExams([]));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const start = async (exam: SmartExamItem) => {
    if (exam.state === 'available') {
      const res = await Swal.fire({
        icon: 'info',
        title: exam.title,
        html: `<div style="font-family:Cairo;font-size:13px;line-height:1.9">
          ${exam.questions_count} سؤال · ${exam.total_points} درجة<br>
          ${exam.duration_minutes ? `<b>الوقت: ${exam.duration_minutes} دقيقة</b> — بيبدأ أول ما تضغط ابدأ ومش بيقف لو خرجت.` : 'مفيش وقت محدد.'}
          ${exam.closes_at ? `<br>آخر ميعاد: ${fmtDate(exam.closes_at)}` : ''}
        </div>`,
        showCancelButton: true,
        confirmButtonText: 'ابدأ الامتحان',
        cancelButtonText: 'بعدين',
        confirmButtonColor: '#065F46',
      });
      if (!res.isConfirmed) return;
    }
    setTaking(exam.id);
  };

  if (exams.length === 0) return null;

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-sm font-black text-slate-900 px-1 flex items-center gap-2">
          <i className="fa-solid fa-laptop-file text-[#4f46e5]" />
          امتحانات أونلاين
        </h3>
        {exams.map(exam => (
          <div key={exam.id} className="bg-white border border-slate-100 border-b-2 border-b-indigo-500/30 rounded-3xl p-4 space-y-3 text-right">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900">{exam.title}</h4>
                <p className="text-[11px] font-bold text-slate-500">
                  {exam.questions_count} سؤال · {exam.total_points} درجة{exam.duration_minutes ? ` · ${exam.duration_minutes} دقيقة` : ''}
                </p>
              </div>
              {exam.state === 'result' && (
                <span className="px-3 py-1.5 bg-[#e8f6f0] border border-[#b2e2d0] rounded-2xl text-sm font-black text-[#065A4B] shrink-0" dir="ltr">
                  {exam.score} / {exam.total_points}
                </span>
              )}
            </div>

            {exam.state === 'available' && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500">{exam.closes_at ? `متاح لحد ${fmtDate(exam.closes_at)}` : 'متاح دلوقتي'}</span>
                <button onClick={() => start(exam)} className="px-4 py-2 rounded-2xl bg-[#065F46] text-white text-xs font-black">ابدأ الامتحان</button>
              </div>
            )}
            {exam.state === 'in_progress' && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-amber-700">
                  <i className="fa-solid fa-hourglass-half ml-1" />بدأته{exam.deadline_at ? ` · لازم يتسلّم قبل ${fmtDate(exam.deadline_at)}` : ''}
                </span>
                <button onClick={() => start(exam)} className="px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-black">كمّل الحل</button>
              </div>
            )}
            {exam.state === 'submitted' && (
              <p className="text-[11px] font-bold text-slate-500"><i className="fa-solid fa-circle-check text-emerald-600 ml-1" />اتسلّم — النتيجة هتظهر بعد ما المدرس يراجعها</p>
            )}
            {exam.state === 'result' && (
              <button onClick={() => setViewing(exam.id)} className="w-full py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-800">
                شوف التصحيح
              </button>
            )}
            {exam.state === 'upcoming' && (
              <p className="text-[11px] font-bold text-slate-500"><i className="fa-regular fa-calendar ml-1" />هيفتح {fmtDate(exam.opens_at)}</p>
            )}
            {exam.state === 'missed' && (
              <p className="text-[11px] font-bold text-rose-600"><i className="fa-solid fa-circle-xmark ml-1" />فات ميعاد الامتحان</p>
            )}
          </div>
        ))}
      </div>

      {taking !== null && (
        <ExamTaking studentId={studentId} paperId={taking} onClose={() => { setTaking(null); load(); }} />
      )}
      {viewing !== null && (
        <ExamResultView studentId={studentId} paperId={viewing} onClose={() => { setViewing(null); onResultsChanged?.(); }} />
      )}
    </>
  );
};
