import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, MessageSquare, X } from 'lucide-react';
import { Badge, Card, Spinner } from '../ui';
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
    <div className="fixed inset-0 z-[70] bg-canvas overflow-y-auto font-sans text-ink" dir="rtl">
      <header className="sticky top-0 bg-surface border-b border-line px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={onClose} className="w-10 h-10 rounded-full border border-line grid place-items-center" aria-label="رجوع">
          <ArrowRight size={18} />
        </button>
        <h1 className="text-body font-semibold truncate">{result?.title || 'نتيجة الامتحان'}</h1>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4 pb-10">
        {error && <p className="text-center text-body text-ink-2 py-16">{error}</p>}
        {!result && !error && <div className="py-20 text-center"><Spinner className="mx-auto !w-8 !h-8" /></div>}

        {result && (
          <>
            <Card className="p-6 text-center space-y-1">
              <p className="text-meta text-ink-2">الدرجة</p>
              <p className="text-display tabular" dir="ltr">{result.score} / {result.total_points}</p>
              <Badge tone={percent >= 60 ? 'success' : 'danger'}>{percent}%</Badge>
            </Card>

            {result.questions.map((q, i) => {
              const essay = q.type === 'essay';
              const full = q.score !== null && q.score >= q.points;
              const zero = !q.score;
              return (
                <Card key={q.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-body font-semibold leading-relaxed"><span className="text-ink-3 ml-1">{i + 1}.</span>{q.text}</p>
                    <Badge tone={full ? 'success' : zero ? 'danger' : 'warning'} className="shrink-0 dir-ltr">
                      {q.score ?? 0} / {q.points}
                    </Badge>
                  </div>

                  {!essay ? (
                    <div className="space-y-1.5">
                      {(q.options || []).map((opt, j) => {
                        const correct = q.correct_option === j;
                        const picked = q.selected_option === j;
                        return (
                          <div key={j} className={`px-3 py-2 rounded-control text-meta flex items-center gap-2 ${
                            correct ? 'bg-success-soft text-success font-semibold' : picked ? 'bg-danger-soft text-danger font-semibold' : 'text-ink-2'
                          }`}>
                            {correct ? <Check size={14} /> : picked ? <X size={14} /> : <span className="w-3.5 grid place-items-center"><span className="w-1.5 h-1.5 rounded-full bg-line-strong" /></span>}
                            <span className="flex-1">{opt}</span>
                            {picked && <span className="text-caption">إجابتك</span>}
                            {correct && !picked && <span className="text-caption">الإجابة الصحيحة</span>}
                          </div>
                        );
                      })}
                      {q.selected_option === null && <p className="text-caption text-ink-3">ماجاوبتش على السؤال ده</p>}
                    </div>
                  ) : (
                    <div className="space-y-2 text-meta">
                      <div className="rounded-control bg-sunken p-3">
                        <p className="text-caption text-ink-3 mb-1">إجابتك</p>
                        <p className="whitespace-pre-wrap">{q.text_answer?.trim() || 'ماكتبتش إجابة'}</p>
                      </div>
                      {q.model_answer && (
                        <div className="rounded-control bg-success-soft text-brand-ink p-3">
                          <p className="text-caption text-success mb-1">الإجابة النموذجية</p>
                          <p className="whitespace-pre-wrap">{q.model_answer}</p>
                        </div>
                      )}
                      {q.feedback && <p className="text-ink-2 flex items-start gap-1.5"><MessageSquare size={14} className="mt-1 text-brand shrink-0" />{q.feedback}</p>}
                    </div>
                  )}
                </Card>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
