import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { ApiClient } from '../services/apiClient';
import { SmartExamsSection } from '../components/smartExams/SmartExamsSection';

interface ExamsProps {
  student: Student;
  onNavigateHome: () => void;
}

interface ExamScoreItem {
  id: number | string;
  name: string;
  date: string;
  score: number | null;
  max_score: number;
  type: string;
  category: 'sheet' | 'comprehensive';
  percent: number | null;
  absent?: boolean;
}

export const Exams: React.FC<ExamsProps> = ({ student, onNavigateHome }) => {
  const [filter, setFilter] = useState<'all' | 'sheet' | 'comprehensive'>('all');
  const [examScores, setExamScores] = useState<ExamScoreItem[]>([]);
  const [average, setAverage] = useState<number>(student.exam_average ?? 0);
  const [rank, setRank] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (student?.id) {
      setLoading(true);
      ApiClient.get<any>(`/parent/student/${student.id}/exams?include_absent=1`)
        .then((res) => {
          if (Array.isArray(res?.exams)) {
            setExamScores(res.exams);
          }
          if (typeof res?.average === 'number') {
            setAverage(res.average);
          }
          if (typeof res?.rank === 'number') {
            setRank(res.rank);
          }
        })
        .catch((err) => {
          console.warn('[Exams] Failed to fetch live exam scores:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [student?.id, reloadKey]);

  const filteredExams = examScores.filter((e) => {
    if (filter === 'sheet') return e.category === 'sheet';
    if (filter === 'comprehensive') return e.category === 'comprehensive';
    return true;
  });

  return (
    <div className="space-y-4 pb-28 font-['Cairo'] selection:bg-emerald-700 selection:text-white">
      {/* ── Standalone Top Back Button Bar ── */}
      <div className="flex items-center justify-start">
        <button
          onClick={onNavigateHome}
          className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 flex items-center gap-2 text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
          title="رجوع للرئيسية"
        >
          <i className="fa-solid fa-arrow-right text-xs text-indigo-700" />
          <span>رجوع</span>
        </button>
      </div>

      {/* ── Top Header Banner ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="text-right space-y-0.5">
            <h2 className="text-lg font-black text-slate-900 leading-tight">نتائج الاختبارات والتقييم</h2>
            <p className="text-xs font-semibold text-slate-500">متابعة الأداء والمستوى العلمي للطالب</p>
          </div>

          <div className="px-3 py-1.5 bg-[#e0e7ff] text-[#3730a3] border border-[#c7d2fe] rounded-full text-xs font-black shrink-0 flex items-center gap-1.5">
            <i className="fa-solid fa-award text-indigo-600 text-xs" />
            <span>المستوى: {average >= 90 ? 'ممتاز' : (average >= 75 ? 'جيد جداً' : 'مقبول')}</span>
          </div>
        </div>

        {/* Indigo Underline Accent Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-indigo-500/80 via-indigo-300/40 to-transparent mt-4 rounded-full" />
      </div>

      {/* ── Average Performance Card ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-3 shadow-xs text-right">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">متوسط درجات الطالب</span>
            <span className="text-2xl font-black text-[#4f46e5]">{average}%</span>
          </div>

          <div className="text-center px-4 py-2 bg-[#fef3c7] border border-[#fde68a] rounded-2xl shrink-0">
            <span className="block text-[10px] font-extrabold text-[#92400e]">ترتيب المجموعة</span>
            <span className="text-sm font-black text-[#d97706] flex items-center justify-center gap-1 mt-0.5">
              <i className="fa-solid fa-trophy text-amber-500 text-xs" />
              المركز #{rank}
            </span>
          </div>
        </div>
      </div>

      {/* ── Online smart exams (taken in the app) ── */}
      <SmartExamsSection studentId={student.id} onResultsChanged={() => setReloadKey(k => k + 1)} />

      {/* ── Responsive Filter Switcher ── */}
      <div className="grid grid-cols-3 p-1.5 bg-slate-100/90 border border-slate-200/70 rounded-2xl gap-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`py-2 px-1 rounded-xl font-black transition-all cursor-pointer text-center ${
            filter === 'all' ? 'bg-white text-[#4f46e5] shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          الكل ({examScores.length})
        </button>
        <button
          onClick={() => setFilter('sheet')}
          className={`py-2 px-1 rounded-xl font-black transition-all cursor-pointer text-center ${
            filter === 'sheet' ? 'bg-white text-[#4f46e5] shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          شيتات أسبوعية
        </button>
        <button
          onClick={() => setFilter('comprehensive')}
          className={`py-2 px-1 rounded-xl font-black transition-all cursor-pointer text-center ${
            filter === 'comprehensive' ? 'bg-white text-[#4f46e5] shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          امتحانات شاملة
        </button>
      </div>

      {/* ── Exam Score Cards List ── */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold space-y-2">
            <i className="fa-solid fa-circle-notch animate-spin text-lg text-indigo-600 block" />
            جاري تحميل درجات الاختبارات...
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-white border border-slate-100 rounded-3xl p-6">
            لا توجد درجات اختبارات تطابق التصفية
          </div>
        ) : (
          filteredExams.map((exam) => {
            const absent = exam.absent || exam.score === null;
            const percent = absent ? 0 : (exam.percent ?? Math.round(((exam.score ?? 0) / exam.max_score) * 100));
            return (
              <div
                key={exam.id}
                className="bg-white border border-slate-100 border-b-2 border-b-indigo-500/30 rounded-3xl p-5 space-y-3 shadow-xs hover:border-indigo-500/50 transition-all text-right"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 bg-[#e0e7ff] text-[#3730a3] text-[10px] font-black rounded-md border border-[#c7d2fe] inline-block">
                      {exam.type}
                    </span>
                    <h4 className="text-base font-black text-slate-900">{exam.name}</h4>
                    <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <i className="fa-regular fa-calendar text-[10px] text-slate-400" />
                      {exam.date}
                    </p>
                  </div>

                  {absent ? (
                    <div className="text-center px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-2xl shrink-0">
                      <span className="block text-sm font-black text-rose-700">غائب</span>
                      <span className="text-[10px] font-bold text-rose-500">ملوش درجة</span>
                    </div>
                  ) : (
                    <div className="text-center px-3.5 py-2 bg-[#e8f6f0] border border-[#b2e2d0] rounded-2xl shrink-0">
                      <span className="block text-lg font-black text-[#065A4B] dir-ltr">
                        {exam.score} / {exam.max_score}
                      </span>
                      <span className="text-[10px] font-black text-[#059669]">{percent}%</span>
                    </div>
                  )}
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                  <div
                    className="h-full bg-gradient-to-r from-[#059669] to-[#34d399] rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
