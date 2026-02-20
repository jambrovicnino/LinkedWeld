import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { PROJECT_PHASES } from '@/lib/constants';
import { formatCurrency, budgetHealthColor } from '@/lib/utils';
import { Plus, Search, MapPin, FolderKanban, Users } from 'lucide-react';
import api from '@/lib/api';
import type { Project } from '@/types';

export function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');

  useEffect(() => {
    const params: any = {};
    if (phaseFilter !== 'all') params.phase = phaseFilter;
    api.get('/projects', { params }).then(r => setProjects(r.data.data || [])).catch(() => {});
  }, [phaseFilter]);

  const filtered = projects.filter(p => {
    return p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.client?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Projects</h1>
          <p className='text-gray-500 mt-1'>{projects.length} projects</p>
        </div>
        <Button onClick={() => navigate(ROUTES.PROJECT_NEW)}>
          <Plus className='mr-2 h-4 w-4' /> New Project
        </Button>
      </div>

      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search projects...' className='pl-9' value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={phaseFilter} onValueChange={setPhaseFilter}>
          <SelectTrigger className='w-full sm:w-48'><SelectValue placeholder='Filter by phase' /></SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Phases</SelectItem>
            {PROJECT_PHASES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className='py-12 text-center text-gray-400'>
          <FolderKanban className='h-12 w-12 mx-auto mb-3 text-gray-300' />
          <p className='text-lg font-medium'>No projects found</p>
          <p className='text-sm'>Create your first project to get started.</p>
        </CardContent></Card>
      ) : (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map(project => {
            const phaseConf = PROJECT_PHASES.find(p => p.value === project.phase);
            const totalBudget = (project.budget_labor || 0) + (project.budget_transport || 0) +
              (project.budget_accommodation || 0) + (project.budget_tools || 0) +
              (project.budget_per_diem || 0) + (project.budget_other || 0);
            const totalActual = (project.actual_labor || 0) + (project.actual_transport || 0) +
              (project.actual_accommodation || 0) + (project.actual_tools || 0) +
              (project.actual_per_diem || 0) + (project.actual_other || 0);
            const ratio = totalBudget > 0 ? totalActual / totalBudget : 0;

            return (
              <Card key={project.id} className='cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate(ROUTES.PROJECT_DETAIL(project.id))}>
                <CardContent className='p-5'>
                  <div className='flex items-start justify-between mb-3'>
                    <h3 className='font-semibold text-lg leading-tight text-gray-800'>{project.name}</h3>
                    <Badge variant='outline' className={`text-[10px] capitalize ${phaseConf?.color ? `${phaseConf.color} text-white` : ''}`}>
                      {phaseConf?.label || project.phase}
                    </Badge>
                  </div>
                  {project.client && <p className='text-sm text-gray-600 mb-1'>{project.client}</p>}
                  <div className='space-y-1 text-sm text-gray-500'>
                    <div className='flex items-center gap-2'><MapPin className='h-3.5 w-3.5' />{project.location || '—'}{project.country ? `, ${project.country}` : ''}</div>
                  </div>
                  <div className='mt-3 space-y-1'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-500'>Progress</span>
                      <span className='font-medium text-gray-700'>{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} className='h-2' />
                  </div>
                  <div className='flex items-center justify-between mt-3 pt-3 border-t'>
                    <div className='flex items-center gap-1'>
                      <Users className='h-3.5 w-3.5 text-gray-400' />
                      <span className='text-xs text-gray-500'>{project.workerCount || 0} workers</span>
                    </div>
                    <div className='text-right'>
                      <span className={`text-sm font-semibold ${budgetHealthColor(ratio)}`}>
                        {formatCurrency(totalActual)} / {formatCurrency(totalBudget)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
