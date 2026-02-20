export type WorkerStatus = 'active' | 'inactive' | 'on_leave';
export type WeldingType = 'TIG' | 'MIG' | 'Stick' | 'Flux-Cored' | 'SAW' | 'Other';
export type DocType = 'trc' | 'welding_cert' | 'passport' | 'employment_contract' | 'medical_cert' | 'safety_training' | 'a1_form';
export type ValidityStatus = 'valid' | 'expiring_soon' | 'expired' | 'missing';

export interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  nationality: string;
  phone: string;
  email: string;
  hourly_rate: number;
  welding_types: WeldingType[];
  current_project_id: number | null;
  currentProjectName?: string | null;
  status: WorkerStatus;
  employment_start_date: string;
  notes: string;
  trcExpiryDate?: string | null;
  trcDaysLeft?: number | null;
  docCount?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkerDocument {
  id: number;
  worker_id: number;
  doc_type: DocType;
  trc_country?: string;
  trc_number?: string;
  trc_renewal_status?: string;
  welding_scope?: string;
  has_tuv?: number;
  pcc_status?: string;
  a1_country?: string;
  issue_date?: string;
  expiry_date?: string;
  file_name?: string;
  upload_status?: string;
  validity_status: ValidityStatus;
  notes?: string;
  created_at: string;
}

export interface WorkerDetail extends Worker {
  documents: WorkerDocument[];
  assignments: any[];
}
