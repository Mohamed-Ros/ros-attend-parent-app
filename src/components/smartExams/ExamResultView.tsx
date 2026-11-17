import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../services/apiClient';
import { ExamResult } from './types';

export const ExamResultView: React.FC<{ studentId: string | number; paperId: number; onClose: () => void }> = ({ studentId, paperId, onClose }) => {
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    ApiClient.get<ExamResult>(`/parent/student/${studentId}/smart-exams/${paperId}/result`)
      .then(setResult)
      .catch((e: any) => setError(e?.message || 'تعذر تحميل النتيجة'));
  }, [studentId, paperId]);

  const percent = result && result.total_points > 0 ? Math.round((result.score / result.total_points) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-50 overflow-y-auto font-['Cairo'] text-slate-900" dir="rtl">
      <header className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center" aria-label="رجوع">
          <i className="fa-solid fa-arrow-right" />
        </button>
        <h1 className="text-sm font-black truncate">{result?.title || 'نتيجة الامتحان'}</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-10">
        {error && <p className="text-center text-sm font-bold text-slate-500 py-16">{error}</p>}
        {!result && !error && <div className="py-20 text-center"><i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-700" /></div>}

        {result && (
          <>
            <div className="rounded-3xl bg-gradient-to-br from-[#065F46] to-[#012017] text-white p-6 text-center space-y-1">
              <p className="text-xs font-bold text-emerald-200">الدرجة</p>
              <p className="text-4xl font-black" dir="ltr">{result.score} / {result.total_points}</p>
              <p className="text-sm font-black text-emerald-300">{percent}%</p>
            </div>

            {result.questions.map((q, i) => {
              const essay = q.type === 'essay';
              const full = q.score !== null && q.score >= q.points;
              const zero = !q.score;
              return (
                <article key={q.id} className="bg-white border border-slate-100 rounded-3xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-black leading-relaxed"><span className="text-slate-400 ml-1">{i + 1}.</span>{q.text}</p>
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${full ? 'bg-emerald-50 text-emerald-700' : zero ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`} dir="ltr">
                      {q.score ?? 0} / {q.points}
                    </span>
                  </div>

                  {!essay ? (
                    <div className="space-y-1.5">
                      {(q.options || []).map((opt, j) => {
                        const correct = q.correct_option === j;
                        const picked = q.selected_option === j;
                        return (
                          <div key={j} className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                            correct ? 'bg-emerald-50 text-emerald-800' : picked ? 'bg-rose-50 text-rose-700' : 'text-slate-500'
                          }`}>
                            <i className={`fa-solid ${correct ? 'fa-check' : picked ? 'fa-xmark' : 'fa-circle text-[5px] text-slate-300'}`} />
                            <span className="flex-1">{opt}</span>
                            {picked && <span className="text-[10px]">إجابتك</span>}
                            {correct && !picked && <span className="text-[10px]">الإجابة الصح</span>}
                          </div>
                        );
                      })}
                      {q.selected_option === null && <p className="text-[11px] font-bold text-slate-400">ماجاوبتش على السؤال ده</p>}
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-bold">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] text-slate-400 mb-1">إجابتك</p>
                        <p className="whitespace-pre-wrap">{q.text_answer?.trim() || 'ماكتبتش إجابة'}</p>
                      </div>
                      {q.model_answer && (
                        <div className="rounded-xl bg-emerald-50 text-emerald-900 p-3">
                          <p className="text-[10px] text-emerald-700 mb-1">الإجابة النموذجية</p>
                          <p className="whitespace-pre-wrap">{q.model_answer}</p>
                        </div>
                      )}
                      {q.feedback && <p className="text-slate-600"><i className="fa-solid fa-comment-dots ml-1 text-emerald-700" />{q.feedback}</p>}
                    </div>
                  )}
                </article>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
