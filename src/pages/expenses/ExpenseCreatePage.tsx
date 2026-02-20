import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Save, Upload } from 'lucide-react';
export function ExpenseCreatePage() {
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'><Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.EXPENSES)}><ArrowLeft className='h-5 w-5' /></Button><PageHeader title='New Expense' /></div>
      <Card><CardContent className='p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder='Select...' /></SelectTrigger><SelectContent><SelectItem value='1'>Materials</SelectItem><SelectItem value='2'>Equipment</SelectItem><SelectItem value='3'>Travel</SelectItem><SelectItem value='4'>Labor</SelectItem><SelectItem value='5'>Safety</SelectItem></SelectContent></Select></div>
          <div className='space-y-2'><Label>Amount (EUR)</Label><Input type='number' placeholder='0.00' /></div>
          <div className='space-y-2'><Label>Date</Label><Input type='date' /></div>
          <div className='space-y-2'><Label>Project</Label><Select><SelectTrigger><SelectValue placeholder='Select...' /></SelectTrigger><SelectContent><SelectItem value='1'>Shipyard Phase 2</SelectItem><SelectItem value='2'>Pipeline Extension</SelectItem></SelectContent></Select></div>
        </div>
        <div className='space-y-2'><Label>Description</Label><Textarea placeholder='Describe the expense...' /></div>
        <div className='space-y-2'><Label>Receipt</Label><div className='border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-accent-500/50'><Upload className='h-8 w-8 mx-auto text-muted-foreground mb-2' /><p className='text-sm text-muted-foreground'>Click to upload or drag & drop</p></div></div>
        <div className='flex justify-end gap-3'><Button variant='outline' onClick={() => navigate(ROUTES.EXPENSES)}>Cancel</Button><Button variant='accent'><Save className='mr-2 h-4 w-4' />Submit</Button></div>
      </CardContent></Card>
    </div>
  );
}
