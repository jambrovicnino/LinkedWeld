export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';

export interface ExpenseCategory {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

export interface Expense {
  id: number;
  userId: number;
  projectId?: number;
  categoryId: number;
  amount: number;
  currency: string;
  description: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  expenseDate: string;
  approvedBy?: number;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  categoryName?: string;
  projectTitle?: string;
  userName?: string;
}

export interface ExpenseFormData {
  projectId?: number;
  categoryId: number;
  amount: number;
  currency: string;
  description: string;
  expenseDate: string;
  notes?: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  byCategory: { category: string; amount: number; color: string }[];
  byStatus: { status: ExpenseStatus; count: number; amount: number }[];
  byMonth: { month: string; amount: number }[];
}
