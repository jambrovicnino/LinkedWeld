import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { WORKER_DOC_TYPES } from '@/lib/constants';
import { daysUntilExpiry, validityColor, validityLabel, validityBg, formatDate, getInitials } from '@/lib/utils';
import { ArrowLeft, Plus, Shield, CheckCircle, XCircle, AlertTriangle, Circle } from 'lucide-react';
import api from '@/lib/api';
import type { WorkerDetail, WorkerDocument } from '@/types';

export function WorkerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<WorkerDetail | null>(null);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docForm, setDocForm] = useState({ docType: 'trc', issueDate: '', expiryDate: '', notes: '', trcCountry: 'Slovenia', trcNumber: '', weldingScope: '', a1Country: '' });

  const fetchWorker = () => {
    api.get(`/workers/${id}`).then((r) => setWorker(r.data.data)).catch(() => navigate(ROUTES.WORKERS));
  };

  useEffect(() => { fetchWorker(); }, [id]);

  const handleAddDoc = async () => {
    try {
      await api.post(`/workers/${id}/documents`, {
        doc_type: docForm.docType, issue_date: docForm.issueDate || null,
        expiry_date: docForm.expiryDate || null, notes: docForm.notes,
        trc_country: docForm.trcCountry, trc_number: docForm.trcNumber,
        welding_scope: docForm.weldingScope, a1_country: docForm.a1Country,
      });
      setDocDialogOpen(false);
      setDocForm({ docType: 'trc', issueDate: '', expiryDate: '', notes: '', trcCountry: 'Slovenia', trcNumber: '', weldingScope: '', a1Country: '' });
      fetchWorker();
    } catch {}
  };

  if (!worker) return <div className='text-center py-12 text-gray-400'>Loading...</div>;

  const docs = worker.documents || [];

  const statusIcon = (doc: WorkerDocument) => {
    switch (doc.validity_status) {
      case 'valid': return <CheckCircle className='h-4 w-4 text-emerald-500' />;
      case 'expiring_soon': return <AlertTriangle className='h-4 w-4 text-amber-500' />;
      case 'expired': return <XCircle className='h-4 w-4 text-red-500' />;
      default: return <Circle className='h-4 w-4 text-gray-300' />;
    }
  };

  return (
    <div className='space-y-6'>
      <Button variant='ghost' size='sm' onClick={() => navigate(ROUTES.WORKERS)}>
        <ArrowLeft className='h-4 w-4 mr-1' /> Back to Workers
      </Button>

      <Card className='shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex items-start gap-4'>
            <div className='h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold text-white shrink-0'>
              {getInitials(worker.first_name, worker.last_name)}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold text-gray-800'>{worker.first_name} {worker.last_name}</h1>
                <Badge variant='outline' className={`capitalize ${
                  worker.status === 'active' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                  worker.status === 'on_leave' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                  'border-gray-200 text-gray-500'
                }`}>{worker.status?.replace('_', ' ')}</Badge>
              </div>
              <p className='text-gray-500 mt-1'>{worker.nationality} &bull; {worker.phone || 'No phone'} &bull; {worker.email || 'No email'}</p>
              <div className='flex flex-wrap gap-1.5 mt-2'>
                {(worker.welding_types || []).map(t => (
                  <Badge key={t} className='text-xs bg-blue-100 text-blue-700'>{t}</Badge>
                ))}
              </div>
              <p className='text-sm text-gray-400 mt-2'>Hourly rate: &euro;{worker.hourly_rate?.toFixed(2) ?? '0.00'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(() => {
        const trcDoc = docs.find(d => d.doc_type === 'trc');
        const days = trcDoc ? daysUntilExpiry(trcDoc.expiry_date ?? null) : null;
        if (days === null) return null;
        return (
          <div className={`rounded-xl p-4 flex items-center gap-3 ${validityBg(days)} border`}>
            <Shield className={`h-6 w-6 ${validityColor(days)}`} />
            <div>
              <p className={`font-semibold ${validityColor(days)}`}>TRC: {validityLabel(days)}</p>
              {trcDoc?.expiry_date && <p className='text-xs text-gray-500'>Expires: {formatDate(trcDoc.expiry_date)}</p>}
            </div>
          </div>
        );
      })()}

      <Tabs defaultValue='documents'>
        <TabsList>
          <TabsTrigger value='documents'>Documents ({docs.length})</TabsTrigger>
          <TabsTrigger value='info'>Info</TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>

        <TabsContent value='documents'>
          <Card className='shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>Document Vault</CardTitle>
              <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
                <DialogTrigger asChild>
                  <Button size='sm'><Plus className='h-4 w-4 mr-1' />Add Document</Button>
                </DialogTrigger>
                <DialogContent className='max-w-md'>
                  <DialogHeader><DialogTitle>Add Document</DialogTitle></DialogHeader>
                  <div className='space-y-3'>
                    <div><Label>Document Type</Label>
                      <Select value={docForm.docType} onValueChange={(v) => setDocForm({ ...docForm, docType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{WORKER_DOC_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    {docForm.docType === 'trc' && (
                      <div className='grid grid-cols-2 gap-3'>
                        <div><Label>TRC Country</Label><Input value={docForm.trcCountry} onChange={(e) => setDocForm({ ...docForm, trcCountry: e.target.value })} /></div>
                        <div><Label>TRC Number</Label><Input value={docForm.trcNumber} onChange={(e) => setDocForm({ ...docForm, trcNumber: e.target.value })} /></div>
                      </div>
                    )}
                    {docForm.docType === 'welding_cert' && (
                      <div><Label>Welding Scope</Label><Input placeholder='e.g. EN ISO 9606-1 135 P FW' value={docForm.weldingScope} onChange={(e) => setDocForm({ ...docForm, weldingScope: e.target.value })} /></div>
                    )}
                    {docForm.docType === 'a1_form' && (
                      <div><Label>A1 Country</Label><Input placeholder='e.g. Austria' value={docForm.a1Country} onChange={(e) => setDocForm({ ...docForm, a1Country: e.target.value })} /></div>
                    )}
                    <div className='grid grid-cols-2 gap-3'>
                      <div><Label>Issue Date</Label><Input type='date' value={docForm.issueDate} onChange={(e) => setDocForm({ ...docForm, issueDate: e.target.value })} /></div>
                      <div><Label>Expiry Date</Label><Input type='date' value={docForm.expiryDate} onChange={(e) => setDocForm({ ...docForm, expiryDate: e.target.value })} /></div>
                    </div>
                    <div><Label>Notes</Label><Input value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} /></div>
                    <Button className='w-full' onClick={handleAddDoc}>Add Document</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {WORKER_DOC_TYPES.map((dt) => {
                  const doc = docs.find(d => d.doc_type === dt.value);
                  const days = doc ? daysUntilExpiry(doc.expiry_date ?? null) : null;
                  return (
                    <div key={dt.value} className={`flex items-center gap-3 p-3 rounded-lg border ${doc ? (validityBg(days)) : 'border-gray-100 bg-gray-50'}`}>
                      {doc ? statusIcon(doc) : <Circle className='h-4 w-4 text-gray-300' />}
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-700'>{dt.label}</p>
                        {doc?.expiry_date && <p className={`text-xs ${validityColor(days)}`}>{validityLabel(days)}</p>}
                        {doc?.notes && <p className='text-xs text-gray-400'>{doc.notes}</p>}
                      </div>
                      {!doc && <span className='text-xs text-gray-400'>Missing</span>}
                      {doc?.doc_type === 'trc' && doc.trc_number && <span className='text-xs text-gray-400'>#{doc.trc_number}</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='info'>
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              <div className='grid grid-cols-2 gap-4'>
                <div><span className='text-xs text-gray-400 uppercase'>Full Name</span><p className='font-medium'>{worker.first_name} {worker.last_name}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Nationality</span><p className='font-medium'>{worker.nationality}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Phone</span><p className='font-medium'>{worker.phone || '—'}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Email</span><p className='font-medium'>{worker.email || '—'}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Hourly Rate</span><p className='font-medium'>&euro;{worker.hourly_rate?.toFixed(2)}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Status</span><p className='font-medium capitalize'>{worker.status?.replace('_', ' ')}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Welding Types</span><p className='font-medium'>{(worker.welding_types || []).join(', ') || '—'}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Current Project</span><p className='font-medium'>{worker.currentProjectName || '—'}</p></div>
                <div><span className='text-xs text-gray-400 uppercase'>Employment Start</span><p className='font-medium'>{worker.employment_start_date ? formatDate(worker.employment_start_date) : '—'}</p></div>
              </div>
              {worker.notes && (
                <div className='mt-4'>
                  <span className='text-xs text-gray-400 uppercase'>Notes</span>
                  <p className='text-sm text-gray-600 mt-1'>{worker.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='history'>
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              {(worker.assignments || []).length === 0 ? (
                <p className='text-center text-gray-400'>No project assignments yet.</p>
              ) : (
                <div className='space-y-3'>
                  {worker.assignments.map((a: any, i: number) => (
                    <div key={i} className='flex items-center justify-between py-2 border-b last:border-0'>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>{a.projectName || `Project #${a.project_id}`}</p>
                        <p className='text-xs text-gray-400'>
                          {a.assigned_date ? formatDate(a.assigned_date) : '—'}
                          {a.removed_date ? ` — ${formatDate(a.removed_date)}` : ' — Present'}
                        </p>
                      </div>
                      <Badge variant='outline' className='text-[10px]'>{a.removed_date ? 'Completed' : 'Active'}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
