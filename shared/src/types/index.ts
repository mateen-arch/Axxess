/**
 * Unified Domain Types for Axxess Healthcare Platform
 * Shared across Frontend Web, Mobile (React Native), and Backend API (Node.js/PostgreSQL)
 */

export type ServiceLine = 'home_health' | 'home_care' | 'hospice';

export type PriorityLevel = 'routine' | 'urgent' | 'stat' | 'critical';

export type VisitStatus = 
  | 'unassigned' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'missed' 
  | 'cancelled';

export type IntakeStatus = 
  | 'inquiry' 
  | 'referral' 
  | 'insurance_verification' 
  | 'clinical_review' 
  | 'assessment_scheduled' 
  | 'admitted' 
  | 'declined';

export type PatientStatus = 
  | 'active' 
  | 'pending_admission' 
  | 'discharged' 
  | 'hospitalized' 
  | 'on_hold';

export interface Organization {
  id: string;
  name: string;
  code: string;
  serviceLines: ServiceLine[];
  activePatientCount: number;
  environment: 'production' | 'staging' | 'sandbox';
  releaseVersion: string;
}

export interface UserProfile {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  role: 'clinical_supervisor' | 'director_of_nursing' | 'field_nurse' | 'scheduler' | 'intake_coordinator' | 'administrator';
  avatarUrl?: string;
  unreadNotificationsCount: number;
}

export interface Patient {
  id: string;
  organizationId: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  serviceLine: ServiceLine;
  status: PatientStatus;
  primaryDiagnosis: string;
  assignedNurseName?: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  admissionDate: string;
  lastVisitDate?: string;
  nextScheduledVisit?: string;
}

export interface ScheduledVisit {
  id: string;
  organizationId: string;
  patientId: string;
  patientName: string;
  serviceLine: ServiceLine;
  visitType: 'skilled_nurse' | 'physical_therapy' | 'occupational_therapy' | 'aide_visit' | 'intake_assessment';
  status: VisitStatus;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  clinicianId?: string;
  clinicianName?: string;
  address: string;
  priority: PriorityLevel;
  notes?: string;
}

export interface IntakeItem {
  id: string;
  organizationId: string;
  serviceLine: ServiceLine;
  patientName: string;
  referralSource: string;
  dateReceived: string;
  stage: IntakeStatus;
  urgency: PriorityLevel;
  assignedCoordinator?: string;
}

export interface MessageItem {
  id: string;
  senderName: string;
  senderRole: string;
  subject: string;
  snippet: string;
  serviceLine: ServiceLine;
  organizationName: string;
  date: string;
  isRead: boolean;
  priority: PriorityLevel;
  patientId?: string;
  patientName?: string;
}

export interface DashboardMetrics {
  activePatients: {
    total: number;
    homeHealth: number;
    homeCare: number;
    hospice: number;
  };
  unreadMessagesCount: number;
  unassignedVisits7Days: number;
  intakeLast30Days: {
    inquiries: number;
    referrals: number;
    admitted: number;
  };
  scheduledVisitsLast30Days: {
    total: number;
    completed: number;
    inProgress: number;
    notYetStarted: number;
    unassigned: number;
    missed: number;
  };
}
