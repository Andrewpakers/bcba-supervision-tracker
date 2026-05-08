export interface Profile {
  id: string;
  full_name: string;
  email: string;
  certification_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface RBT {
  id: string;
  bcba_id: string;
  full_name: string;
  certification_number: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  bcba_id: string;
  full_name: string;
  date_of_birth: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyHours {
  id: string;
  bcba_id: string;
  rbt_id: string;
  month: number;
  year: number;
  total_practice_hours: number;
  required_supervision_hours: number;
  created_at: string;
  updated_at: string;
}

export interface SupervisionSession {
  id: string;
  bcba_id: string;
  rbt_id: string;
  client_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupervisionSessionWithDetails extends SupervisionSession {
  rbts: { full_name: string };
  clients: { full_name: string };
}

export interface RBTSupervisionTally {
  rbt: RBT;
  totalPracticeHours: number;
  requiredHours: number;
  supervisedHours: number;
  remainingHours: number;
}
