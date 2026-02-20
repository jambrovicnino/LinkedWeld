import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Trash2 } from 'lucide-react';
import type { Expense } from '@/types';

export function ExpenseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    api.get(`/expenses/${id}`).then((r) => setExpense(r.data.data)).catch(() => navigate(ROUTES.EXPENSES));
  }, [id]);

  const handleDelete = async () => {
    try { await api.delete(`/expenses/${id}`); navigate(ROUTES.EXPENSES); } catch {}
  };

  if (!expense) return <div className='text-center py-12 text-gray-400'>Loading...</div>;

  return (
    <div className='space-y-6 max-w-2xl'>
      <div className='flex items-center justify-between'>
        <Button variant='ghost' size='sm' onClick={() => navigate(ROUTES.EXPENSES)}>
          <ArrowLeft className='h-4 w-4 mr-1' /> Back
        </Button>
        <Button variant='ghost' size='sm' className='text-red-500 hover:text-red-700' onClick={handleDelete}>
          <Trash2 className='h-4 w-4 mr-1' /> Delete
        </Button>
      </div>

      <Card className='shadow-sm'>
        <CardContent className='p-6 space-y-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-bold text-gray-800'>{expense.description}</h1>
            <span className='text-2xl font-bold text-gray-800'>{formatCurrency(expense.amount)}</span>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div><span className='text-xs text-gray-400 uppercase'>Date</span><p className='font-medium'>{formatDate(expense.expense_date)}</p></div>
            <div><span className='text-xs text-gray-400 uppercase'>Category</span><p className='font-medium'>{expense.categoryName || '—'}</p></div>
            <div><span className='text-xs text-gray-400 uppercase'>Project</span><p className='font-medium'>{expense.projectName || '—'}</p></div>
            <div><span className='text-xs text-gray-400 uppercase'>Worker</span><p className='font-medium'>{expense.workerName || '—'}</p></div>
            <div><span className='text-xs text-gray-400 uppercase'>Recurring</span><p className='font-medium'>{expense.is_recurring ? `Yes (${expense.recurrence_interval})` : 'No'}</p></div>
          </div>
          {expense.notes && <div><span className='text-xs text-gray-400 uppercase'>Notes</span><p className='text-sm text-gray-600 mt-1'>{expense.notes}</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
