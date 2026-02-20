import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderKanban, Building, Shield, BarChart3, CreditCard } from 'lucide-react';
export function AdminDashboardPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Admin Panel' description='System overview and management' />
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard title='Total Users' value={156} icon={Users} trend={{value:8,positive:true}} />
        <StatCard title='Active Projects' value={23} icon={FolderKanban} trend={{value:12,positive:true}} />
        <StatCard title='Companies' value={14} icon={Building} />
        <StatCard title='Subscriptions' value={89} icon={CreditCard} trend={{value:5,positive:true}} />
      </div>
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
        <Card><CardHeader><CardTitle>Users by Role</CardTitle></CardHeader><CardContent><div className='h-48 flex items-center justify-center text-muted-foreground'><BarChart3 className='h-12 w-12 opacity-30' /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Subscription Distribution</CardTitle></CardHeader><CardContent><div className='h-48 flex items-center justify-center text-muted-foreground'><CreditCard className='h-12 w-12 opacity-30' /></div></CardContent></Card>
      </div>
    </div>
  );
}
