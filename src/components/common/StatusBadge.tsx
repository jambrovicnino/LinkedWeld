import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'accent' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  open: { label: 'Open', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'accent' },
  on_hold: { label: 'On Hold', variant: 'warning' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  active: { label: 'Active', variant: 'success' },
  expired: { label: 'Expired', variant: 'destructive' },
  available: { label: 'Available', variant: 'success' },
  busy: { label: 'Busy', variant: 'warning' },
  unavailable: { label: 'Unavailable', variant: 'secondary' },
};
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] || { label: status, variant: 'outline' as const };
  return <Badge variant={config.variant} className={cn('capitalize', className)}>{config.label}</Badge>;
}
