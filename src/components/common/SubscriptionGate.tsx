import { useAuthStore } from '@/stores/authStore';
import { hasMinTier } from '@/lib/utils';
import type { SubscriptionTier } from '@/types';
interface SubscriptionGateProps { minTier: SubscriptionTier; children: React.ReactNode; fallback?: React.ReactNode; }
export function SubscriptionGate({ minTier, children, fallback }: SubscriptionGateProps) {
  const { user } = useAuthStore();
  if (!user || !hasMinTier(user.subscriptionTier, minTier)) {
    return <>{fallback || <div className='p-4 text-center text-muted-foreground'>Upgrade to {minTier} to access this feature.</div>}</>;
  }
  return <>{children}</>;
}
