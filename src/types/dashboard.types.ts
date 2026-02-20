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

export interface MonthlyCost {
  month: string;
  labor: number;
  transport: number;
  accommodation: number;
  other: number;
}

export interface DashboardSummary {
  activeWorkers: number;
  totalWorkers: number;
  activeProjects: number;
  totalExpenses: number;
  pipelineCandidates: number;
  trcExpiring: number;
  budgetWarnings: number;
  monthlyCosts: MonthlyCost[];
  recentArrivals: number;
  docsPending: number;
  criticalAlerts: number;
}
