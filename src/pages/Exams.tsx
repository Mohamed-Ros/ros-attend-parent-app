import React, { useState, useEffect } from 'react';
import { BarChart3, ClipboardX, GraduationCap } from 'lucide-react';
import { Student } from '../types';
import { ApiClient } from '../services/apiClient';
import { SmartExamsSection } from '../components/smartExams/SmartExamsSection';
import { CapArt } from '../components/CapArt';
import { Badge, Card, Chip, ChipRow, EmptyState, LoadingBlock, MetricCard, ProgressBar, StatStrip, StatusPill } from '../components/ui';

interface ExamsProps {
  student: Student;
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

type Filter = 'all' | 'sheet' | 'comprehensive';

const levelOf = (avg: number) => (avg >= 90 ? 'ممتاز' : avg >= 75 ? 'جيد جداً' : avg >= 50 ? 'مقبول' : 'يحتاج دعم');

export const Exams: React.FC<ExamsProps> = ({ student }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [examScores, setExamScores] = useState<ExamScoreItem[]>([]);
  const [average, setAverage] = useState<number>(student.exam_average ?? 0);
  const [rank, setRank] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!student?.id) return;
    setLoading(true);
    ApiClient.get<any>(`/parent/student/${student.id}/exams?include_absent=1`)
      .then((res) => {
        if (Array.isArray(res?.exams)) setExamScores(res.exams);
        if (typeof res?.average === 'number') setAverage(res.average);
        if (typeof res?.rank === 'number') setRank(res.rank);
      })
      .catch((err) => console.warn('[Exams] Failed to fetch live exam scores:', err))
      .finally(() => setLoading(false));
  }, [student?.id, reloadKey]);

  const visible = examScores.filter((e) => (filter === 'all' ? true : e.category === filter));

  return (
    <div className="space-y-5">
      <MetricCard
        icon={GraduationCap}
        label="متوسط الدرجات"
        tone="info"
        value={average}
        unit="%"
        art={<CapArt palette="blue" className="w-full h-auto drop-shadow-md" />}
        pill={
          <StatusPill tone={average >= 75 ? 'success' : average >= 50 ? 'info' : 'warning'} icon={BarChart3}>
            {levelOf(average)}
          </StatusPill>
        }
      />
      <StatStrip
        items={[
          { label: 'ترتيب المجموعة', value: `#${rank}` },
          { label: 'عدد الاختبارات', value: examScores.length },
        ]}
      />

      <SmartExamsSection studentId={student.id} onResultsChanged={() => setReloadKey((k) => k + 1)} />

      <ChipRow>
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>
          الكل ({examScores.length})
        </Chip>
        <Chip selected={filter === 'sheet'} onClick={() => setFilter('sheet')}>
          شيتات أسبوعية
        </Chip>
        <Chip selected={filter === 'comprehensive'} onClick={() => setFilter('comprehensive')}>
          امتحانات شاملة
        </Chip>
      </ChipRow>

      {loading ? (
        <LoadingBlock label="جارٍ تحميل الدرجات" />
      ) : visible.length === 0 ? (
        <EmptyState icon={ClipboardX} title="لا توجد درجات" hint="جرّب تغيير التصفية" />
      ) : (
        <ul className="space-y-3">
          {visible.map((exam) => {
            const absent = exam.absent || exam.score === null;
            const percent = absent ? 0 : exam.percent ?? Math.round(((exam.score ?? 0) / exam.max_score) * 100);
            return (
              <li key={exam.id}>
                <Card className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <Badge tone="info">{exam.type}</Badge>
                      <h3 className="text-body font-semibold">{exam.name}</h3>
                      <p className="text-meta text-ink-2">{exam.date}</p>
                    </div>
                    {absent ? (
                      <Badge tone="danger">غائب</Badge>
                    ) : (
                      <div className="text-left shrink-0">
                        <div className="text-title tabular dir-ltr">
                          {exam.score} / {exam.max_score}
                        </div>
                        <div className="text-caption text-ink-2 tabular">{percent}%</div>
                      </div>
                    )}
                  </div>
                  {!absent && <ProgressBar value={percent} tone={percent >= 60 ? 'brand' : 'danger'} label={`${percent}%`} />}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
