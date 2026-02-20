import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, AlertTriangle, FolderKanban, FileText, Receipt } from 'lucide-react';
const DEMO = [
  { id:1, type:'assignment', title:'New Project Assignment', msg:'You have been assigned to Pipeline Extension B4.', time:'2h ago', read:false, icon:FolderKanban },
  { id:2, type:'certification', title:'Certificate Expiring', msg:'Your residence permit expires in 70 days.', time:'5h ago', read:false, icon:AlertTriangle },
  { id:3, type:'expense', title:'Expense Approved', msg:'Your expense for welding electrodes was approved.', time:'1d ago', read:true, icon:Receipt },
  { id:4, type:'system', title:'Welcome to LinkedWeld', msg:'Complete your profile to get started.', time:'3d ago', read:true, icon:Bell },
];
export function NotificationsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Notifications' description='Stay updated on your activity'><Button variant='outline' size='sm'>Mark all as read</Button></PageHeader>
      <div className='grid gap-2'>
        {DEMO.map(n => (
          <Card key={n.id} className={n.read ? 'opacity-60' : 'border-accent-500/30'}>
            <CardContent className='p-4 flex items-start gap-3'>
              <div className='h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0'><n.icon className='h-4 w-4 text-accent-500' /></div>
              <div className='flex-1'><div className='flex items-center justify-between'><h4 className='text-sm font-medium'>{n.title}</h4>{!n.read && <Badge variant='accent' className='text-[10px]'>New</Badge>}</div><p className='text-xs text-muted-foreground mt-0.5'>{n.msg}</p><p className='text-xs text-muted-foreground mt-1'>{n.time}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
