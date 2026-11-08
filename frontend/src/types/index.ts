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
  environment: string;
  releaseVersion: string;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  age?: number;
  gender: 'male' | 'female' | 'other';
  serviceLine: ServiceLine;
  status: PatientStatus;
  primaryDiagnosis: string;
  assignedNurseName?: string;
  phone: string;
  altPhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  admissionDate: string;
  nextScheduledVisit?: string;
  // Clinical Chart specific fields
  organization?: string;
  branch?: string;
  episodeStart?: string;
  episodeEnd?: string;
  startOfCareDate?: string;
  attendingPhysician?: string;
  insuranceName?: string;
  insuranceId?: string;
  primaryContactName?: string;
  primaryContactPhone?: string;
  primaryContactRelation?: string;
  secondaryContactName?: string;
  secondaryContactPhone?: string;
  fallRisk?: boolean;
  hospitalizationRisk?: boolean;
  infectionRisk?: boolean;
  admissionDetails?: Record<string, string | boolean | string[]>;
}

export interface PatientChartTask {
  id: string;
  patientId: string;
  task: string;
  discipline: 'Nursing' | 'PT' | 'OT' | 'ST' | 'HHA' | 'MSW' | 'Dietician' | 'Orders';
  serviceLine: ServiceLine;
  status: 'Completed' | 'Submitted With Signature' | 'Returned w/ Physician Signature' | 'Not Yet Due' | 'Not Yet Started' | 'Overdue';
  scheduleStart: string; // YYYY-MM-DD
  scheduleEnd: string; // YYYY-MM-DD
  actualDate?: string;
  visitTimeIn?: string;
  visitTimeOut?: string;
  travelStartTime?: string;
  travelEndTime?: string;
  assignedTo: string;
  assignedClinicianId?: string;
  billable?: boolean;
  payable?: boolean;
  surcharge?: number;
  mileage?: number;
  autoTravelTime?: string;
  autoMileage?: number;
  serviceLocationCode?: string;
  receivedDate?: string;
  confirmationStatus?: string;
  comments?: string; // Yellow sticky note
  returnReason?: string; // Red sticky note
  attachmentsCount?: number;
}

export interface ScheduledVisit {
  id: string;
  patientId: string;
  patientName: string;
  serviceLine: ServiceLine;
  visitType: string;
  status: VisitStatus;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  clinicianName?: string;
  priority: PriorityLevel;
  address: string;
}

export interface IntakeMetric {
  service: string;
  inquiry: number;
  referral: number;
  conversionRate: string;
}

export interface Referral {
  id: string;
  referralDate: string;
  requestedSoc: string;
  patientName: string;
  patientPhone: string;
  patientMrn?: string;
  branch: string;
  organization: string;
  lineOfService: string;
  referralType: string;
  dob: string;
  sex: 'Female' | 'Male' | 'Other';
  createdBy: string;
  liaison?: string;
  tags?: string;
  status?: 'pending' | 'admitted' | 'declined';
  notes?: string;
}

export interface Inquiry {
  id: string;
  inquiryDate: string;
  // Patient / Client Information
  clientFirstName: string;
  clientMiddleInitial?: string;
  clientLastName: string;
  clientPhone?: string;
  clientPhoneType?: 'Home' | 'Mobile' | 'Work';
  // Contact / Caller Information
  contactFirstName: string;
  contactMiddleInitial?: string;
  contactLastName: string;
  contactPhone: string;
  contactPhoneType: 'Home' | 'Mobile' | 'Work';
  contactPhoneExtn?: string;
  contactRelationship?: string;
  // Service & Operations
  branch: string;
  organization: string;
  serviceRequested: string;
  serviceLine: ServiceLine;
  assignedTeamMember: string;
  followUpDate: string;
  comments: string;
  status: 'new' | 'contacted' | 'evaluation_scheduled' | 'converted' | 'closed';
  urgency: PriorityLevel;
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
  patientName?: string;
  recipientNames?: string[];
  body?: string;
  regardingPatientId?: string;
  readReceiptRequested?: boolean;
  attachmentName?: string;
}

export interface HomeHealthEpisode {
  id: string;
  patientId: string;
  patientName: string;
  startOfCareDate: string;
  episodeStartDate: string;
  episodeEndDate: string;
  caseManager: string;
  primaryPhysician: string;
  primaryInsurance: string;
  secondaryInsurance: string;
  comments: string;
  createdAt: string;
}

export interface HomeHealthCommunicationNote {
  id: string;
  patientId: string;
  patientName: string;
  patientStatus: 'Active' | 'Discharged';
  episodeAssociated: string;
  physician: string;
  noteDate: string;
  communicationText: string;
  sendAsMessage: boolean;
  staffSignature: string;
  signatureDate: string;
  signatureTime: string;
  status: 'Saved' | 'Complete';
}

export type OrderType =
  | 'Medication Orders'
  | 'Plan of Care Orders'
  | 'Discipline Frequency'
  | 'Supply Manager'
  | 'Other';

export interface HomeHealthOrder {
  id: string;
  patientId: string;
  patientName: string;
  episodeAssociated: string;
  attendingPhysician: string;
  sendTo: string;
  copyTo?: string;
  date: string;
  time: string;
  effectiveDate: string;
  orderIsForNextEpisode: boolean;
  summaryTitle: string;
  orderType: OrderType;
  orderContent?: string;
  orderReadBackAndVerified: boolean;
  clinicianSignature: string;
  signatureDate: string;
  signatureTime: string;
  status: 'Draft' | 'Created';
  createdAt: string;
}

export interface FaceToFaceEncounter {
  id: string;
  patientStatus: 'Active' | 'Discharged';
  patientId: string;
  patientName: string;
  episodeAssociated: string;
  physician: string;
  requestDate: string;
  certifyingType: 'POC Certifying Physician' | 'Non POC Certifying Physician';
  status: 'Pending' | 'Certified' | 'Submitted';
  createdAt: string;
}

export type FacilityType =
  | 'Assisted Living Facility'
  | 'Hospice Facility'
  | 'Hospital'
  | 'Nursing Home / SNF'
  | 'Rehabilitation Hospital'
  | 'Residential Care Home'
  | 'Long Term Acute Care (LTACH)'
  | 'Independent Living'
  | 'Other';

export interface Facility {
  id: string;
  name: string;
  facilityType: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  contactFirstName?: string;
  contactLastName?: string;
  email?: string;
  phone?: string;
  fax?: string;
  comment?: string;
  createdAt: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  contactFirstName?: string;
  contactLastName?: string;
  email?: string;
  fax?: string;
  comment?: string;
  createdAt: string;
}

export interface InsurancePayer {
  id: string;
  payerName: string;
  payerType: string;
  payerId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  fax?: string;
  email?: string;
  contactName?: string;
  billingInfo: {
    addressFormat: string;
    dateFormat: string;
    nameFormat: string;
    currencyFormat: string;
    useAnotherTaxNumber: boolean;
    taxNumber?: string;
    patientNameIdentifier: string;
    patientNameOptions: string;
    priorityOfVisitInclude: boolean;
    pointOfOriginInclude: boolean;
    dischargeHourInclude: boolean;
    accidentStateInclude: boolean;
    reservedLocator30: string;
    includePayerNameAddressOnPaper: boolean;
    valueCode39a: string;
    valueCode39b: string;
    valueCode39c: string;
    valueCode39d: string;
    valueCode40a: string;
    valueCode40b: string;
    valueCode40c: string;
    valueCode40d: string;
    valueCode41a: string;
    valueCode41b: string;
    valueCode41c: string;
    valueCode41d: string;
    revenueCodeLocator42: string;
    revenueDescriptionLocator43: string;
    hippsCodeLocator44: string;
    serviceDateLocator45: string;
    serviceUnitsLocator46: string;
    totalChargesLocator47: string;
    payerNameA: string;
    payerNameB: string;
    payerNameC: string;
    billingProviderNpiLocator56: string;
    insuredNameA: string;
    insuredNameB: string;
    insuredNameC: string;
    employerNameIncludeLocator65: boolean;
    codeQualifierLocator66: string;
    admittingDiagnosisLocator69: string;
    reasonForVisitIncludeLocator70: boolean;
    attendingProviderLocator76: string;
    operatingPhysicianLocator77: string;
    otherProviderLocator78: string;
    renderingProviderLocator79: string;
    codeField81a: string;
    codeField81b: string;
    codeField81c: string;
    codeField81d: string;
  };
  feeSchedule?: {
    snRate: number;
    ptRate: number;
    otRate: number;
    stRate: number;
    mswRate: number;
    hhaRate: number;
  };
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  videoEmbedUrl?: string;
  timestamp: string;
  isRead?: boolean;
}

export interface EmployeeClinician {
  id: string;
  name: string;
  credentials: string;
  title: string;
  serviceLines: ServiceLine[];
  phone: string;
  branch: string;
  status: 'active' | 'on_leave' | 'inactive';
  payType?: string;
}

export interface EmployeeVisit {
  id: string;
  employeeId: string;
  employeeName: string;
  patientName: string;
  patientMrn?: string;
  visitType: string;
  serviceLine: ServiceLine;
  dayOfWeek: number; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  date: string;
  timeSlot: string;
  status: 'completed' | 'in_progress' | 'saved' | 'scheduled' | 'missed';
  locationType: 'home' | 'facility' | 'telehealth';
  evvStatus: 'verified' | 'pending' | 'flagged' | 'exempt';
  address?: string;
  notes?: string;
}

export interface UnassignedPatientVisit {
  id: string;
  patientName: string;
  patientMrn: string;
  patientPhone: string;
  patientAddress: string;
  serviceLine: ServiceLine;
  task: string;
  requiredCredentials: string;
  scheduledDate: string; // YYYY-MM-DD
  dayOfWeek: string;
  timeSlot: string;
  organization: string;
  branch: string;
  status: 'unassigned' | 'urgent' | 'pending_dispatch';
  priority: PriorityLevel;
  notes?: string;
}

export interface HuvSfvRecord {
  id: string;
  branch: string;
  team: string;
  firstName: string;
  lastName: string;
  mrn: string;
  patientStatus: 'Active' | 'Discharged' | 'Pending' | 'Hospitalized';
  task: string;
  type: 'HUV' | 'SFV';
  taskStatus: 'Completed' | 'Scheduled' | 'Documented' | 'Pending Signature' | 'Overdue';
  visitDate: string; // YYYY-MM-DD
  admissionDate: string; // YYYY-MM-DD
  daysRemaining: number;
  serviceLine: ServiceLine;
  notes?: string;
}
