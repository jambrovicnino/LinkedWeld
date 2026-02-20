export const APP_NAME = 'LinkedWeld';

export const ROLES = {
  WELDER: 'welder',
  SUBCONTRACTOR: 'subcontractor',
  CLIENT: 'client',
  ACCOUNTANT: 'accountant',
  ADMIN: 'admin',
} as const;

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
  ENTERPRISE: 'enterprise',
} as const;

export const PROJECT_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'open', label: 'Open', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-accent-500' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-yellow-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
] as const;

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-400' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-400' },
  { value: 'high', label: 'High', color: 'bg-accent-400' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
] as const;

export const TRADES = [
  { value: 'welder', label: 'Welder' },
  { value: 'pipefitter', label: 'Pipefitter' },
  { value: 'boilermaker', label: 'Boilermaker' },
  { value: 'ironworker', label: 'Ironworker' },
  { value: 'sheet_metal', label: 'Sheet Metal Worker' },
  { value: 'other', label: 'Other' },
] as const;

export const WELDING_TYPES = ['MIG', 'TIG', 'Stick', 'Flux-Core', 'Submerged Arc', 'Oxy-Fuel'] as const;

export const EXPENSE_CATEGORIES = [
  { id: 1, name: 'Materials', icon: 'Package', color: '#3b82f6' },
  { id: 2, name: 'Equipment', icon: 'Wrench', color: '#8b5cf6' },
  { id: 3, name: 'Travel', icon: 'Car', color: '#10b981' },
  { id: 4, name: 'Labor', icon: 'HardHat', color: '#f59e0b' },
  { id: 5, name: 'Safety', icon: 'Shield', color: '#ef4444' },
  { id: 6, name: 'Office', icon: 'Building', color: '#6366f1' },
  { id: 7, name: 'Other', icon: 'MoreHorizontal', color: '#6b7280' },
] as const;

export const DOCUMENT_CATEGORIES = [
  { value: 'certification', label: 'Certification' },
  { value: 'contract', label: 'Contract' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'safety', label: 'Safety Document' },
  { value: 'report', label: 'Report' },
  { value: 'photo', label: 'Photo' },
  { value: 'other', label: 'Other' },
] as const;
