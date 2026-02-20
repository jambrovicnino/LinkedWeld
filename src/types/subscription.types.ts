export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

export interface Subscription {
  id: number;
  userId: number;
  tier: string;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAt?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  business: string | boolean;
  enterprise: string | boolean;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: Record<string, number | string>;
}
