import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Download, TrendingUp, DollarSign, Clock } from 'lucide-react';
export function ReportsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Reports & Analytics' description='View insights and export data'>
        <Button variant='outline'><Download className='mr-2 h-4 w-4' />Export PDF</Button>
        <Button variant='outline'><Download className='mr-2 h-4 w-4' />Export CSV</Button>
      </PageHeader>
      <div className='flex flex-wrap gap-3'>
        <Input type='date' className='w-40' />
        <Input type='date' className='w-40' />
        <Select defaultValue='all'><SelectTrigger className='w-40'><SelectValue /></SelectTrigger><SelectContent><SelectItem value='all'>All Projects</SelectItem></SelectContent></Select>
      </div>
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {[{t:'Total Revenue',v:'EUR 284K',i:DollarSign},{t:'Hours Logged',v:'1,247',i:Clock},{t:'Projects Done',v:'12',i:BarChart3},{t:'Growth',v:'+18%',i:TrendingUp}].map((s,i)=>(
          <Card key={i}><CardContent className='p-4 flex items-center gap-3'><s.i className='h-8 w-8 text-accent-500' /><div><p className='text-xs text-muted-foreground'>{s.t}</p><p className='text-xl font-bold'>{s.v}</p></div></CardContent></Card>
        ))}
      </div>
      <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
        <Card><CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader><CardContent><div className='h-64 flex items-center justify-center text-muted-foreground'><BarChart3 className='h-12 w-12 opacity-30 mr-2' />Chart renders with real data</div></CardContent></Card>
        <Card><CardHeader><CardTitle>Worker Utilization</CardTitle></CardHeader><CardContent><div className='h-64 flex items-center justify-center text-muted-foreground'><TrendingUp className='h-12 w-12 opacity-30 mr-2' />Chart renders with real data</div></CardContent></Card>
      </div>
    </div>
  );
}
