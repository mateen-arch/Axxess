export type SystemModuleKey = 'central' | 'home_health' | 'connect';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: 'active' | 'pending_approval' | 'suspended' | 'blocked';
  is_active: boolean;
  is_super_admin: boolean;
  department: string;
  title: string;
  module_access: SystemModuleKey[];
  license_number?: string;
  license_state?: string;
  license_status?: 'verified' | 'pending_verification' | 'expired';
  blocked_reason?: string;
  blocked_at?: string;
  blocked_by?: string;
  created_at: string;
}

export interface ModerationReport {
  id: string;
  report_type: 'message' | 'user' | 'phi_violation' | 'harassment';
  reporter_id?: string;
  reporter_name: string;
  reported_user_id?: string;
  reported_user_name: string;
  reported_message_id?: string;
  message_content?: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  action_taken: 'none' | 'message_deleted' | 'user_warned' | 'user_suspended' | 'user_blocked';
  admin_notes?: string;
  reviewed_by?: string;
  created_at: string;
  resolved_at?: string;
}

export interface AdminApproval {
  id: string;
  approval_type: 'clinician_credential' | 'doctor_order_signature' | 'prior_authorization' | 'emergency_override' | 'incident_signoff';
  module: SystemModuleKey;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'urgent' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  target_id?: string;
  target_type?: string;
  details: Record<string, any>;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleConfig {
  id: SystemModuleKey;
  name: string;
  status: 'operational' | 'maintenance' | 'restricted';
  description: string;
  version: string;
  settings: Record<string, any>;
  updated_by: string;
  updated_at: string;
  stats?: Record<string, number>;
}

export interface AdminAuditLog {
  id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  module: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface DashboardStats {
  users: {
    total_users: string;
    active_users: string;
    pending_users: string;
    blocked_users: string;
    suspended_users: string;
    central_users: string;
    home_health_users: string;
    connect_users: string;
  };
  moderation: {
    total_reports: string;
    pending_reports: string;
    critical_pending: string;
    users_blocked_count: string;
  };
  approvals: {
    total_approvals: string;
    pending_approvals: string;
    central_pending: string;
    home_health_pending: string;
    connect_pending: string;
  };
  modules: ModuleConfig[];
  urgentActionItems: {
    reports: ModerationReport[];
    approvals: AdminApproval[];
  };
  recentAuditLogs: AdminAuditLog[];
}

export interface AdminPatient {
  id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  service_line: string;
  status: string;
  approval_status: 'approved' | 'pending_approval' | 'rejected';
  primary_diagnosis: string;
  phone?: string;
  secondary_phone?: string;
  email?: string;
  branch: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  admission_date?: string;
  start_of_care_date?: string;
  episode_start?: string;
  episode_end?: string;
  attending_physician?: string;
  insurance_name?: string;
  policy_number?: string;
  primary_contact?: string;
  secondary_contact?: string;
  fall_risk?: boolean;
  hospitalization_risk?: boolean;
  infection_risk?: boolean;
  full_code?: boolean;
  assigned_clinician_name?: string;
  created_at: string;
}

export interface AdminClinician {
  id: string;
  name: string;
  title: string;
  credentials: string;
  discipline: string;
  branch: string;
  phone: string;
  status: string;
  work_status: string;
  service_lines: string[];
  latitude?: number;
  longitude?: number;
  current_address?: string;
  email?: string;
  user_status?: string;
  license_number?: string;
  license_status?: string;
}

export interface AdminVisit {
  id: string;
  patient_id: string;
  patient_name: string;
  mrn: string;
  employee_name: string;
  task: string;
  scheduled_date: string;
  time_slot: string;
  status: string;
  evv_status: string;
  address?: string;
  is_deviation?: boolean;
  deviation_reason?: string;
  notes?: string;
  branch: string;
}

export interface AdminEpisode {
  id: string;
  patient_id: string;
  mrn: string;
  patient_name: string;
  start_date: string;
  end_date: string;
  episode_number: number;
  status: string;
  approval_status: 'approved' | 'pending_approval' | 'rejected';
  primary_diagnosis?: string;
  attending_physician?: string;
  created_at: string;
}

export interface AdminOrder {
  id: string;
  patient_id: string;
  patient_name: string;
  attending_physician: string;
  summary_title: string;
  order_type: string;
  order_content?: string;
  order_date: string;
  status: string;
  approval_status: 'approved' | 'pending_approval' | 'rejected';
  clinician_signature: string;
  created_at: string;
}

export interface AdminDirectoryItem {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  facility_type?: string;
  credentials?: string;
  npi?: string;
  phone?: string;
  fax?: string;
  email?: string;
  city?: string;
  state?: string;
  zip?: string;
  status: string;
  approval_status: 'approved' | 'pending_approval' | 'rejected';
  created_at: string;
  contact_person?: string;
  payer_type?: string;
}

export interface AdminReportItem {
  id: string;
  report_name: string;
  category: string;
  format: string;
  file_name?: string;
  description?: string;
  has_file?: boolean;
  status: string;
  approval_status: 'approved' | 'pending_approval' | 'rejected';
  requested_by: string;
  file_size_bytes: number;
  download_url?: string;
  generated_at: string;
}

export interface AdminCensusStats {
  activeCensus: number;
  pendingPatients: number;
  byServiceLine: Array<{ service_line: string; count: string | number }>;
  byBranch: Array<{ branch: string; count: string | number }>;
}
