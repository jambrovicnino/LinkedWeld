import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Users, FolderKanban, Receipt, AlertTriangle,
  Plus, ArrowUpRight, ShieldAlert, Clock, GitBranch,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
} from 'recharts';
import type { Alert as AlertType, DashboardSummary } from '@/types';
import { ProcessDiagram } from '@/components/dashboard/ProcessDiagram';

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/alerts').then(r => setAlerts((r.data.data || []).slice(0, 5))).catch(() => {});
  }, []);

  const greeting = `Welcome back, ${user?.firstName ?? 'User'}`;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  const costData = stats?.monthlyCosts && stats.monthlyCosts.length > 0
    ? stats.monthlyCosts
    : [];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-800'>{greeting}</h1>
        <p className='text-gray-500 mt-1'>Here&apos;s your workforce and project overview.</p>
      </div>

      {/* Process Lifecycle Diagram — mission control strip */}
      <ProcessDiagram stats={stats} alerts={alerts} />

      {/* Alert summary row */}
      {alerts.length > 0 && (
        <div className='grid gap-3 grid-cols-1 sm:grid-cols-3'>
          <div className='rounded-xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 cursor-pointer hover:bg-red-100 transition-colors'
            onClick={() => navigate(ROUTES.ALERTS)}>
            <div className='h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center'>
              <ShieldAlert className='h-5 w-5 text-red-500' />
            </div>
            <div>
              <p className='text-2xl font-bold text-red-700'>{criticalAlerts.length}</p>
              <p className='text-xs text-red-500'>Critical alerts</p>
            </div>
          </div>
          <div className='rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition-colors'
            onClick={() => navigate(ROUTES.ALERTS)}>
            <div className='h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center'>
              <AlertTriangle className='h-5 w-5 text-amber-500' />
            </div>
            <div>
              <p className='text-2xl font-bold text-amber-700'>{warningAlerts.length}</p>
              <p className='text-xs text-amber-500'>Warnings</p>
            </div>
          </div>
          <div className='rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-center gap-3 cursor-pointer hover:bg-blue-100 transition-colors'
            onClick={() => navigate(ROUTES.PIPELINE)}>
            <div className='h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center'>
              <GitBranch className='h-5 w-5 text-blue-500' />
            </div>
            <div>
              <p className='text-2xl font-bold text-blue-700'>{stats?.pipelineCandidates ?? 0}</p>
              <p className='text-xs text-blue-500'>Pipeline candidates</p>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
        <Card className='shadow-sm cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate(ROUTES.WORKERS)}>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>Active Workers</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{stats?.activeWorkers ?? 0}</p>
                <p className='text-xs text-gray-400'>{stats?.totalWorkers ?? 0} total</p>
              </div>
              <div className='h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center'>
                <Users className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-sm cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate(ROUTES.PROJECTS)}>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>Active Projects</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{stats?.activeProjects ?? 0}</p>
              </div>
              <div className='h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center'>
                <FolderKanban className='h-5 w-5 text-cyan-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-sm cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate(ROUTES.EXPENSES)}>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>Total Expenses</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{formatCurrency(stats?.totalExpenses ?? 0)}</p>
              </div>
              <div className='h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center'>
                <Receipt className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-sm cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate(ROUTES.ALERTS)}>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>TRC Expiring</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{stats?.trcExpiring ?? 0}</p>
                <p className='text-xs text-red-500'>Needs attention</p>
              </div>
              <div className='h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center'>
                <Clock className='h-5 w-5 text-red-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts + Alerts row */}
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
        <Card className='lg:col-span-2 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-lg font-semibold text-gray-800'>Monthly Costs</CardTitle>
            <Badge variant='outline' className='text-xs text-gray-500 border-gray-200'>Last 6 months</Badge>
          </CardHeader>
          <CardContent>
            <div className='h-72'>
              {costData.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={costData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id='laborGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#2196F3' stopOpacity={0.2} />
                        <stop offset='95%' stopColor='#2196F3' stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id='transportGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#00BCD4' stopOpacity={0.2} />
                        <stop offset='95%' stopColor='#00BCD4' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                    <XAxis dataKey='month' tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `\u20AC${v / 1000}k`} />
                    <RTooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`\u20AC${value.toLocaleString()}`, undefined]}
                    />
                    <Area type='monotone' dataKey='labor' stroke='#2196F3' strokeWidth={2} fill='url(#laborGrad)' name='Labor' />
                    <Area type='monotone' dataKey='transport' stroke='#00BCD4' strokeWidth={2} fill='url(#transportGrad)' name='Transport' />
                    <Area type='monotone' dataKey='accommodation' stroke='#10b981' strokeWidth={2} fillOpacity={0.1} fill='#10b981' name='Accommodation' />
                    <Area type='monotone' dataKey='other' stroke='#f59e0b' strokeWidth={2} fillOpacity={0.1} fill='#f59e0b' name='Other' />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className='h-full flex items-center justify-center text-gray-400 text-sm'>
                  Loading cost data...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-lg font-semibold text-gray-800'>Recent Alerts</CardTitle>
            <Button variant='ghost' size='sm' className='text-xs text-gray-400 hover:text-blue-500' onClick={() => navigate(ROUTES.ALERTS)}>
              View All <ArrowUpRight className='ml-1 h-3 w-3' />
            </Button>
          </CardHeader>
          <CardContent className='space-y-3'>
            {alerts.length === 0 ? (
              <p className='text-sm text-gray-400 text-center py-4'>No alerts — everything looks good!</p>
            ) : (
              alerts.map((alert, i) => (
                <div key={i} className='flex items-start gap-3'>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    alert.severity === 'critical' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
                  }`}>
                    {alert.severity === 'critical' ? <ShieldAlert className='h-4 w-4' /> : <AlertTriangle className='h-4 w-4' />}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-700 truncate'>{alert.title}</p>
                    <p className='text-xs text-gray-400 truncate'>{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className='shadow-sm'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-lg font-semibold text-gray-800'>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.WORKERS)}>
              <Users className='h-5 w-5 text-blue-500' />
              <span className='text-xs text-gray-600'>View Workers</span>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.PROJECT_NEW)}>
              <Plus className='h-5 w-5 text-cyan-500' />
              <span className='text-xs text-gray-600'>New Project</span>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.EXPENSE_NEW)}>
              <Receipt className='h-5 w-5 text-amber-500' />
              <span className='text-xs text-gray-600'>Add Expense</span>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.PIPELINE)}>
              <GitBranch className='h-5 w-5 text-emerald-500' />
              <span className='text-xs text-gray-600'>Pipeline</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
