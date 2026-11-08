import { ChatConversation, ChatMessage, CallLogItem, PlannerTaskItem } from '../types/connectAndPlanner';

export const initialConversations: ChatConversation[] = [
  {
    id: 'conv-care-abuissa',
    type: 'care_team',
    title: 'Heather Abuissa (1061) Care Team',
    subtitle: 'Melissa Sweeney RN, Dr. Gupta, Nathalie B.',
    patientId: 'pat-abuissa',
    patientName: 'Heather Abuissa',
    serviceLine: 'home_health',
    participants: [
      { id: 'cli-01', name: 'Melissa Sweeney', role: 'Primary Field Nurse (RN)', status: 'online' },
      { id: 'cli-02', name: 'Dr. Mallishree Gupta', role: 'Attending Physician', status: 'busy' },
      { id: 'cli-03', name: 'Nathalie Bernadeau', role: 'Case Manager (RN)', status: 'online' }
    ],
    lastMessage: {
      senderName: 'Melissa Sweeney, RN',
      content: 'Wound measurement updated: 2.1cm x 1.4cm with healthy granulation tissue. Order renewal requested.',
      timestamp: '10:24 AM',
      isRead: false
    },
    unreadCount: 2,
    isPinned: true,
    isUrgent: false
  },
  {
    id: 'conv-dr-gupta',
    type: 'direct',
    title: 'Dr. Mallishree Gupta',
    subtitle: 'Attending Physician • Internal Medicine',
    serviceLine: 'home_health',
    participants: [
      { id: 'cli-02', name: 'Dr. Mallishree Gupta', role: 'Attending Physician', status: 'online' }
    ],
    lastMessage: {
      senderName: 'Dr. Mallishree Gupta',
      content: 'Encounter note signed for Jeffrey Antoniotti. Continuing current antibiotic therapy for 7 more days.',
      timestamp: '09:45 AM',
      isRead: false
    },
    unreadCount: 1,
    isPinned: true,
    isUrgent: true
  },
  {
    id: 'conv-melissa-sweeney',
    type: 'direct',
    title: 'Melissa Sweeney, RN',
    subtitle: 'Field Clinician • Home Health',
    serviceLine: 'home_health',
    participants: [
      { id: 'cli-01', name: 'Melissa Sweeney', role: 'Field Clinician (RN)', status: 'online' }
    ],
    lastMessage: {
      senderName: 'Melissa Sweeney, RN',
      content: 'Pt requested dressing change rescheduled to tomorrow 09:30 AM due to nephrology follow-up.',
      timestamp: '08:50 AM',
      isRead: true
    },
    unreadCount: 0,
    isPinned: false
  },
  {
    id: 'conv-david-lee',
    type: 'direct',
    title: 'David Lee, PT',
    subtitle: 'Physical Therapist • Rehabilitation Lead',
    serviceLine: 'home_health',
    participants: [
      { id: 'cli-04', name: 'David Lee', role: 'Physical Therapist (PT)', status: 'busy' }
    ],
    lastMessage: {
      senderName: 'David Lee, PT',
      content: 'TUG score improved to 13.8 seconds for Marcus Vance. Progressing to quad strengthening protocol.',
      timestamp: 'Yesterday',
      isRead: true
    },
    unreadCount: 0
  },
  {
    id: 'conv-triage-channel',
    type: 'channel',
    title: 'Standards Home Care - Clinical Triage',
    subtitle: 'Agency-wide on-call broadcast & critical intake',
    serviceLine: 'home_health',
    participants: [
      { id: 'all-triage', name: 'All Triage Staff', role: 'Care Team', status: 'online' }
    ],
    lastMessage: {
      senderName: 'Alexandria Nelson, RN',
      content: 'Weekend on-call coverage roster published. Please review shift swaps by 3:00 PM today.',
      timestamp: 'Yesterday',
      isRead: true
    },
    unreadCount: 0
  },
  {
    id: 'conv-care-anis',
    type: 'care_team',
    title: 'Marie V. Anis (1035) Care Team',
    subtitle: 'Nathalie Bernadeau RN, Maria Santos CNA',
    patientId: 'pat-anis',
    patientName: 'Marie V. Anis',
    serviceLine: 'home_health',
    participants: [
      { id: 'cli-03', name: 'Nathalie Bernadeau', role: 'Field Nurse', status: 'online' },
      { id: 'cli-05', name: 'Maria Santos', role: 'Home Health Aide (CNA)', status: 'offline' }
    ],
    lastMessage: {
      senderName: 'Nathalie Bernadeau, RN',
      content: 'BP stabilized at 128/82 mmHg after morning carvedilol dose adjustment.',
      timestamp: 'Nov 04',
      isRead: true
    },
    unreadCount: 0
  }
];

export const initialMessagesMap: Record<string, ChatMessage[]> = {
  'conv-care-abuissa': [
    {
      id: 'msg-abu-01',
      senderId: 'cli-01',
      senderName: 'Melissa Sweeney, RN',
      senderRole: 'Field Clinician',
      isCurrentUser: false,
      content: 'Good morning team. I completed Heather Abuissa’s wound debridement this morning. Staged dressing change with calcium alginate.',
      timestamp: '09:15 AM',
      date: 'Today',
      isRead: true
    },
    {
      id: 'msg-abu-02',
      senderId: 'current-user',
      senderName: 'Hilder M., RN',
      senderRole: 'Clinical Supervisor',
      isCurrentUser: true,
      content: 'Thank you Melissa. Did the patient report any discomfort or signs of peripheral edema?',
      timestamp: '09:22 AM',
      date: 'Today',
      isRead: true
    },
    {
      id: 'msg-abu-03',
      senderId: 'cli-01',
      senderName: 'Melissa Sweeney, RN',
      senderRole: 'Field Clinician',
      isCurrentUser: false,
      content: 'Mild 1+ pitting edema on the left ankle. Capillary refill < 3 seconds. Photo uploaded to clinical chart attachments.',
      timestamp: '09:40 AM',
      date: 'Today',
      isRead: true,
      attachment: {
        name: 'Wound_Debridement_Encounter_1106.pdf',
        type: 'pdf',
        size: '1.8 MB'
      }
    },
    {
      id: 'msg-abu-04',
      senderId: 'cli-02',
      senderName: 'Dr. Mallishree Gupta',
      senderRole: 'Attending Physician',
      isCurrentUser: false,
      content: 'Reviewing the photo now. Looks much cleaner than last week. Please renew the dressing order for 14 more days. Order signed in Axxess.',
      timestamp: '10:05 AM',
      date: 'Today',
      isRead: true
    },
    {
      id: 'msg-abu-05',
      senderId: 'cli-01',
      senderName: 'Melissa Sweeney, RN',
      senderRole: 'Field Clinician',
      isCurrentUser: false,
      content: 'Wound measurement updated: 2.1cm x 1.4cm with healthy granulation tissue. Order renewal requested.',
      timestamp: '10:24 AM',
      date: 'Today',
      isRead: false
    }
  ],
  'conv-dr-gupta': [
    {
      id: 'msg-gup-01',
      senderId: 'current-user',
      senderName: 'Hilder M., RN',
      senderRole: 'Clinical Supervisor',
      isCurrentUser: true,
      content: 'Dr. Gupta, sending over the revised 485 Plan of Care for Jeffrey Antoniotti (MRN 1193) for your digital signature.',
      timestamp: '09:10 AM',
      date: 'Today',
      isRead: true
    },
    {
      id: 'msg-gup-02',
      senderId: 'cli-02',
      senderName: 'Dr. Mallishree Gupta',
      senderRole: 'Attending Physician',
      isCurrentUser: false,
      content: 'Encounter note signed for Jeffrey Antoniotti. Continuing current antibiotic therapy for 7 more days.',
      timestamp: '09:45 AM',
      date: 'Today',
      isRead: false,
      urgent: true,
      attachment: {
        name: 'Signed_Physician_Order_Antoniotti.pdf',
        type: 'pdf',
        size: '640 KB'
      }
    }
  ],
  'conv-melissa-sweeney': [
    {
      id: 'msg-mel-01',
      senderId: 'cli-01',
      senderName: 'Melissa Sweeney, RN',
      senderRole: 'Field Clinician',
      isCurrentUser: false,
      content: 'Pt requested dressing change rescheduled to tomorrow 09:30 AM due to nephrology follow-up.',
      timestamp: '08:50 AM',
      date: 'Today',
      isRead: true
    }
  ],
  'conv-david-lee': [
    {
      id: 'msg-dav-01',
      senderId: 'cli-04',
      senderName: 'David Lee, PT',
      senderRole: 'Physical Therapist',
      isCurrentUser: false,
      content: 'TUG score improved to 13.8 seconds for Marcus Vance. Progressing to quad strengthening protocol.',
      timestamp: 'Yesterday',
      date: 'Yesterday',
      isRead: true
    }
  ],
  'conv-triage-channel': [
    {
      id: 'msg-tri-01',
      senderId: 'cli-alex',
      senderName: 'Alexandria Nelson, RN',
      senderRole: 'Clinical Supervisor',
      isCurrentUser: false,
      content: 'Weekend on-call coverage roster published. Please review shift swaps by 3:00 PM today.',
      timestamp: 'Yesterday',
      date: 'Yesterday',
      isRead: true
    }
  ],
  'conv-care-anis': [
    {
      id: 'msg-ani-01',
      senderId: 'cli-03',
      senderName: 'Nathalie Bernadeau, RN',
      senderRole: 'Field Nurse',
      isCurrentUser: false,
      content: 'BP stabilized at 128/82 mmHg after morning carvedilol dose adjustment.',
      timestamp: 'Nov 04',
      date: 'Nov 04',
      isRead: true
    }
  ]
};

export const initialCallLogs: CallLogItem[] = [
  {
    id: 'call-01',
    contactId: 'cli-01',
    contactName: 'Melissa Sweeney, RN',
    contactRole: 'Field Clinician (Home Health)',
    direction: 'inbound',
    callType: 'audio',
    duration: '04:12',
    timestamp: '11:15 AM',
    date: 'Today',
    status: 'completed',
    patientContext: 'Heather Abuissa (MRN 1061)'
  },
  {
    id: 'call-02',
    contactId: 'cli-02',
    contactName: 'Dr. Mallishree Gupta',
    contactRole: 'Attending Physician',
    direction: 'outbound',
    callType: 'video',
    duration: '08:45',
    timestamp: '09:30 AM',
    date: 'Today',
    status: 'completed',
    patientContext: 'Jeffrey Antoniotti (MRN 1193)'
  },
  {
    id: 'call-03',
    contactId: 'cli-04',
    contactName: 'David Lee, PT',
    contactRole: 'Physical Therapist',
    direction: 'missed',
    callType: 'audio',
    duration: '00:00',
    timestamp: 'Yesterday',
    date: 'Yesterday',
    status: 'missed',
    patientContext: 'Marcus Vance (MRN 78211)'
  },
  {
    id: 'call-04',
    contactId: 'cli-03',
    contactName: 'Nathalie Bernadeau, RN',
    contactRole: 'Case Manager',
    direction: 'outbound',
    callType: 'audio',
    duration: '03:20',
    timestamp: 'Nov 04',
    date: 'Nov 04',
    status: 'completed',
    patientContext: 'Marie V. Anis (MRN 1035)'
  }
];

export const initialPlannerTasks: PlannerTaskItem[] = [
  {
    id: 'plan-01',
    patientId: 'pat-abuissa',
    patientName: 'Abuissa, Heather',
    patientMrn: '1061',
    serviceLine: 'home_health',
    discipline: 'Nursing',
    title: '60-Day Episode Recertification & OASIS Follow-Up',
    taskType: 'recertification',
    assignedClinicianName: 'Melissa Sweeney, RN',
    assignedClinicianId: 'cli-01',
    dueDate: '2026-11-09',
    dueTime: '10:00 AM',
    episodeStartDate: '2026-09-02',
    episodeEndDate: '2026-11-12',
    recertificationDaysRemaining: 6,
    stage: 'to_plan',
    priority: 'urgent',
    notes: 'Recertification window closing in 6 days. OASIS-E Follow-up assessment must be completed.',
    billable: true,
    qCode: 'Q5001'
  },
  {
    id: 'plan-02',
    patientId: 'pat-antoniotti',
    patientName: 'Antoniotti, Jeffrey C.',
    patientMrn: '1193',
    serviceLine: 'home_health',
    discipline: 'Nursing',
    title: 'Physician 485 Plan of Care Signature Verification',
    taskType: 'physician_order',
    assignedClinicianName: 'Melissa Sweeney, RN',
    assignedClinicianId: 'cli-01',
    dueDate: '2026-11-07',
    dueTime: '02:00 PM',
    stage: 'pending_signoff',
    priority: 'stat',
    notes: 'Awaiting Dr. Gupta final digital counter-signature on revised antibiotic regimen.',
    billable: true,
    qCode: 'Q5001'
  },
  {
    id: 'plan-03',
    patientId: 'pat-anis',
    patientName: 'Anis, Marie V.',
    patientMrn: '1035',
    serviceLine: 'home_health',
    discipline: 'Nursing',
    title: 'Post-Op Cardiac Rehab Assessment & Medication Recon',
    taskType: 'visit',
    assignedClinicianName: 'Nathalie Bernadeau, RN',
    assignedClinicianId: 'cli-03',
    dueDate: '2026-11-06',
    dueTime: '11:00 AM',
    stage: 'in_progress',
    priority: 'routine',
    notes: 'Titrate beta-blocker as ordered. Check for orthostatic hypotension.',
    billable: true,
    qCode: 'Q5001'
  },
  {
    id: 'plan-04',
    patientId: 'pat-antoine',
    patientName: 'Antoine, Louis',
    patientMrn: '1002',
    serviceLine: 'home_health',
    discipline: 'Physical Therapy',
    title: 'COPD Oxygen Protocol & Respiratory Physical Therapy',
    taskType: 'visit',
    assignedClinicianName: 'David Lee, PT',
    assignedClinicianId: 'cli-04',
    dueDate: '2026-11-06',
    dueTime: '01:30 PM',
    stage: 'assigned',
    priority: 'routine',
    notes: 'Endurance pacing and pulse-ox monitoring during ambulation exercises.',
    billable: true,
    qCode: 'Q5001'
  },
  {
    id: 'plan-05',
    patientId: 'pat-auguste',
    patientName: 'Auguste, Jocelene',
    patientMrn: '464',
    serviceLine: 'home_health',
    discipline: 'Nursing',
    title: '14-Day Supervisory Visit for Home Health Aide',
    taskType: 'supervisory',
    assignedClinicianName: 'Elcie Jean-Baptiste, LPN',
    assignedClinicianId: 'cli-06',
    dueDate: '2026-11-08',
    dueTime: '09:00 AM',
    stage: 'to_plan',
    priority: 'urgent',
    notes: 'Mandatory CMS 14-day supervisory review of aide care plan adherence.',
    billable: false
  },
  {
    id: 'plan-06',
    patientId: 'pat-bah',
    patientName: 'Bah, Isatou',
    patientMrn: '1043',
    serviceLine: 'home_health',
    discipline: 'Nursing',
    title: 'Postpartum Hypertension & Maternal-Child Health Check',
    taskType: 'visit',
    assignedClinicianName: 'Selina Mwokipunda, RN',
    assignedClinicianId: 'cli-07',
    dueDate: '2026-11-06',
    dueTime: '02:00 PM',
    stage: 'completed',
    priority: 'routine',
    notes: 'Vitals stable. Patient education on pre-eclampsia warning signs delivered.',
    billable: true,
    qCode: 'Q5001'
  },
  {
    id: 'plan-07',
    patientId: 'pat-vance',
    patientName: 'Vance, Marcus',
    patientMrn: 'MRN-78211',
    serviceLine: 'home_health',
    discipline: 'Physical Therapy',
    title: 'Post-Op Total Knee Arthroplasty Functional Mobility Assessment',
    taskType: 'visit',
    assignedClinicianName: 'David Lee, PT',
    assignedClinicianId: 'cli-04',
    dueDate: '2026-11-07',
    dueTime: '10:30 AM',
    stage: 'assigned',
    priority: 'routine',
    notes: 'Range of motion assessment, gait training with rolling walker.',
    billable: true,
    qCode: 'Q5001'
  },
  {
    id: 'plan-08',
    patientId: 'pat-pemberton',
    patientName: 'Pemberton, Eleanor',
    patientMrn: 'MRN-78210',
    serviceLine: 'home_health',
    discipline: 'Nursing',
    title: 'OASIS-E Start of Care Comprehensive Assessment',
    taskType: 'oasis',
    assignedClinicianName: 'Susanna Welch, BSN',
    assignedClinicianId: 'cli-08',
    dueDate: '2026-11-07',
    dueTime: '09:00 AM',
    stage: 'to_plan',
    priority: 'stat',
    notes: 'SOC assessment must be locked and exported to state repository within 5 days.',
    billable: true,
    qCode: 'Q5001'
  }
];

