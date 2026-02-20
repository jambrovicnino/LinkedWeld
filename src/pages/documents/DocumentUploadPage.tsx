import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Upload, Save } from 'lucide-react';
export function DocumentUploadPage() {
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'><Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.DOCUMENTS)}><ArrowLeft className='h-5 w-5' /></Button><PageHeader title='Upload Document' /></div>
      <Card><CardContent className='p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'><Label>Document Title</Label><Input placeholder='e.g., AWS Certificate' /></div>
          <div className='space-y-2'><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder='Select...' /></SelectTrigger><SelectContent><SelectItem value='certification'>Certification</SelectItem><SelectItem value='contract'>Contract</SelectItem><SelectItem value='invoice'>Invoice</SelectItem><SelectItem value='safety'>Safety</SelectItem><SelectItem value='other'>Other</SelectItem></SelectContent></Select></div>
          <div className='space-y-2'><Label>Expiry Date (if applicable)</Label><Input type='date' /></div>
        </div>
        <div className='space-y-2'><Label>File</Label><div className='border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent-500/50'><Upload className='h-10 w-10 mx-auto text-muted-foreground mb-2' /><p className='text-sm text-muted-foreground'>Drag & drop or click to select file</p><p className='text-xs text-muted-foreground mt-1'>PDF, JPG, PNG up to 10MB</p></div></div>
        <div className='flex justify-end gap-3'><Button variant='outline' onClick={() => navigate(ROUTES.DOCUMENTS)}>Cancel</Button><Button variant='accent'><Save className='mr-2 h-4 w-4' />Upload</Button></div>
      </CardContent></Card>
    </div>
  );
}
