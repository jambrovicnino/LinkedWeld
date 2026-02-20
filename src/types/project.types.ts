export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AssignmentStatus = 'pending' | 'accepted' | 'declined' | 'active' | 'completed';

export interface Project {
  id: number;
  title: string;
  description?: string;
  clientId?: number;
  subcontractorId?: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  currency: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  subcontractorName?: string;
  assignmentCount?: number;
}

export interface ProjectAssignment {
  id: number;
  projectId: number;
  workerId: number;
  roleOnProject: string;
  hourlyRate?: number;
  status: AssignmentStatus;
  assignedAt: string;
  workerName?: string;
  workerTrade?: string;
}

export interface ProjectMilestone {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  sortOrder: number;
  createdAt: string;
}

export interface ProjectFormData {
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget?: number;
  currency: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}
