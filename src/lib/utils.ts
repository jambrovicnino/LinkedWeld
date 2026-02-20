import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-EU", { style: "currency", currency }).format(amount);
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", ...options });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function getInitials(firstName: string, lastName: string): string {
  return ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();
}

export function daysUntilExpiry(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function validityColor(days: number | null): string {
  if (days === null) return 'text-gray-400';
  if (days < 0) return 'text-red-600';
  if (days <= 30) return 'text-red-500';
  if (days <= 90) return 'text-amber-500';
  return 'text-emerald-600';
}

export function validityBg(days: number | null): string {
  if (days === null) return 'bg-gray-100';
  if (days < 0) return 'bg-red-50';
  if (days <= 30) return 'bg-red-50';
  if (days <= 90) return 'bg-amber-50';
  return 'bg-emerald-50';
}

export function validityLabel(days: number | null): string {
  if (days === null) return 'No date';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  return `${days}d left`;
}

export function budgetHealthColor(ratio: number): string {
  if (ratio > 0.9) return 'text-red-600';
  if (ratio > 0.7) return 'text-amber-500';
  return 'text-emerald-600';
}

export function budgetHealthBg(ratio: number): string {
  if (ratio > 0.9) return 'bg-red-500';
  if (ratio > 0.7) return 'bg-amber-400';
  return 'bg-emerald-500';
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
