import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert, Clock, FileWarning, DollarSign } from 'lucide-react';
import type { Alert } from '@/types';

const SEVERITY_CONFIG = {
  critical: { color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: ShieldAlert, iconColor: 'text-red-500' },
  warning: { color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: AlertTriangle, iconColor: 'text-amber-500' },
  info: { color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: Clock, iconColor: 'text-blue-500' },
};

const TYPE_ICON: Record<string, React.ElementType> = {
  trc_expired: ShieldAlert,
  trc_expiring: Clock,
  cert_expired: FileWarning,
  cert_expiring: FileWarning,
  budget_overrun: DollarSign,
  budget_warning: DollarSign,
  missing_docs: FileWarning,
};

export function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    api.get('/alerts').then((r) => setAlerts(r.data.data || [])).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-800'>Alerts</h1>
        <p className='text-gray-500 mt-1'>Document expirations, budget warnings, and missing documents.</p>
      </div>

      <div className='flex gap-2'>
        {['all', 'critical', 'warning'].map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size='sm'
            onClick={() => setFilter(f)} className='capitalize'>
            {f} {f !== 'all' && `(${alerts.filter((a) => a.severity === f).length})`}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className='py-12 text-center text-gray-400'>
          <AlertTriangle className='h-12 w-12 mx-auto mb-3 text-gray-300' />
          <p className='text-lg font-medium'>No alerts</p>
          <p className='text-sm'>Everything looks good!</p>
        </CardContent></Card>
      ) : (
        <div className='space-y-3'>
          {filtered.map((alert, i) => {
            const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;
            const Icon = TYPE_ICON[alert.type] || AlertTriangle;
            return (
              <Card key={i} className={`border ${config.color}`}>
                <CardContent className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='font-semibold text-gray-800 text-sm'>{alert.title}</span>
                        <Badge className={`text-[10px] ${config.badge}`}>{alert.severity}</Badge>
                      </div>
                      <p className='text-sm text-gray-600'>{alert.message}</p>
                    </div>
                    {alert.workerId && (
                      <Button variant='ghost' size='sm' className='shrink-0 text-xs'
                        onClick={() => navigate(ROUTES.WORKER_DETAIL(alert.workerId!))}>
                        View Worker
                      </Button>
                    )}
                    {alert.projectId && (
                      <Button variant='ghost' size='sm' className='shrink-0 text-xs'
                        onClick={() => navigate(ROUTES.PROJECT_DETAIL(alert.projectId!))}>
                        View Project
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
