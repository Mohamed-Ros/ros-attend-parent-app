export type SmartExamState = 'available' | 'in_progress' | 'submitted' | 'result' | 'upcoming' | 'missed';

export interface SmartExamItem {
  id: number;
  title: string;
  duration_minutes: number | null;
  questions_count: number;
  total_points: number;
  opens_at: string | null;
  closes_at: string | null;
  state: SmartExamState;
  deadline_at: string | null;
  score: number | null;
}

export interface AttemptQuestion {
  id: number;
  type: 'mcq' | 'true_false' | 'essay';
  text: string;
  points: number;
  options: { index: number; text: string }[];
  selected_option: number | null;
  text_answer: string | null;
}

export interface Attempt {
  paper: { id: number; title: string; total_points: number };
  deadline_at: string | null;
  server_time: string;
  questions: AttemptQuestion[];
}

export interface ResultQuestion {
  id: number;
  type: 'mcq' | 'true_false' | 'essay';
  text: string;
  options: string[] | null;
  points: number;
  correct_option: number | null;
  model_answer: string | null;
  selected_option: number | null;
  text_answer: string | null;
  is_correct: boolean | null;
  score: number | null;
  feedback: string | null;
}

export interface ExamResult {
  title: string;
  score: number;
  total_points: number;
  submitted_at: string;
  questions: ResultQuestion[];
}
