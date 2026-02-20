import { useAuthStore } from '@/stores/authStore';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import {
  FolderKanban, Users, Receipt, FileText, Clock, AlertTriangle,
  Plus, MapPin, TrendingUp, BarChart3, CreditCard, CheckCircle,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const greeting = `Welcome back, ${user?.firstName ?? 'User'}`;

  return (
    <div className='space-y-6'>
      <PageHeader title={greeting} description="Here's what's happening across your projects." />

      {/* Stats Grid */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard title='Active Projects' value={5} icon={FolderKanban} trend={{ value: 12, positive: true }} />
        <StatCard title='Team Members' value={23} icon={Users} trend={{ value: 5, positive: true }} />
        <StatCard title='Pending Expenses' value={8} icon={Receipt} trend={{ value: 3, positive: false }} />
        <StatCard title='Expiring Certs' value={2} icon={AlertTriangle} />
      </div>

      {/* Quick Actions */}
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {/* Quick Actions Card */}
        <Card>
          <CardHeader><CardTitle className='text-lg'>Quick Actions</CardTitle></CardHeader>
          <CardContent className='grid grid-cols-2 gap-2'>
            {user?.role === 'welder' && (
              <Button variant='accent' className='w-full' onClick={() => navigate(ROUTES.ATTENDANCE)}>
                <MapPin className='mr-2 h-4 w-4' /> Check In
              </Button>
            )}
            <Button variant='outline' className='w-full' onClick={() => navigate(ROUTES.PROJECT_NEW)}>
              <Plus className='mr-2 h-4 w-4' /> New Project
            </Button>
            <Button variant='outline' className='w-full' onClick={() => navigate(ROUTES.EXPENSE_NEW)}>
              <Receipt className='mr-2 h-4 w-4' /> Add Expense
            </Button>
            <Button variant='outline' className='w-full' onClick={() => navigate(ROUTES.DOCUMENT_UPLOAD)}>
              <FileText className='mr-2 h-4 w-4' /> Upload Doc
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader><CardTitle className='text-lg'>Recent Activity</CardTitle></CardHeader>
          <CardContent className='space-y-3'>
            {[
              { text: 'Checked in at Refinery Site B', time: '2h ago', icon: MapPin },
              { text: 'Expense report approved', time: '5h ago', icon: CheckCircle },
              { text: 'New project assignment', time: '1d ago', icon: FolderKanban },
              { text: 'Certificate renewed', time: '2d ago', icon: FileText },
            ].map((item, i) => (
              <div key={i} className='flex items-start gap-3'>
                <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                  <item.icon className='h-4 w-4 text-accent-500' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm truncate'>{item.text}</p>
                  <p className='text-xs text-muted-foreground'>{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader><CardTitle className='text-lg'>Upcoming Deadlines</CardTitle></CardHeader>
          <CardContent className='space-y-3'>
            {[
              { project: 'Shipyard Phase 2', deadline: 'Mar 15', progress: 75 },
              { project: 'Refinery Maintenance', deadline: 'Apr 01', progress: 45 },
              { project: 'Pipeline Extension', deadline: 'Apr 20', progress: 20 },
            ].map((item, i) => (
              <div key={i} className='space-y-1'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-medium'>{item.project}</span>
                  <Badge variant='outline' className='text-xs'>{item.deadline}</Badge>
                </div>
                <Progress value={item.progress} className='h-2' />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hours / Revenue chart placeholder */}
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
        <Card>
          <CardHeader><CardTitle className='text-lg flex items-center gap-2'><Clock className='h-5 w-5' /> Hours This Week</CardTitle></CardHeader>
          <CardContent>
            <div className='h-48 flex items-center justify-center text-muted-foreground'>
              <BarChart3 className='h-12 w-12 opacity-30' />
              <span className='ml-2'>Chart will render with real data</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className='text-lg flex items-center gap-2'><TrendingUp className='h-5 w-5' /> Expense Overview</CardTitle></CardHeader>
          <CardContent>
            <div className='h-48 flex items-center justify-center text-muted-foreground'>
              <CreditCard className='h-12 w-12 opacity-30' />
              <span className='ml-2'>Chart will render with real data</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
