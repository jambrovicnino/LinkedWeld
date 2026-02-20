import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import {
  FolderKanban, Users, Receipt, TrendingUp,
  Plus, Clock, CheckCircle, ArrowUpRight,
  Wallet, PiggyBank, Activity,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const REVENUE_DATA = [
  { month: 'Jul', revenue: 18000, expenses: 12000 },
  { month: 'Aug', revenue: 24000, expenses: 15000 },
  { month: 'Sep', revenue: 21000, expenses: 13000 },
  { month: 'Oct', revenue: 29000, expenses: 18000 },
  { month: 'Nov', revenue: 32000, expenses: 16000 },
  { month: 'Dec', revenue: 27000, expenses: 19000 },
  { month: 'Jan', revenue: 35000, expenses: 17000 },
  { month: 'Feb', revenue: 38000, expenses: 20000 },
];

const PROJECT_STATUS = [
  { name: 'Active', value: 5, color: '#2196F3' },
  { name: 'Completed', value: 12, color: '#00BCD4' },
  { name: 'On Hold', value: 2, color: '#FF9800' },
  { name: 'Planning', value: 3, color: '#90CAF9' },
];

const RECENT_ACTIVITY = [
  { text: 'Checked in at Refinery Site B', time: '2h ago', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  { text: 'Expense report approved', time: '5h ago', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  { text: 'New project: Pipeline Extension', time: '1d ago', icon: FolderKanban, color: 'text-cyan-600 bg-cyan-50' },
  { text: 'Worker certification expiring', time: '2d ago', icon: Activity, color: 'text-amber-600 bg-amber-50' },
];

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalWorkers: number;
  totalExpenses: number;
  pendingExpenses: number;
  totalRevenue: number;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.get('/reports/dashboard-summary').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const greeting = `Welcome back, ${user?.firstName ?? 'User'}`;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-800'>{greeting}</h1>
        <p className='text-gray-500 mt-1'>Here&apos;s what&apos;s happening across your projects.</p>
      </div>

      {/* Big stat cards with blue/cyan gradient backgrounds */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/20'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-blue-100 text-sm font-medium'>Current Balance</p>
              <p className='text-3xl font-bold mt-2'>&euro;{stats ? (stats.totalRevenue - stats.totalExpenses).toLocaleString() : '\u2014'}</p>
              <p className='text-blue-200 text-xs mt-1'>Revenue minus expenses</p>
            </div>
            <div className='h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center'>
              <Wallet className='h-6 w-6' />
            </div>
          </div>
        </div>
        <div className='rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 text-white shadow-lg shadow-cyan-500/20'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-cyan-100 text-sm font-medium'>Pipeline Value</p>
              <p className='text-3xl font-bold mt-2'>&euro;{stats ? Math.round(stats.totalRevenue * 1.4).toLocaleString() : '\u2014'}</p>
              <p className='text-cyan-200 text-xs mt-1'>{stats?.activeProjects ?? 0} active projects</p>
            </div>
            <div className='h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center'>
              <TrendingUp className='h-6 w-6' />
            </div>
          </div>
        </div>
        <div className='rounded-2xl bg-gradient-to-br from-sky-700 to-sky-800 p-6 text-white shadow-lg shadow-sky-700/20 sm:col-span-2 lg:col-span-1'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sky-200 text-sm font-medium'>Total Revenue</p>
              <p className='text-3xl font-bold mt-2'>&euro;{stats?.totalRevenue?.toLocaleString() ?? '\u2014'}</p>
              <p className='text-sky-300 text-xs mt-1'>All-time tracked revenue</p>
            </div>
            <div className='h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center'>
              <PiggyBank className='h-6 w-6' />
            </div>
          </div>
        </div>
      </div>

      {/* Smaller stat row — white cards */}
      <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
        <Card className='shadow-sm'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>Active Workers</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{stats?.totalWorkers ?? 0}</p>
              </div>
              <div className='h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center'>
                <Users className='h-5 w-5 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-sm'>
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
        <Card className='shadow-sm'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>Pending Expenses</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{stats?.pendingExpenses ?? 0}</p>
              </div>
              <div className='h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center'>
                <Receipt className='h-5 w-5 text-amber-500' />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className='shadow-sm'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs text-gray-400 uppercase tracking-wider font-medium'>Completion Rate</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  {stats ? Math.round((stats.totalProjects - stats.activeProjects) / Math.max(stats.totalProjects, 1) * 100) : 0}%
                </p>
              </div>
              <div className='h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center'>
                <CheckCircle className='h-5 w-5 text-emerald-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-3'>
        {/* Revenue & Expenses Chart */}
        <Card className='lg:col-span-2 shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-lg font-semibold text-gray-800'>Revenue & Expenses</CardTitle>
            <Badge variant='outline' className='text-xs text-gray-500 border-gray-200'>Last 8 months</Badge>
          </CardHeader>
          <CardContent>
            <div className='h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#2196F3' stopOpacity={0.2} />
                      <stop offset='95%' stopColor='#2196F3' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id='expGrad' x1='0' y1='0' x2='0' y2='1'>
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
                  <Area type='monotone' dataKey='revenue' stroke='#2196F3' strokeWidth={2.5} fill='url(#revGrad)' name='Revenue' />
                  <Area type='monotone' dataKey='expenses' stroke='#00BCD4' strokeWidth={2.5} fill='url(#expGrad)' name='Expenses' />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Project Status Donut */}
        <Card className='shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg font-semibold text-gray-800'>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={PROJECT_STATUS}
                    cx='50%'
                    cy='45%'
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    {PROJECT_STATUS.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign='bottom'
                    iconType='circle'
                    iconSize={8}
                    formatter={(value: string) => <span className='text-xs text-gray-500 ml-1'>{value}</span>}
                  />
                  <RTooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
        {/* Recent Activity */}
        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-lg font-semibold text-gray-800'>Recent Activity</CardTitle>
            <Button variant='ghost' size='sm' className='text-xs text-gray-400 hover:text-blue-500' onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
              View All <ArrowUpRight className='ml-1 h-3 w-3' />
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className='flex items-start gap-3'>
                <div className={`h-9 w-9 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className='h-4 w-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm text-gray-700'>{item.text}</p>
                  <p className='text-xs text-gray-400 mt-0.5'>{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className='shadow-sm'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-lg font-semibold text-gray-800'>Project Deadlines</CardTitle>
            <Button variant='ghost' size='sm' className='text-xs text-gray-400 hover:text-blue-500' onClick={() => navigate(ROUTES.PROJECTS)}>
              All Projects <ArrowUpRight className='ml-1 h-3 w-3' />
            </Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {[
              { project: 'Shipyard Phase 2', deadline: 'Mar 15', progress: 75, status: 'On Track' },
              { project: 'Refinery Maintenance', deadline: 'Apr 01', progress: 45, status: 'At Risk' },
              { project: 'Pipeline Extension', deadline: 'Apr 20', progress: 20, status: 'Planning' },
              { project: 'Storage Tank Repair', deadline: 'May 10', progress: 10, status: 'New' },
            ].map((item, i) => (
              <div key={i} className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium text-gray-700'>{item.project}</span>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className={`text-[10px] ${
                        item.status === 'On Track' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                        item.status === 'At Risk' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                        'border-gray-200 text-gray-500 bg-gray-50'
                      }`}
                    >
                      {item.status}
                    </Badge>
                    <span className='text-xs text-gray-400'>{item.deadline}</span>
                  </div>
                </div>
                <Progress value={item.progress} className='h-1.5' />
              </div>
            ))}
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
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.PROJECT_NEW)}>
              <Plus className='h-5 w-5 text-blue-500' />
              <span className='text-xs text-gray-600'>New Project</span>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.EXPENSE_NEW)}>
              <Receipt className='h-5 w-5 text-cyan-500' />
              <span className='text-xs text-gray-600'>Add Expense</span>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.DOCUMENT_UPLOAD)}>
              <Activity className='h-5 w-5 text-blue-400' />
              <span className='text-xs text-gray-600'>Upload Doc</span>
            </Button>
            <Button variant='outline' className='h-auto py-4 flex flex-col gap-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50' onClick={() => navigate(ROUTES.REPORTS)}>
              <TrendingUp className='h-5 w-5 text-sky-500' />
              <span className='text-xs text-gray-600'>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
