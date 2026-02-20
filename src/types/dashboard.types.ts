export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertType = 'trc_expired' | 'trc_expiring' | 'cert_expired' | 'cert_expiring' | 'budget_overrun' | 'budget_warning' | 'missing_docs';

export interface Alert {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  workerId?: number;
  projectId?: number;
  daysLeft?: number;
}

export interface DashboardSummary {
  activeWorkers: number;
  totalWorkers: number;
  activeProjects: number;
  totalProjects: number;
  totalExpenses: number;
  pipelineCandidates: number;
  alertsCount: number;
  warningsCount: number;
  projectSummaries: {
    id: number;
    name: string;
    phase: string;
    totalBudget: number;
    totalActual: number;
    workerCount: number;
    progress: number;
  }[];
  monthlyCosts: { month: string; amount: number }[];
}
