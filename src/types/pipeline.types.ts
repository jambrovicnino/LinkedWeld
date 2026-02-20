export type PipelineStage = 'interested' | 'test_scheduled' | 'test_passed' | 'docs_collecting' | 'visa_applied' | 'visa_approved' | 'arrived';

export interface PipelineCandidate {
  id: number;
  first_name: string;
  last_name: string;
  nationality: string;
  phone: string;
  email: string;
  stage: PipelineStage;
  expected_arrival_date: string | null;
  notes: string;
  docsReceived?: number;
  docsTotal?: number;
  created_at: string;
  updated_at: string;
}

export interface PipelineDocument {
  id: number;
  candidate_id: number;
  doc_type: string;
  is_received: number;
  received_date: string | null;
  notes: string;
  created_at: string;
}
