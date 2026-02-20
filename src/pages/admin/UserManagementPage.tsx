import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MoreHorizontal } from 'lucide-react';
const DEMO = [
  {id:1,name:'Jan de Vries',email:'jan@ex.com',role:'welder',tier:'pro',active:true},
  {id:2,name:'Nordic Welding Co.',email:'info@nordic.com',role:'subcontractor',tier:'business',active:true},
  {id:3,name:'Shell Corp',email:'pm@shell.com',role:'client',tier:'enterprise',active:true},
  {id:4,name:'Finance Team',email:'acc@ex.com',role:'accountant',tier:'business',active:false},
];
export function UserManagementPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='User Management' description='Manage platform users and roles' />
      <div className='relative max-w-sm'><Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' /><Input placeholder='Search users...' className='pl-9' /></div>
      <Card><CardContent className='p-0'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='border-b bg-muted/50'><th className='text-left p-3 font-medium'>User</th><th className='text-left p-3 font-medium'>Role</th><th className='text-left p-3 font-medium'>Tier</th><th className='text-left p-3 font-medium'>Status</th><th className='p-3'></th></tr></thead>
            <tbody>
              {DEMO.map(u=>(
                <tr key={u.id} className='border-b last:border-0 hover:bg-muted/30'>
                  <td className='p-3'><div className='flex items-center gap-3'><Avatar className='h-8 w-8'><AvatarFallback className='bg-primary-700 text-white text-xs'>{u.name[0]}</AvatarFallback></Avatar><div><p className='font-medium'>{u.name}</p><p className='text-xs text-muted-foreground'>{u.email}</p></div></div></td>
                  <td className='p-3'><Badge variant='outline' className='capitalize'>{u.role}</Badge></td>
                  <td className='p-3'><Badge variant='secondary' className='capitalize'>{u.tier}</Badge></td>
                  <td className='p-3'><StatusBadge status={u.active?'active':'unavailable'} /></td>
                  <td className='p-3 text-right'><Button variant='ghost' size='icon'><MoreHorizontal className='h-4 w-4' /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </div>
  );
}
