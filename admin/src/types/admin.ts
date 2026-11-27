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
