import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold mt-1'>{value}</p>
            {trend && (
              <p className={cn('text-xs mt-1', trend.positive ? 'text-green-500' : 'text-red-500')}>
                {trend.positive ? '+' : ''}{trend.value}% from last month
              </p>
            )}
          </div>
          <div className='h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center'>
            <Icon className='h-6 w-6 text-accent-500' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
