import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import {
  UserPlus, FileCheck, Shield, Plane,
  FolderKanban, ClipboardCheck, Receipt, RefreshCw,
  ChevronRight,
} from 'lucide-react';
import type { DashboardSummary, Alert } from '@/types';

interface Props {
  stats: DashboardSummary | null;
  alerts: Alert[];
}

interface Step {
  icon: React.ElementType;
  label: string;
  metric: string;
  sub: string;
  route: string;
  health: 'green' | 'amber' | 'red';
}

export function ProcessDiagram({ stats, alerts }: Props) {
  const navigate = useNavigate();

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const steps: Step[] = [
    {
      icon: UserPlus,
      label: 'Recruit',
      metric: `${stats?.pipelineCandidates ?? 0}`,
      sub: 'in pipeline',
      route: ROUTES.PIPELINE,
      health: (stats?.pipelineCandidates ?? 0) > 0 ? 'green' : 'amber',
    },
    {
      icon: FileCheck,
      label: 'Documents',
      metric: `${stats?.docsPending ?? 0}`,
      sub: 'pending',
      route: ROUTES.WORKERS,
      health: (stats?.docsPending ?? 0) === 0 ? 'green' : (stats?.docsPending ?? 0) > 10 ? 'red' : 'amber',
    },
    {
      icon: Shield,
      label: 'Visa / TRC',
      metric: `${stats?.trcExpiring ?? 0}`,
      sub: 'expiring',
      route: ROUTES.ALERTS,
      health: (stats?.trcExpiring ?? 0) === 0 ? 'green' : (stats?.trcExpiring ?? 0) > 3 ? 'red' : 'amber',
    },
    {
      icon: Plane,
      label: 'Arrive',
      metric: `${stats?.recentArrivals ?? 0}`,
      sub: 'new arrivals',
      route: ROUTES.PIPELINE,
      health: 'green',
    },
    {
      icon: FolderKanban,
      label: 'Assign',
      metric: `${stats?.activeProjects ?? 0}`,
      sub: 'active projects',
      route: ROUTES.PROJECTS,
      health: (stats?.activeProjects ?? 0) > 0 ? 'green' : 'amber',
    },
    {
      icon: ClipboardCheck,
      label: 'Track',
      metric: `${stats?.activeWorkers ?? 0}`,
      sub: 'active workers',
      route: ROUTES.WORKERS,
      health: (stats?.activeWorkers ?? 0) > 0 ? 'green' : 'amber',
    },
    {
      icon: Receipt,
      label: 'Finance',
      metric: `€${((stats?.totalExpenses ?? 0) / 1000).toFixed(0)}k`,
      sub: 'this period',
      route: ROUTES.EXPENSES,
      health: (stats?.budgetWarnings ?? 0) > 0 ? 'amber' : 'green',
    },
    {
      icon: RefreshCw,
      label: 'Renew',
      metric: `${criticalCount + warningCount}`,
      sub: 'alerts',
      route: ROUTES.ALERTS,
      health: criticalCount > 0 ? 'red' : warningCount > 0 ? 'amber' : 'green',
    },
  ];

  const colorMap = {
    green: {
      border: 'border-emerald-200 hover:border-emerald-400',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      metric: 'text-emerald-700',
      dot: 'bg-emerald-400',
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      metric: 'text-amber-700',
      dot: 'bg-amber-400',
    },
    red: {
      border: 'border-red-200 hover:border-red-400',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      metric: 'text-red-700',
      dot: 'bg-red-400',
    },
  };

  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-4 shadow-sm'>
      <div className='flex items-center gap-2 mb-4'>
        <div className='h-2 w-2 rounded-full bg-blue-500 animate-pulse' />
        <h2 className='text-sm font-semibold text-gray-600 uppercase tracking-wider'>Business Lifecycle</h2>
      </div>

      {/* Desktop: horizontal flow */}
      <div className='hidden lg:flex items-stretch gap-0'>
        {steps.map((step, i) => {
          const c = colorMap[step.health];
          const Icon = step.icon;
          return (
            <div key={step.label} className='flex items-stretch flex-1 min-w-0'>
              <button
                onClick={() => navigate(step.route)}
                className={`flex-1 rounded-xl border-2 ${c.border} ${c.bg} p-3 flex flex-col items-center gap-1.5 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer min-w-0`}
              >
                <div className={`h-9 w-9 rounded-lg ${c.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${c.iconText}`} />
                </div>
                <span className='text-[11px] font-semibold text-gray-500 uppercase tracking-wide'>{step.label}</span>
                <span className={`text-lg font-bold ${c.metric} leading-none`}>{step.metric}</span>
                <span className='text-[10px] text-gray-400 leading-tight'>{step.sub}</span>
                <div className={`h-1.5 w-1.5 rounded-full ${c.dot} mt-0.5`} />
              </button>
              {i < steps.length - 1 && (
                <div className='flex items-center px-1 shrink-0'>
                  <ChevronRight className='h-4 w-4 text-gray-300' />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tablet: 4 columns */}
      <div className='hidden sm:grid lg:hidden grid-cols-4 gap-2'>
        {steps.map((step) => {
          const c = colorMap[step.health];
          const Icon = step.icon;
          return (
            <button
              key={step.label}
              onClick={() => navigate(step.route)}
              className={`rounded-xl border-2 ${c.border} ${c.bg} p-3 flex flex-col items-center gap-1.5 transition-all hover:shadow-md cursor-pointer`}
            >
              <div className={`h-8 w-8 rounded-lg ${c.iconBg} flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${c.iconText}`} />
              </div>
              <span className='text-[10px] font-semibold text-gray-500 uppercase'>{step.label}</span>
              <span className={`text-base font-bold ${c.metric} leading-none`}>{step.metric}</span>
              <span className='text-[9px] text-gray-400'>{step.sub}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile: 2×4 grid */}
      <div className='grid sm:hidden grid-cols-2 gap-2'>
        {steps.map((step) => {
          const c = colorMap[step.health];
          const Icon = step.icon;
          return (
            <button
              key={step.label}
              onClick={() => navigate(step.route)}
              className={`rounded-xl border-2 ${c.border} ${c.bg} p-3 flex items-center gap-2.5 transition-all hover:shadow-md cursor-pointer`}
            >
              <div className={`h-9 w-9 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-4 w-4 ${c.iconText}`} />
              </div>
              <div className='text-left min-w-0'>
                <span className='text-[10px] font-semibold text-gray-500 uppercase block'>{step.label}</span>
                <span className={`text-base font-bold ${c.metric} leading-tight block`}>{step.metric}</span>
                <span className='text-[9px] text-gray-400'>{step.sub}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
