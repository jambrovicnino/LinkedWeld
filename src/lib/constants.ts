export const APP_NAME = 'LinkedWeld Pro';

export const ROLES = {
  DIRECTOR: 'director',
  SECRETARY: 'secretary',
} as const;

export const WELDING_TYPES = ['TIG', 'MIG', 'Stick', 'Flux-Cored', 'SAW', 'Other'] as const;

export const NATIONALITIES = ['Indian', 'Filipino', 'Nepalese', 'Sri Lankan', 'Bangladeshi', 'Croatian', 'Serbian', 'Bosnian', 'Other'] as const;

export const EU_COUNTRIES = ['Slovenia', 'Croatia', 'Austria', 'Germany', 'Italy', 'Czech Republic', 'Slovakia', 'Hungary', 'Poland', 'Romania', 'Other'] as const;

export const WORKER_DOC_TYPES = [
  { value: 'trc', label: 'Temporary Residence Card (TRC)' },
  { value: 'welding_cert', label: 'Welding Certificate' },
  { value: 'passport', label: 'Passport' },
  { value: 'employment_contract', label: 'Employment Contract' },
  { value: 'medical_cert', label: 'Medical Certificate' },
  { value: 'safety_training', label: 'Safety Training' },
  { value: 'a1_form', label: 'A1 Form (Posted Workers)' },
] as const;

export const PIPELINE_STAGES = [
  { value: 'interested', label: 'Interested', color: 'bg-gray-400' },
  { value: 'test_scheduled', label: 'Test Scheduled', color: 'bg-blue-400' },
  { value: 'test_passed', label: 'Test Passed', color: 'bg-cyan-400' },
  { value: 'docs_collecting', label: 'Collecting Docs', color: 'bg-amber-400' },
  { value: 'visa_applied', label: 'Visa Applied', color: 'bg-orange-400' },
  { value: 'visa_approved', label: 'Visa Approved', color: 'bg-emerald-400' },
  { value: 'arrived', label: 'Arrived', color: 'bg-green-500' },
] as const;

export const PIPELINE_DOC_CHECKLIST = [
  { type: 'certified_passport', label: 'Certified Passport Copy' },
  { type: 'power_of_attorney', label: 'Power of Attorney' },
  { type: 'signature_form', label: 'Signature Verification Form' },
  { type: 'criminal_record', label: 'Criminal Record Certificate' },
  { type: 'tuv_certs', label: 'TUV / Welding Certificates (Apostilled)' },
  { type: 'employment_contract', label: 'Employment Contract' },
  { type: 'photo', label: 'Passport Photo' },
] as const;

export const EXPENSE_CATEGORIES_LIST = [
  'Transport', 'Fuel', 'Accommodation', 'Per Diem', 'Tools/Equipment', 'Permits/Fees', 'Other',
] as const;

export const PROJECT_PHASES = [
  { value: 'mobilization', label: 'Mobilization', color: 'bg-blue-400' },
  { value: 'active', label: 'Active', color: 'bg-emerald-500' },
  { value: 'finishing', label: 'Finishing', color: 'bg-amber-400' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-400' },
] as const;

export const ALERT_THRESHOLDS = {
  TRC_CRITICAL_DAYS: 30,
  TRC_WARNING_DAYS: 90,
  CERT_WARNING_DAYS: 60,
  BUDGET_WARNING_PCT: 0.7,
  BUDGET_DANGER_PCT: 0.9,
} as const;
