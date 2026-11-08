export interface HomeHealthNavNode {
  id: string;
  label: string;
  badge?: string;
  children?: HomeHealthNavNode[];
}

export const HOME_HEALTH_NAV_SECTIONS: HomeHealthNavNode[] = [
  {
    id: 'home',
    label: 'Home',
    children: [
      {
        id: 'my-account',
        label: 'My Account',
        children: [
          { id: 'edit-profile', label: 'Edit Profile' },
          { id: 'reset-signature', label: 'Reset Signature' },
          { id: 'switch-to-homecare', label: 'Switch to Homecare' },
        ],
      },
      { id: 'dashboard', label: 'My Dashboard' },
      { id: 'my-messages', label: 'My Messages' },
      { id: 'my-schedule-tasks', label: 'My Schedule / Tasks' },
      { id: 'my-monthly-calendar', label: 'My Monthly Calendar' },
      { id: 'qa-center', label: 'Quality Assurance (QA) Center' },
    ],
  },
  {
    id: 'create',
    label: 'Create',
    children: [
      {
        id: 'new',
        label: 'New',
        children: [
          { id: 'create-patient', label: 'Patient' },
          { id: 'create-episode', label: 'Episode' },
          { id: 'compose-message', label: 'Compose Message' },
          { id: 'create-communication-note', label: 'Communication Notes' },
          { id: 'create-order', label: 'Order' },
          { id: 'create-face-to-face-encounter', label: 'Face-to-Face Encounter' },
          { id: 'create-facility', label: 'Facility' },
          { id: 'create-pharmacy', label: 'Pharmacy' },
          { id: 'create-insurance-payer', label: 'Insurance/Payer' },
          { id: 'create-physician', label: 'Physician' },
          { id: 'create-incident-log', label: 'Incident Log' },
          { id: 'create-infection-log', label: 'Infection Log' },
        ],
      },
    ],
  },
  {
    id: 'patients',
    label: 'Patients',
    children: [
      { id: 'patient-charts', label: 'Patient Charts' },
      { id: 'pending-admissions', label: 'Pending Admissions' },
      { id: 'non-admissions', label: 'Non-Admissions' },
      { id: 'deleted-patients', label: 'Deleted Patients' },
      { id: 'hospitalization-history', label: 'Hospitalization History' },
      { id: 'inpatient-facility-hold-list', label: 'Inpatient Facility and Hold List' },
    ],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    children: [
      { id: 'my-schedule-tasks', label: 'My Schedule / Tasks' },
      { id: 'schedule-unassigned-visits', label: 'Schedule Unassigned Visits' },
      { id: 'schedule-center', label: 'Schedule Center' },
      { id: 'reassign-schedule', label: 'Reassign Schedule' },
      { id: 'unscheduled-visits-report', label: 'Unscheduled Visits Report' },
      { id: 'schedule-report', label: 'Schedule Report' },
      { id: 'schedule-deviation-report', label: 'Schedule Deviation Report' },
    ],
  },
  {
    id: 'view',
    label: 'View',
    children: [
      {
        id: 'lists',
        label: 'Lists',
        children: [
          { id: 'list-patients', label: 'Patients' },
          { id: 'list-contacts', label: 'Contacts' },
          { id: 'list-tags', label: 'Tags' },
          { id: 'list-templates', label: 'Templates' },
          { id: 'list-non-admit-reasons', label: 'Non-Admit Reasons' },
          { id: 'list-facilities', label: 'Facilities' },
          { id: 'list-supplies', label: 'Supplies' },
          { id: 'list-pharmacies', label: 'Pharmacies' },
          { id: 'list-physicians', label: 'Physicians' },
          { id: 'list-insurances-payers', label: 'Insurances/Payers' },
          { id: 'list-users', label: 'Users' },
          { id: 'list-incident-logs', label: 'Incident Logs' },
          { id: 'list-infection-logs', label: 'Infection Logs' },
          { id: 'list-communication-notes', label: 'Communication Notes' },
          { id: 'list-missed-visits', label: 'Missed Visits' },
          { id: 'list-immunization-logs', label: 'Immunization Logs' },
        ],
      },
      { id: 'blank-forms', label: 'Blank Forms' },
      {
        id: 'oasis-activity-logs',
        label: 'OASIS Activity Logs',
        children: [{ id: 'not-exported-oasis', label: 'Not Exported OASIS' }],
      },
      { id: 'past-due-recertifications-report', label: 'Past Due Recertifications Report' },
      { id: 'upcoming-recerts', label: 'Upcoming Recerts' },
      {
        id: 'orders-management',
        label: 'Orders Management',
        children: [
          { id: 'orders-pending-co-signature', label: 'Orders Pending Co-Signature' },
          { id: 'orders-to-be-sent', label: 'Orders To Be Sent' },
          { id: 'orders-pending-md-signature', label: 'Orders Pending MD Signature' },
          { id: 'orders-history', label: 'Orders History' },
        ],
      },
      { id: 'print-queue', label: 'Print Queue' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    children: [
      { id: 'report-center', label: 'Report Center' },
      { id: 'completed-reports', label: 'Completed Reports' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    children: [
      { id: 'user-community', label: 'User Community', badge: 'New!' },
      { id: 'help-center', label: 'Help Center' },
      { id: 'on-demand-training', label: 'On-Demand Training' },
      { id: 'recent-software-updates', label: 'Recent Software Updates' },
      { id: 'covid-19-resource-center', label: 'COVID-19 Resource Center' },
      { id: 'follow-axxess', label: 'Follow Axxess' },
    ],
  },
  {
    id: 'axxess-intelligence',
    label: 'Axxess Intelligence',
    children: [{ id: 'ask-axxess', label: 'Ask Axxess' }],
  },
];

const collectRouteTitles = (nodes: HomeHealthNavNode[]): Record<string, string> =>
  nodes.reduce<Record<string, string>>((result, node) => {
    if (node.children) return { ...result, ...collectRouteTitles(node.children) };
    result[node.id] = node.label;
    return result;
  }, {});

export const HOME_HEALTH_PAGE_TITLES = collectRouteTitles(HOME_HEALTH_NAV_SECTIONS);
