import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock store initialized with Standards Home Care real-world data
const systemState = {
  organization: {
    id: 'org-shc-01',
    name: 'Standards Home Care',
    code: 'SHC-001',
    environment: 'production',
    releaseVersion: 'v2.4.0-cloud',
    activePatients: {
      total: 87,
      homeHealth: 75,
      homeCare: 12,
      hospice: 0
    }
  },
  metrics: {
    activePatients: {
      total: 87,
      homeHealth: 75,
      homeCare: 12,
      hospice: 0
    },
    unreadMessagesCount: 169,
    unassignedVisits7Days: 0,
    intakeLast30Days: {
      inquiries: 18,
      referrals: 24,
      admitted: 19
    },
    scheduledVisitsLast30Days: {
      total: 571,
      completed: 537,
      inProgress: 11,
      notYetStarted: 0,
      unassigned: 0,
      missed: 23
    }
  },
  unreadMessages: [
    {
      id: 'msg-01',
      senderName: 'Alexandria Nelson, RN',
      senderRole: 'Clinical Supervisor',
      subject: 'Physician List Updates & Supervisor Follow-Up on Client Infection Logs',
      snippet: 'Please verify updated contact directives for Dr. Aris and complete weekly infection control audits.',
      serviceLine: 'home_care',
      organizationName: 'Standards Home Care',
      date: 'Today, 10:45 AM',
      isRead: false,
      priority: 'urgent',
      patientName: 'Eleanor Pemberton'
    },
    {
      id: 'msg-02',
      senderName: 'Johnathan Eaves',
      senderRole: 'Clinical Operations Director',
      subject: 'What You Missed at AGILE National Home Health Conference',
      snippet: 'Key takeaways on 2026 CMS regulatory shifts, EVV compliance checks, and value-based purchasing benchmarks.',
      serviceLine: 'home_care',
      organizationName: 'Standards Home Care',
      date: 'May 13, 2026',
      isRead: false,
      priority: 'routine'
    },
    {
      id: 'msg-03',
      senderName: 'Susanna Welch, BSN',
      senderRole: 'Field Nurse',
      subject: 'SN Pediatric Assessment Generates a Plan of Care',
      snippet: 'The initial 60-day recertification assessment for patient Pemberton is ready for supervisor sign-off.',
      serviceLine: 'home_care',
      organizationName: 'Standards Home Care',
      date: 'Apr 21, 2026',
      isRead: false,
      priority: 'routine',
      patientName: 'Lucas Vance'
    },
    {
      id: 'msg-04',
      senderName: 'Alexandria Nelson, RN',
      senderRole: 'Clinical Supervisor',
      subject: 'Last Chance to Connect, Collaborate and Shape the Future at AGILE',
      snippet: 'Registration deadline approaching for clinical workshop credentials and OASIS-E1 training certification.',
      serviceLine: 'home_health',
      organizationName: 'Standards Home Care',
      date: 'Apr 15, 2026',
      isRead: false,
      priority: 'routine'
    }
  ],
  patients: [
    {
      id: 'pat-1',
      mrn: 'MRN-78210',
      firstName: 'Eleanor',
      lastName: 'Pemberton',
      dob: '1948-04-12',
      gender: 'female',
      serviceLine: 'home_health',
      status: 'active',
      primaryDiagnosis: 'Chronic Heart Failure (CHF) & Mobility Impairment',
      assignedNurseName: 'Susanna Welch, BSN',
      phone: '(214) 555-0123',
      address: { street: '1422 Elm St', city: 'Dallas', state: 'TX', zipCode: '75201' },
      admissionDate: '2026-01-15',
      nextScheduledVisit: 'Tomorrow at 09:30 AM'
    },
    {
      id: 'pat-2',
      mrn: 'MRN-78211',
      firstName: 'Marcus',
      lastName: 'Vance',
      dob: '1955-11-20',
      gender: 'male',
      serviceLine: 'home_health',
      status: 'active',
      primaryDiagnosis: 'Post-Op Knee Arthroplasty Rehabilitation',
      assignedNurseName: 'David Lee, PT',
      phone: '(214) 555-0144',
      address: { street: '8910 Preston Rd', city: 'Plano', state: 'TX', zipCode: '75024' },
      admissionDate: '2026-03-02',
      nextScheduledVisit: 'Today at 02:00 PM'
    },
    {
      id: 'pat-3',
      mrn: 'MRN-78212',
      firstName: 'Beatrice',
      lastName: 'Holloway',
      dob: '1941-08-05',
      gender: 'female',
      serviceLine: 'home_care',
      status: 'active',
      primaryDiagnosis: 'Alzheimers Support & Daily Living Assistance',
      assignedNurseName: 'Maria Santos, CNA',
      phone: '(214) 555-0177',
      address: { street: '402 Oak Ave', city: 'Richardson', state: 'TX', zipCode: '75080' },
      admissionDate: '2025-11-10',
      nextScheduledVisit: 'Today at 04:30 PM'
    },
    {
      id: 'pat-4',
      mrn: 'MRN-78213',
      firstName: 'David',
      lastName: 'Kowalski',
      dob: '1962-02-17',
      gender: 'male',
      serviceLine: 'home_health',
      status: 'active',
      primaryDiagnosis: 'Type II Diabetes & Diabetic Foot Ulcer (Stage 2)',
      assignedNurseName: 'Susanna Welch, BSN',
      phone: '(214) 555-0189',
      address: { street: '772 MacArthur Blvd', city: 'Irving', state: 'TX', zipCode: '75063' },
      admissionDate: '2026-02-18',
      nextScheduledVisit: 'Nov 02 at 11:00 AM'
    }
  ],
  announcements: [
    {
      id: 'ann-1',
      title: 'Hospice & Home Care Is A Service Of The Future',
      summary: 'Watch key healthcare leaders discuss the transition into modern digital EHR, patient-centric outcomes, and modern care at home.',
      category: 'Care Innovation',
      videoEmbedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    },
    {
      id: 'ann-2',
      title: 'How Axxess Intelligence Reduces Administrative Burden in Care at Home',
      summary: 'Automate routine clinical documentation, streamline QA reviews, and free up clinicians to focus on direct patient bedside care.',
      category: 'Axxess AI Insights'
    },
    {
      id: 'ann-3',
      title: 'The Hidden Revenue Leak That AI Can Fix (And Most Organizations Do Not Realize)',
      summary: 'Eliminate missed visit triggers, avoid Low Utilization Payment Adjustments (LUPA), and secure compliance audit readiness.',
      category: 'Financial Health'
    }
  ]
};

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/dashboard/metrics', (req: Request, res: Response) => {
  res.json(systemState.metrics);
});

app.get('/api/organization', (req: Request, res: Response) => {
  res.json(systemState.organization);
});

app.get('/api/messages', (req: Request, res: Response) => {
  res.json(systemState.unreadMessages);
});

app.get('/api/patients', (req: Request, res: Response) => {
  res.json(systemState.patients);
});

app.get('/api/announcements', (req: Request, res: Response) => {
  res.json(systemState.announcements);
});

app.listen(PORT, () => {
  console.log(`[Axxess Healthcare API] Running on http://localhost:${PORT}`);
});
