// SubscriptionGate is no longer used in LinkedWeld Pro.
// Kept as a pass-through for backward compatibility.
interface SubscriptionGateProps { children: React.ReactNode; fallback?: React.ReactNode; minTier?: string; }
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  return <>{children}</>;
}
