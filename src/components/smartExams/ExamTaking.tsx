import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { ApiClient } from '../../services/apiClient';
import { Attempt, AttemptQuestion } from './types';

interface Props {
  studentId: string | number;
  paperId: number;
  onClose: (submitted: boolean) => void;
}

type Answers = Record<number, { selected_option?: number | null; text_answer?: string | null }>;

const SAVE_DEBOUNCE_MS = 1500;

const pad = (n: number) => String(n).padStart(2, '0');
const formatLeft = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  return h > 0 ? `${h}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};

export const ExamTaking: React.FC<Props> = ({ studentId, paperId, onClose: onCloseProp }) => {
  const base = `/parent/student/${studentId}/smart-exams/${paperId}`;
  // The parent passes a new function each render; keep the latest without re-running effects.
  const onCloseRef = useRef(onCloseProp);
  onCloseRef.current = onCloseProp;
  const onClose = useCallback((submitted: boolean) => onCloseRef.current(submitted), []);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [current, setCurrent] = useState(0);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const clockOffset = useRef(0);
  const pending = useRef<Set<number>>(new Set());
  const saveTimer = useRef<number | null>(null);
  const finished = useRef(false);

  // Load / resume the attempt.
  useEffect(() => {
    ApiClient.post<Attempt>(`${base}/start`)
      .then(a => {
        clockOffset.current = new Date(a.server_time).getTime() - Date.now();
        const initial: Answers = {};
        a.questions.forEach(q => { initial[q.id] = { selected_option: q.selected_option, text_answer: q.text_answer }; });
        setAnswers(initial);
        setAttempt(a);
      })
      .catch((e: any) => {
        Swal.fire({ icon: 'info', title: 'مش متاح', text: e?.message, confirmButtonColor: '#065F46' });
        onClose(e?.data?.state === 'submitted');
      });
  }, [base, onClose]);

  const deadline = attempt?.deadline_at ? new Date(attempt.deadline_at).getTime() : null;
  const msLeft = deadline ? deadline - (now + clockOffset.current) : null;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const payloadFor = (ids: number[], from: Answers) => ids.map(id => ({ question_id: id, ...from[id] }));

  const flush = useCallback(async (from: Answers) => {
    if (pending.current.size === 0 || finished.current) return true;
    const ids = Array.from(pending.current);
    pending.current.clear();
    setSaveState('saving');
    try {
      await ApiClient.request(`${base}/answers`, { method: 'PUT', body: JSON.stringify({ answers: payloadFor(ids, from) }) });
      setSaveState('saved');
      return true;
    } catch (e: any) {
      ids.forEach(id => pending.current.add(id));
      if (e?.status === 409) {
        finished.current = true;
        Swal.fire({ icon: 'info', title: 'الوقت خلص', text: e?.message || 'اتسلّم الامتحان تلقائياً.', confirmButtonColor: '#065F46' }).then(() => onClose(true));
      } else {
        setSaveState('offline');
      }
      return false;
    }
  }, [base, onClose]);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const update = (q: AttemptQuestion, value: { selected_option?: number | null; text_answer?: string | null }) => {
    const next = { ...answersRef.current, [q.id]: { ...answersRef.current[q.id], ...value } };
    setAnswers(next);
    pending.current.add(q.id);
    setSaveState('saving');
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => flush(answersRef.current), q.type === 'essay' ? SAVE_DEBOUNCE_MS : 300);
  };

  // Retry unsaved answers when the connection comes back.
  useEffect(() => {
    if (saveState !== 'offline') return;
    const t = setInterval(() => flush(answersRef.current), 5000);
    return () => clearInterval(t);
  }, [saveState, flush]);

  const submit = useCallback(async (auto = false) => {
    if (!attempt || finished.current) return;
    setSubmitting(true);
    try {
      const res = await ApiClient.post<{ message: string }>(`${base}/submit`, { answers: payloadFor(attempt.questions.map(q => q.id), answersRef.current) });
      finished.current = true;
      await Swal.fire({ icon: 'success', title: auto ? 'الوقت خلص واتسلّم الامتحان' : 'تم التسليم ✅', text: res.message, confirmButtonColor: '#065F46' });
      onClose(true);
    } catch (e: any) {
      if (e?.status === 409) {
        finished.current = true;
        onClose(true);
      } else {
        Swal.fire({ icon: 'error', title: 'تعذر التسليم', text: 'اتأكد من الإنترنت وحاول تاني — إجاباتك محفوظة.', confirmButtonColor: '#065F46' });
      }
    } finally {
      setSubmitting(false);
    }
  }, [attempt, base, onClose]);

  // Time up: submit what is there.
  useEffect(() => {
    if (msLeft !== null && msLeft <= 0 && !finished.current && !submitting) submit(true);
  }, [msLeft, submit, submitting]);

  const answeredCount = useMemo(() => attempt?.questions.filter(q => {
    const a = answers[q.id];
    return q.type === 'essay' ? !!a?.text_answer?.trim() : a?.selected_option !== null && a?.selected_option !== undefined;
  }).length ?? 0, [attempt, answers]);

  const confirmSubmit = async () => {
    if (!attempt) return;
    const left = attempt.questions.length - answeredCount;
    const res = await Swal.fire({
      icon: left > 0 ? 'warning' : 'question',
      title: 'تسليم الامتحان؟',
      text: left > 0 ? `فيه ${left} سؤال لسه مجاوبتش عليهم. بعد التسليم مش هتقدر تعدّل.` : 'بعد التسليم مش هتقدر تعدّل إجاباتك.',
      showCancelButton: true,
      confirmButtonText: 'سلّم',
      cancelButtonText: 'رجوع',
      confirmButtonColor: '#065F46',
    });
    if (res.isConfirmed) submit(false);
  };

  const leave = async () => {
    await flush(answersRef.current);
    const res = await Swal.fire({
      icon: 'question', title: 'الخروج من الامتحان؟',
      text: deadline ? 'إجاباتك محفوظة، والوقت هيفضل شغال. لو الوقت خلص الامتحان هيتسلّم تلقائياً.' : 'إجاباتك محفوظة وتقدر تكمّل بعدين.',
      showCancelButton: true, confirmButtonText: 'خروج', cancelButtonText: 'كمّل الحل', confirmButtonColor: '#64748b',
    });
    if (res.isConfirmed) onClose(false);
  };

  if (!attempt) {
    return (
      <div className="fixed inset-0 z-[70] bg-white flex items-center justify-center font-['Cairo']">
        <i className="fa-solid fa-circle-notch animate-spin text-3xl text-emerald-700" />
      </div>
    );
  }

  const q = attempt.questions[current];
  const a = answers[q.id] || {};
  const urgent = msLeft !== null && msLeft < 60_000;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-50 flex flex-col font-['Cairo'] text-slate-900" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={leave} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center" aria-label="خروج">
          <i className="fa-solid fa-xmark" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-black truncate">{attempt.paper.title}</h1>
          <p className="text-[11px] font-bold text-slate-500">
            جاوبت {answeredCount} من {attempt.questions.length}
            <span className={`mr-2 ${saveState === 'offline' ? 'text-rose-600' : 'text-slate-400'}`}>
              {saveState === 'saving' ? '· بيحفظ…' : saveState === 'offline' ? '· مش متصل — هيتحفظ لما النت يرجع' : '· اتحفظ'}
            </span>
          </p>
        </div>
        {msLeft !== null && (
          <div className={`px-3 py-1.5 rounded-xl text-sm font-black tabular-nums flex items-center gap-1.5 ${urgent ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-emerald-50 text-emerald-800'}`} dir="ltr">
            <i className="fa-regular fa-clock text-xs" />{formatLeft(msLeft)}
          </div>
        )}
      </header>

      {/* Question navigator */}
      <div className="bg-white border-b border-slate-100 px-4 py-2 flex gap-1.5 overflow-x-auto">
        {attempt.questions.map((qq, i) => {
          const aa = answers[qq.id];
          const done = qq.type === 'essay' ? !!aa?.text_answer?.trim() : aa?.selected_option !== null && aa?.selected_option !== undefined;
          return (
            <button key={qq.id} onClick={() => setCurrent(i)}
              className={`w-9 h-9 rounded-xl text-xs font-black shrink-0 border ${
                i === current ? 'bg-[#065F46] text-white border-[#065F46]' : done ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-white text-slate-500 border-slate-200'
              }`}>{i + 1}</button>
          );
        })}
      </div>

      {/* Question */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-black text-slate-500">
            <span>سؤال {current + 1} من {attempt.questions.length}</span>
            <span>{q.points} {q.points === 1 ? 'درجة' : 'درجات'}</span>
          </div>
          <p className="text-lg font-black leading-relaxed whitespace-pre-wrap">{q.text}</p>

          {q.type !== 'essay' ? (
            <div className="space-y-2.5">
              {q.options.map(opt => {
                const chosen = a.selected_option === opt.index;
                return (
                  <button key={opt.index} onClick={() => update(q, { selected_option: chosen ? null : opt.index })}
                    className={`w-full text-right p-4 rounded-2xl border-2 flex items-center gap-3 transition-colors active:scale-[0.99] ${
                      chosen ? 'border-[#065F46] bg-emerald-50' : 'border-slate-200 bg-white'
                    }`}>
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${chosen ? 'border-[#065F46] bg-[#065F46] text-white' : 'border-slate-300'}`}>
                      {chosen && <i className="fa-solid fa-check text-[10px]" />}
                    </span>
                    <span className="text-sm font-bold">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <textarea
              value={a.text_answer || ''}
              onChange={e => update(q, { text_answer: e.target.value })}
              rows={8}
              placeholder="اكتب إجابتك هنا…"
              className="w-full rounded-2xl border-2 border-slate-200 focus:border-[#065F46] bg-white p-4 text-sm font-bold outline-none leading-relaxed"
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 p-3 flex items-center gap-2" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="h-12 px-4 rounded-2xl bg-slate-100 text-slate-700 text-sm font-black disabled:opacity-40">
          <i className="fa-solid fa-arrow-right ml-1" />السابق
        </button>
        <div className="flex-1" />
        {current < attempt.questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} className="h-12 px-5 rounded-2xl bg-[#065F46] text-white text-sm font-black">
            التالي<i className="fa-solid fa-arrow-left mr-1" />
          </button>
        ) : (
          <button onClick={confirmSubmit} disabled={submitting} className="h-12 px-5 rounded-2xl bg-[#065F46] text-white text-sm font-black disabled:opacity-50">
            {submitting ? <i className="fa-solid fa-circle-notch animate-spin" /> : <><i className="fa-solid fa-paper-plane ml-1" />تسليم</>}
          </button>
        )}
      </footer>
    </div>
  );
};
