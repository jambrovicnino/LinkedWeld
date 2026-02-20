import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
export function WorkerProfilePage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='My Profile' description='Manage your worker profile' />
      <Card><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader><CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'><Label>First Name</Label><Input defaultValue='Jan' /></div>
          <div className='space-y-2'><Label>Last Name</Label><Input defaultValue='de Vries' /></div>
          <div className='space-y-2'><Label>Email</Label><Input type='email' defaultValue='jan@example.com' /></div>
          <div className='space-y-2'><Label>Phone</Label><Input defaultValue='+31 6 1234 5678' /></div>
          <div className='space-y-2'><Label>Hourly Rate (EUR)</Label><Input type='number' defaultValue='45' /></div>
          <div className='space-y-2'><Label>Location</Label><Input defaultValue='Rotterdam, NL' /></div>
        </div>
        <div className='space-y-2'><Label>Bio</Label><Textarea defaultValue='Experienced welder.' rows={3} /></div>
        <div className='flex justify-end'><Button variant='accent'><Save className='mr-2 h-4 w-4' />Save</Button></div>
      </CardContent></Card>
    </div>
  );
}
