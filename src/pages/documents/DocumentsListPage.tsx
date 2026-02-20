import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/router/routes';
import { Plus, FileText, Download, AlertTriangle } from 'lucide-react';
const DEMO = [
  { id:1, title:'AWS D1.1 Certificate', cat:'certification', expiry:'2027-05-15', size:'2.4 MB' },
  { id:2, title:'Safety Training Report', cat:'safety', expiry:null, size:'1.1 MB' },
  { id:3, title:'Project Contract - Shipyard', cat:'contract', expiry:null, size:'3.8 MB' },
  { id:4, title:'Residence Permit', cat:'certification', expiry:'2026-04-30', size:'1.5 MB' },
];
export function DocumentsListPage() {
  const navigate = useNavigate();
  const isExpiring = (d: string|null) => d && new Date(d) < new Date(Date.now() + 90*24*60*60*1000);
  return (
    <div className='space-y-6'>
      <PageHeader title='Documents' description='Manage certificates, contracts, and files'>
        <Button variant='accent' onClick={() => navigate(ROUTES.DOCUMENT_UPLOAD)}><Plus className='mr-2 h-4 w-4' />Upload</Button>
      </PageHeader>
      <div className='grid gap-3'>
        {DEMO.map(d => (
          <Card key={d.id}><CardContent className='p-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'><div className='h-10 w-10 rounded bg-primary/10 flex items-center justify-center'><FileText className='h-5 w-5 text-accent-500' /></div><div><p className='font-medium text-sm'>{d.title}</p><div className='flex items-center gap-2 mt-0.5'><Badge variant='outline' className='text-[10px] capitalize'>{d.cat}</Badge><span className='text-xs text-muted-foreground'>{d.size}</span></div></div></div>
            <div className='flex items-center gap-2'>{isExpiring(d.expiry) && <Badge variant='warning' className='text-[10px]'><AlertTriangle className='h-3 w-3 mr-1' />Expiring</Badge>}<Button variant='ghost' size='icon'><Download className='h-4 w-4' /></Button></div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
