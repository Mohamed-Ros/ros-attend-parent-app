import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { ApiClient } from '../services/apiClient';

interface AttendanceProps {
  student: Student;
  onNavigateHome: () => void;
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

export const Attendance: React.FC<AttendanceProps> = ({ student, onNavigateHome }) => {
  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'extra'>('all');
  const [records, setRecords] = useState<AttendanceRecordItem[]>([]);
  const [stats, setStats] = useState({
    attended_count: 0,
    absent_count: 0,
    homework_done_count: 0,
    homework_not_done_count: 0,
    total_count: 0,
    attendance_rate: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student?.id) {
      setLoading(true);
      ApiClient.get<any>(`/parent/student/${student.id}/attendance`)
        .then((res) => {
          if (Array.isArray(res?.records)) {
            setRecords(res.records);
          }
          if (res?.stats) {
            setStats(res.stats);
          }
        })
        .catch((err) => {
          console.warn('[Attendance] Failed to fetch live attendance:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [student?.id]);

  const filteredRecords = records.filter((rec) => {
    if (filter === 'present') return rec.status === 'present';
    if (filter === 'absent') return rec.status === 'absent';
    if (filter === 'extra') return rec.isExtra;
    return true;
  });

  const presentCount = records.filter(r => r.status === 'present').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const extraCount = records.filter(r => r.isExtra).length;

  return (
    <div className="space-y-4 pb-28 font-['Cairo'] selection:bg-emerald-700 selection:text-white">
      {/* ── Standalone Top Back Button Bar ── */}
      <div className="flex items-center justify-start">
        <button
          onClick={onNavigateHome}
          className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 flex items-center gap-2 text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
          title="رجوع للرئيسية"
        >
          <i className="fa-solid fa-arrow-right text-xs text-emerald-700" />
          <span>رجوع</span>
        </button>
      </div>

      {/* ── Top Banner Header ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="text-right space-y-0.5">
            <h2 className="text-lg font-black text-slate-900 leading-tight">سجل الحضور والواجبات</h2>
            <p className="text-xs font-semibold text-slate-500">متابعة مواعيد الحضور وموقفه من الواجب</p>
          </div>

          <div className="px-3 py-1.5 bg-[#e8f6f0] text-[#065A4B] border border-[#b2e2d0] rounded-full text-xs font-black shrink-0 flex items-center gap-1.5">
            <i className="fa-solid fa-chart-line text-emerald-600 text-xs" />
            <span>{stats.attendance_rate}% حضور</span>
          </div>
        </div>

        {/* Homework Stats summary */}
        {(stats.homework_done_count > 0 || stats.homework_not_done_count > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              <i className="fa-solid fa-[#059669] fa-check ml-1" />
              الواجبات المكتملة: {stats.homework_done_count}
            </span>
            {stats.homework_not_done_count > 0 && (
              <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                <i className="fa-solid fa-xmark ml-1" />
                الواجبات المفقودة: {stats.homework_not_done_count}
              </span>
            )}
          </div>
        )}

        {/* Elegant Underline Accent Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-emerald-500/80 via-emerald-300/40 to-transparent mt-4 rounded-full" />
      </div>

      {/* ── Filter Switcher Bar ── */}
      <div className="grid grid-cols-4 p-1.5 bg-slate-100/90 border border-slate-200/70 rounded-2xl gap-1 text-[11px] font-black sm:text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`py-2 px-1 rounded-xl font-black transition-all cursor-pointer text-center ${
            filter === 'all' ? 'bg-white text-[#065A4B] shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          الكل ({records.length})
        </button>
        <button
          onClick={() => setFilter('present')}
          className={`py-2 px-1 rounded-xl font-black transition-all cursor-pointer text-center ${
            filter === 'present' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          حاضر ({presentCount})
        </button>
        <button
          onClick={() => setFilter('absent')}
          className={`py-2 px-1 rounded-xl font-black transition-all cursor-pointer text-center ${
            filter === 'absent' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          غائب ({absentCount})
        </button>
        <button
          onClick={() => setFilter('extra')}
          className={`py-2 px-1 rounded-xl font-black transition-all cursor-pointer text-center ${
            filter === 'extra' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          إضافية ({extraCount})
        </button>
      </div>

      {/* ── Timeline Attendance Cards List ── */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold space-y-2">
            <i className="fa-solid fa-circle-notch animate-spin text-lg text-emerald-600 block" />
            جاري تحميل سجل الحضور والواجبات...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold bg-white border border-slate-100 rounded-3xl p-6">
            لا توجد سجلات تطابق التصفية
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-100 border-b-2 border-b-emerald-500/30 rounded-3xl p-4 flex items-center justify-between shadow-xs hover:border-emerald-500/50 transition-all text-right"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    rec.status === 'present'
                      ? 'bg-[#e8f6f0] border-[#b2e2d0] text-[#059669]'
                      : 'bg-[#fde8e8] border-[#f8b4b4] text-[#e11d48]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      rec.status === 'present' ? 'bg-[#059669] text-white' : 'bg-[#e11d48] text-white'
                    }`}
                  >
                    <i className={`fa-solid ${rec.status === 'present' ? 'fa-check' : 'fa-xmark'}`} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-black text-slate-900">{rec.topic}</h4>
                    {rec.isExtra && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-black rounded-md border border-amber-200 inline-flex items-center gap-1 shrink-0">
                        <i className="fa-solid fa-star text-amber-500 text-[9px]" />
                        حصة إضافية
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <i className="fa-regular fa-calendar text-[10px] text-slate-400" />
                      {rec.date}
                    </span>
                    {rec.time !== '—' && (
                      <span className="flex items-center gap-1">
                        <i className="fa-regular fa-clock text-[10px] text-slate-400" />
                        {rec.time}
                      </span>
                    )}
                  </p>

                  {/* Homework Badge */}
                  {rec.status === 'present' && rec.homework_status && rec.homework_status !== 'none' && (
                    <div className="pt-0.5">
                      {rec.homework_status === 'done' ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 inline-flex items-center gap-1">
                          <i className="fa-solid fa-book-bookmark text-[9px]" />
                          الواجب: تم التسليم ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/70 inline-flex items-center gap-1">
                          <i className="fa-solid fa-book-bookmark text-[9px]" />
                          الواجب: لم يتم التسليم ✗
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 shrink-0 ${
                  rec.status === 'present'
                    ? 'bg-[#e8f6f0] text-[#065A4B] border-[#b2e2d0]'
                    : 'bg-[#fde8e8] text-[#9f1239] border-[#f8b4b4]'
                }`}
              >
                <i
                  className={`fa-solid fa-circle text-[6px] ${
                    rec.status === 'present' ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                />
                {rec.status === 'present' ? 'حاضر' : 'غائب'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
