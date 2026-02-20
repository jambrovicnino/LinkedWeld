export type ProjectPhase = 'mobilization' | 'active' | 'finishing' | 'completed';
export type BudgetHealth = 'ok' | 'warning' | 'danger';

export interface Project {
  id: number;
  name: string;
  client: string;
  location: string;
  country: string;
  phase: ProjectPhase;
  start_date: string;
  expected_end_date: string;
  progress: number;
  budget_labor: number;
  budget_transport: number;
  budget_accommodation: number;
  budget_tools: number;
  budget_per_diem: number;
  budget_other: number;
  actual_labor: number;
  actual_transport: number;
  actual_accommodation: number;
  actual_tools: number;
  actual_per_diem: number;
  actual_other: number;
  notes: string;
  workerCount?: number;
  totalBudget?: number;
  totalActual?: number;
  budgetHealth?: BudgetHealth;
  created_at: string;
  updated_at: string;
}

export interface ProjectWorker {
  id: number;
  project_id: number;
  worker_id: number;
  assigned_date: string;
  removed_date: string | null;
  workerName?: string;
  nationality?: string;
  weldingTypes?: string[];
}
