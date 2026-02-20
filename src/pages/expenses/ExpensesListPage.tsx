import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Receipt } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { Expense, ExpenseSummary } from '@/types';

export function ExpensesListPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [projectFilter, setProjectFilter] = useState('all');

  useEffect(() => {
    const params: any = {};
    if (projectFilter !== 'all') params.projectId = projectFilter;
    api.get('/expenses', { params }).then((r) => setExpenses(r.data.data || [])).catch(() => {});
    api.get('/expenses/summary').then((r) => setSummary(r.data.data)).catch(() => {});
  }, [projectFilter]);

  const projectNames = [...new Set(expenses.map((e) => e.projectName).filter(Boolean))] as string[];

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Expenses</h1>
          <p className='text-gray-500 mt-1'>Total: {formatCurrency(summary?.total || 0)}</p>
        </div>
        <Button onClick={() => navigate(ROUTES.EXPENSE_NEW)}>
          <Plus className='h-4 w-4 mr-2' />Add Expense
        </Button>
      </div>

      <Tabs defaultValue='list'>
        <TabsList>
          <TabsTrigger value='list'>List</TabsTrigger>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
        </TabsList>

        <TabsContent value='list'>
          <div className='mb-4'>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className='w-48'><SelectValue placeholder='Filter by project' /></SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Projects</SelectItem>
                {projectNames.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {expenses.length === 0 ? (
            <Card><CardContent className='py-12 text-center text-gray-400'>
              <Receipt className='h-12 w-12 mx-auto mb-3 text-gray-300' />
              <p>No expenses found</p>
            </CardContent></Card>
          ) : (
            <Card className='shadow-sm'>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead><tr className='border-b bg-gray-50'>
                      <th className='text-left text-xs font-medium text-gray-500 p-3'>Date</th>
                      <th className='text-left text-xs font-medium text-gray-500 p-3'>Description</th>
                      <th className='text-left text-xs font-medium text-gray-500 p-3'>Category</th>
                      <th className='text-left text-xs font-medium text-gray-500 p-3'>Project</th>
                      <th className='text-left text-xs font-medium text-gray-500 p-3'>Worker</th>
                      <th className='text-right text-xs font-medium text-gray-500 p-3'>Amount</th>
                    </tr></thead>
                    <tbody>
                      {expenses.map((e) => (
                        <tr key={e.id} className='border-b hover:bg-gray-50 cursor-pointer'
                          onClick={() => navigate(ROUTES.EXPENSE_DETAIL(e.id))}>
                          <td className='p-3 text-sm text-gray-600'>{formatDate(e.expense_date)}</td>
                          <td className='p-3 text-sm font-medium text-gray-800'>
                            {e.description}
                            {e.is_recurring ? <Badge variant='outline' className='ml-2 text-[9px]'>Recurring</Badge> : null}
                          </td>
                          <td className='p-3 text-sm text-gray-500'>{e.categoryName}</td>
                          <td className='p-3 text-sm text-gray-500'>{e.projectName || '—'}</td>
                          <td className='p-3 text-sm text-gray-500'>{e.workerName || '—'}</td>
                          <td className='p-3 text-sm font-semibold text-gray-800 text-right'>{formatCurrency(e.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='reports'>
          <div className='grid gap-4 grid-cols-1 lg:grid-cols-2'>
            {/* By Category Pie */}
            <Card className='shadow-sm'>
              <CardHeader><CardTitle className='text-base'>By Category</CardTitle></CardHeader>
              <CardContent>
                <div className='h-64'>
                  {summary?.byCategory && summary.byCategory.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie data={summary.byCategory} cx='50%' cy='50%' innerRadius={50} outerRadius={80} paddingAngle={3} dataKey='amount' nameKey='category'>
                          {summary.byCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <RTooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className='h-full flex items-center justify-center text-gray-400 text-sm'>No data</div>}
                </div>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {(summary?.byCategory || []).map((c, i) => (
                    <div key={i} className='flex items-center gap-1.5 text-xs'>
                      <div className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: c.color }} />
                      <span className='text-gray-500'>{c.category}: {formatCurrency(c.amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Project Bar */}
            <Card className='shadow-sm'>
              <CardHeader><CardTitle className='text-base'>By Project</CardTitle></CardHeader>
              <CardContent>
                <div className='h-64'>
                  {summary?.byProject && summary.byProject.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={summary.byProject} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                        <XAxis dataKey='project' tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `€${(v/1000).toFixed(0)}k`} />
                        <RTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey='amount' fill='#2196F3' radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className='h-full flex items-center justify-center text-gray-400 text-sm'>No data</div>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
