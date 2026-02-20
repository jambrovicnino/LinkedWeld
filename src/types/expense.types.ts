export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface Expense {
  id: number;
  project_id: number | null;
  worker_id: number | null;
  category_id: number;
  amount: number;
  currency: string;
  description: string;
  expense_date: string;
  is_recurring: number;
  recurrence_interval: string | null;
  notes: string;
  categoryName?: string;
  projectName?: string | null;
  workerName?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSummary {
  total: number;
  byCategory: { category: string; amount: number; color: string }[];
  byProject: { project: string; amount: number }[];
  byMonth: { month: string; amount: number }[];
}
