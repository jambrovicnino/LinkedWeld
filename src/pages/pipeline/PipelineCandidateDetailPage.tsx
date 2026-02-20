import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PIPELINE_STAGES, PIPELINE_DOC_CHECKLIST } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, CheckCircle, Circle, Trash2 } from 'lucide-react';
import type { PipelineCandidate, PipelineDocument } from '@/types';

export function PipelineCandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<(PipelineCandidate & { documents?: PipelineDocument[] }) | null>(null);

  const fetchCandidate = () => {
    api.get(`/pipeline/${id}`).then((r) => setCandidate(r.data.data)).catch(() => navigate(ROUTES.PIPELINE));
  };

  useEffect(() => { fetchCandidate(); }, [id]);

  const handleStageChange = async (stage: string) => {
    try { await api.put(`/pipeline/${id}`, { stage }); fetchCandidate(); } catch {}
  };

  const handleToggleDoc = async (docType: string) => {
    try { await api.put(`/pipeline/${id}/documents/${docType}`); fetchCandidate(); } catch {}
  };

  const handleDelete = async () => {
    try { await api.delete(`/pipeline/${id}`); navigate(ROUTES.PIPELINE); } catch {}
  };

  if (!candidate) return <div className='text-center py-12 text-gray-400'>Loading...</div>;

  const stageConf = PIPELINE_STAGES.find((s) => s.value === candidate.stage);
  const docs = candidate.documents || [];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Button variant='ghost' size='sm' onClick={() => navigate(ROUTES.PIPELINE)}>
          <ArrowLeft className='h-4 w-4 mr-1' /> Back to Pipeline
        </Button>
        <Button variant='ghost' size='sm' className='text-red-500 hover:text-red-700' onClick={handleDelete}>
          <Trash2 className='h-4 w-4 mr-1' /> Remove
        </Button>
      </div>

      <Card className='shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>{candidate.first_name} {candidate.last_name}</h1>
              <p className='text-gray-500'>{candidate.nationality} • {candidate.phone || 'No phone'} • {candidate.email || 'No email'}</p>
              {candidate.expected_arrival_date && (
                <p className='text-sm text-gray-400 mt-1'>Expected Arrival: {formatDate(candidate.expected_arrival_date)}</p>
              )}
              {candidate.notes && <p className='text-sm text-gray-500 mt-2'>{candidate.notes}</p>}
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-400'>Stage:</span>
              <Select value={candidate.stage} onValueChange={handleStageChange}>
                <SelectTrigger className='w-44'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage progress */}
      <Card className='shadow-sm'>
        <CardHeader><CardTitle>Stage Progress</CardTitle></CardHeader>
        <CardContent>
          <div className='flex items-center gap-1'>
            {PIPELINE_STAGES.map((s, i) => {
              const currentIdx = PIPELINE_STAGES.findIndex((ps) => ps.value === candidate.stage);
              const isPast = i <= currentIdx;
              return (
                <div key={s.value} className='flex items-center gap-1 flex-1'>
                  <div className={`h-2 flex-1 rounded-full ${isPast ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                  {i < PIPELINE_STAGES.length - 1 && <div className='w-0.5' />}
                </div>
              );
            })}
          </div>
          <div className='flex justify-between mt-1'>
            {PIPELINE_STAGES.map((s) => (
              <span key={s.value} className={`text-[9px] ${s.value === candidate.stage ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                {s.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document checklist */}
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle>Document Checklist ({docs.filter((d) => d.is_received).length} / {PIPELINE_DOC_CHECKLIST.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {PIPELINE_DOC_CHECKLIST.map((item) => {
              const doc = docs.find((d) => d.doc_type === item.type);
              const received = doc?.is_received;
              return (
                <div key={item.type}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${received ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 hover:bg-gray-50'}`}
                  onClick={() => handleToggleDoc(item.type)}>
                  {received ? (
                    <CheckCircle className='h-5 w-5 text-emerald-500 shrink-0' />
                  ) : (
                    <Circle className='h-5 w-5 text-gray-300 shrink-0' />
                  )}
                  <div className='flex-1'>
                    <p className={`text-sm font-medium ${received ? 'text-emerald-700' : 'text-gray-600'}`}>{item.label}</p>
                    {doc?.received_date && <p className='text-xs text-gray-400'>Received: {formatDate(doc.received_date)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
