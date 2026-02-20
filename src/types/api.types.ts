export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface DashboardStats {
  activeProjects: number;
  totalWorkers: number;
  pendingExpenses: number;
  expiringCertifications: number;
  totalHoursThisWeek: number;
  revenueThisMonth: number;
  tasksCompleted: number;
  upcomingDeadlines: number;
}

export interface SubcontractorProfile {
  id: number;
  userId: number;
  companyName: string;
  description?: string;
  specializations: string[];
  teamSize?: number;
  yearsInBusiness?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  licenseNumber?: string;
  insuranceInfo?: string;
  avgRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  reviewerId: number;
  subcontractorId: number;
  projectId?: number;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
  reviewerName?: string;
}
