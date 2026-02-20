import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(firstName: string, lastName: string): string {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getSubscriptionTierOrder(tier: string): number {
  const order: Record<string, number> = { free: 0, pro: 1, business: 2, enterprise: 3 };
  return order[tier] ?? 0;
}

export function hasMinTier(currentTier: string, requiredTier: string): boolean {
  return getSubscriptionTierOrder(currentTier) >= getSubscriptionTierOrder(requiredTier);
}
