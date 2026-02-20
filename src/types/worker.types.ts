export type Trade = 'welder' | 'pipefitter' | 'boilermaker' | 'ironworker' | 'sheet_metal' | 'other';
export type Availability = 'available' | 'busy' | 'unavailable';
export type CertStatus = 'active' | 'expired' | 'revoked' | 'pending_renewal';

export interface WorkerProfile {
  id: number;
  userId: number;
  trade: Trade;
  experienceYears?: number;
  hourlyRate?: number;
  bio?: string;
  skills: string[];
  availability: Availability;
  location?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  user?: { firstName: string; lastName: string; email: string; avatarUrl?: string };
}

export interface Certification {
  id: number;
  workerId: number;
  name: string;
  issuingBody?: string;
  certificateNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  documentId?: number;
  status: CertStatus;
  createdAt: string;
}

export interface AttendanceRecord {
  id: number;
  workerId: number;
  projectId?: number;
  checkIn: string;
  checkOut?: string;
  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
  hoursWorked?: number;
  notes?: string;
  createdAt: string;
  projectTitle?: string;
}

export interface CheckInPayload {
  projectId?: number;
  latitude: number;
  longitude: number;
  notes?: string;
}
