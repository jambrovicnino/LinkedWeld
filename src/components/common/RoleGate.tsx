import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';
interface RoleGateProps { allowed: UserRole[]; children: React.ReactNode; fallback?: React.ReactNode; }
export function RoleGate({ allowed, children, fallback = null }: RoleGateProps) {
  const { user } = useAuthStore();
  if (!user || !allowed.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
