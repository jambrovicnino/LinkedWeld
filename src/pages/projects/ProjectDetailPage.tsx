import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/router/routes';
import { PROJECT_PHASES } from '@/lib/constants';
import { formatCurrency, formatDate, budgetHealthColor, budgetHealthBg } from '@/lib/utils';
import { ArrowLeft, Edit, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import type { Project } from '@/types';

interface ProjectDetail extends Project {
  workers?: { id: number; first_name: string; last_name: string; status: string; assigned_date: string }[];
  expenses?: { id: number; description: string; amount: number; expense_date: string; categoryName: string }[];
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data.data)).catch(() => navigate(ROUTES.PROJECTS));
  }, [id]);

  if (!project) return <div className='text-center py-12 text-gray-400'>Loading...</div>;

  const phaseConf = PROJECT_PHASES.find(p => p.value === project.phase);
  const budgetCats = [
    { label: 'Labor', budget: project.budget_labor || 0, actual: project.actual_labor || 0 },
    { label: 'Transport', budget: project.budget_transport || 0, actual: project.actual_transport || 0 },
    { label: 'Accommodation', budget: project.budget_accommodation || 0, actual: project.actual_accommodation || 0 },
    { label: 'Tools', budget: project.budget_tools || 0, actual: project.actual_tools || 0 },
    { label: 'Per Diem', budget: project.budget_per_diem || 0, actual: project.actual_per_diem || 0 },
    { label: 'Other', budget: project.budget_other || 0, actual: project.actual_other || 0 },
  ];
  const totalBudget = budgetCats.reduce((s, c) => s + c.budget, 0);
  const totalActual = budgetCats.reduce((s, c) => s + c.actual, 0);
  const ratio = totalBudget > 0 ? totalActual / totalBudget : 0;

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Button variant='ghost' size='sm' onClick={() => navigate(ROUTES.PROJECTS)}>
          <ArrowLeft className='h-4 w-4 mr-1' /> Back
        </Button>
        <Button variant='outline' size='sm' onClick={() => navigate(ROUTES.PROJECT_EDIT(id || ''))}>
          <Edit className='h-4 w-4 mr-1' /> Edit
        </Button>
      </div>

      <Card className='shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex items-start justify-between'>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold text-gray-800'>{project.name}</h1>
                <Badge variant='outline' className='capitalize'>{phaseConf?.label || project.phase}</Badge>
              </div>
              {project.client && <p className='text-gray-500 mt-1'>{project.client}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
        <Card><CardContent className='p-4 flex items-center gap-3'><MapPin className='h-5 w-5 text-blue-500' /><div><p className='text-xs text-gray-400'>Location</p><p className='text-sm font-medium'>{project.location || '—'}{project.country ? `, ${project.country}` : ''}</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Calendar className='h-5 w-5 text-blue-500' /><div><p className='text-xs text-gray-400'>Timeline</p><p className='text-sm font-medium'>{project.start_date ? formatDate(project.start_date) : '—'} — {project.expected_end_date ? formatDate(project.expected_end_date) : '—'}</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Users className='h-5 w-5 text-blue-500' /><div><p className='text-xs text-gray-400'>Workers</p><p className='text-sm font-medium'>{project.workerCount || project.workers?.length || 0}</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><DollarSign className='h-5 w-5 text-blue-500' /><div><p className='text-xs text-gray-400'>Budget</p><p className={`text-sm font-medium ${budgetHealthColor(ratio)}`}>{formatCurrency(totalActual)} / {formatCurrency(totalBudget)}</p></div></CardContent></Card>
      </div>

      <div className='space-y-1'>
        <div className='flex justify-between text-sm'><span className='text-gray-500'>Progress</span><span className='font-medium text-gray-700'>{project.progress || 0}%</span></div>
        <Progress value={project.progress || 0} className='h-3' />
      </div>

      <Tabs defaultValue='budget'>
        <TabsList>
          <TabsTrigger value='budget'>Budget</TabsTrigger>
          <TabsTrigger value='workers'>Workers</TabsTrigger>
          <TabsTrigger value='expenses'>Expenses</TabsTrigger>
          <TabsTrigger value='info'>Info</TabsTrigger>
        </TabsList>

        <TabsContent value='budget'>
          <Card className='shadow-sm'>
            <CardHeader><CardTitle>Budget vs Actual</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
              {budgetCats.map(cat => {
                const catRatio = cat.budget > 0 ? cat.actual / cat.budget : 0;
                const pct = Math.min(catRatio * 100, 100);
                return (
                  <div key={cat.label} className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>{cat.label}</span>
                      <span className={`font-medium ${budgetHealthColor(catRatio)}`}>
                        {formatCurrency(cat.actual)} / {formatCurrency(cat.budget)}
                      </span>
                    </div>
                    <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                      <div className={`h-full rounded-full ${budgetHealthBg(catRatio)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className='pt-3 border-t flex justify-between'>
                <span className='font-semibold text-gray-700'>Total</span>
                <span className={`font-bold ${budgetHealthColor(ratio)}`}>
                  {formatCurrency(totalActual)} / {formatCurrency(totalBudget)} ({Math.round(ratio * 100)}%)
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='workers'>
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              {(project.workers || []).length === 0 ? (
                <p className='text-center text-gray-400'>No workers assigned.</p>
              ) : (
                <div className='space-y-3'>
                  {project.workers!.map((w, i) => (
                    <div key={i} className='flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-gray-50 rounded px-2'
                      onClick={() => navigate(ROUTES.WORKER_DETAIL(w.id))}>
                      <div className='flex items-center gap-3'>
                        <div className='h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium'>
                          {(w.first_name?.[0] || '')}{(w.last_name?.[0] || '')}
                        </div>
                        <span className='text-sm font-medium'>{w.first_name} {w.last_name}</span>
                      </div>
                      <Badge variant='outline' className='text-[10px] capitalize'>{w.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='expenses'>
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              {(project.expenses || []).length === 0 ? (
                <p className='text-center text-gray-400'>No expenses recorded.</p>
              ) : (
                <div className='space-y-2'>
                  {project.expenses!.map((e, i) => (
                    <div key={i} className='flex items-center justify-between py-2 border-b last:border-0'>
                      <div>
                        <p className='text-sm font-medium text-gray-700'>{e.description}</p>
                        <p className='text-xs text-gray-400'>{e.categoryName} &bull; {formatDate(e.expense_date)}</p>
                      </div>
                      <span className='text-sm font-semibold text-gray-800'>{formatCurrency(e.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='info'>
          <Card className='shadow-sm'>
            <CardContent className='p-6'>
              {project.notes ? (
                <div><span className='text-xs text-gray-400 uppercase'>Notes</span><p className='text-sm text-gray-600 mt-1'>{project.notes}</p></div>
              ) : (
                <p className='text-center text-gray-400'>No additional notes.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
