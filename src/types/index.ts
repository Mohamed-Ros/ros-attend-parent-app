export interface Student {
  id: string | number;
  name: string;
  phone?: string;
  parent_phone?: string;
  center_phone?: string;
  group_id?: string | number;
  qr_code?: string;
  medallion_number?: number | null;
  subscription_type?: 'session' | 'monthly';
  monthly_price?: number;
  remaining_amount?: number;
  reservation_amount?: number;
  exemption_type?: 'no_exemption' | 'partial_exemption' | 'full_exemption';
  status?: string;
  group?: Group;
  attended_count?: number;
  absent_count?: number;
  homework_done_count?: number;
  homework_not_done_count?: number;
  attendance_rate?: number;
  exam_average?: number;
}

export interface Group {
  id: string | number;
  name: string;
  location_name?: string;
  price?: number;
  monthly_price?: number;
  extra_session_price?: number;
  sessions_per_cycle?: number;
  center_phone?: string;
  time?: string;
  days?: string[];
}

export interface GroupCycle {
  id: string | number;
  group_id: string | number;
  cycle_number: number;
  sessions_count: number;
  sessions_per_cycle: number;
  started_at?: string;
  closed_at?: string | null;
  is_closed?: boolean;
}

export interface AttendanceRecord {
  id: string | number;
  student_id: string | number;
  group_id: string | number;
  lesson_id?: string | number;
  date: string;
  status: 'present' | 'absent';
  homework_status?: 'done' | 'not_done' | 'none';
  is_extra?: boolean;
  lesson?: Lesson;
}

export interface Lesson {
  id: string | number;
  group_id: string | number;
  cycle_id?: string | number;
  date: string;
  start_time?: string;
  status: 'scheduled' | 'opened' | 'closed';
  is_extra?: boolean;
  notes?: string;
}

export interface Payment {
  id: string | number;
  student_id: string | number;
  amount: number;
  date: string;
  payment_type: 'session' | 'monthly' | 'reservation' | 'extra_session' | 'booklet';
  for_month?: string;
  status?: string;
}

export interface ExamScore {
  id: string | number;
  exam_id: string | number;
  exam_name: string;
  date: string;
  score: number;
  max_score: number;
  type?: 'sheet' | 'comprehensive';
  passing?: boolean;
}
