import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { pool } from './db';

const CATEGORIES = [
  {
    name: 'Patient Reports',
    slug: 'patient-reports',
    description: 'Patient census, demographic listings, infection surveillance, certifications, and vital sign logs.',
    display_order: 1,
    icon: 'Users'
  },
  {
    name: 'Schedule Reports',
    slug: 'schedule-reports',
    description: 'Master schedule itineraries, deviations, past due recertifications, authorization utilization, and visit analytics.',
    display_order: 2,
    icon: 'Calendar'
  },
  {
    name: 'Employee Reports',
    slug: 'employee-reports',
    description: 'Staff licensing records, personnel rosters, task distributions, and credentials compliance.',
    display_order: 3,
    icon: 'UserCheck'
  },
  {
    name: 'Clinician Reports',
    slug: 'clinician-reports',
    description: 'Therapy visit exceptions, physician order queues, wound management, and clinical OASIS tracking.',
    display_order: 4,
    icon: 'Activity'
  }
];

const REPORTS = [
  // A. Patient Reports (23)
  { category: 'patient-reports', name: '60 Day Summary By Patient', slug: '60-day-summary-by-patient', order: 1 },
  { category: 'patient-reports', name: 'Average Length Of Stay', slug: 'average-length-of-stay', order: 2 },
  { category: 'patient-reports', name: 'CAHPS', slug: 'cahps', order: 3 },
  { category: 'patient-reports', name: 'COVID-19 Vaccinations', slug: 'covid-19-vaccinations', order: 4 },
  { category: 'patient-reports', name: 'Discharge Patients', slug: 'discharge-patients', order: 5 },
  { category: 'patient-reports', name: 'Emergency Contact Listing', slug: 'emergency-contact-listing', order: 6 },
  { category: 'patient-reports', name: 'Emergency Preparedness', slug: 'emergency-preparedness', order: 7 },
  { category: 'patient-reports', name: 'Expiring Authorizations', slug: 'expiring-authorizations', order: 8 },
  { category: 'patient-reports', name: 'Incident Surveillance', slug: 'incident-surveillance', route: 'list-incident-logs', order: 9 },
  { category: 'patient-reports', name: 'Infection Surveillance', slug: 'infection-surveillance', route: 'list-infection-logs', order: 10 },
  { category: 'patient-reports', name: 'Patient Address Listing', slug: 'patient-address-listing', order: 11 },
  { category: 'patient-reports', name: 'Patient Birthday Listing', slug: 'patient-birthday-listing', order: 12 },
  { category: 'patient-reports', name: 'Patient By Physician Listing', slug: 'patient-by-physician-listing', order: 13 },
  { category: 'patient-reports', name: 'Patient By Responsible Case Manager Listing', slug: 'patient-by-responsible-case-manager-listing', order: 14 },
  { category: 'patient-reports', name: 'Patient By Responsible Employee Listing', slug: 'patient-by-responsible-employee-listing', order: 15 },
  { category: 'patient-reports', name: 'Patient List', slug: 'patient-list', route: 'list-patients', order: 16 },
  { category: 'patient-reports', name: 'Patient Roster', slug: 'patient-roster', order: 17 },
  { category: 'patient-reports', name: 'Patient Start Of Care Certification Period Listing', slug: 'patient-start-of-care-certification-period-listing', order: 18 },
  { category: 'patient-reports', name: 'Patient Vital Sign', slug: 'patient-vital-sign', order: 19 },
  { category: 'patient-reports', name: 'Referral', slug: 'referral', order: 20 },
  { category: 'patient-reports', name: 'Referral Log', slug: 'referral-log', order: 21 },
  { category: 'patient-reports', name: 'Survey Census', slug: 'survey-census', order: 22 },
  { category: 'patient-reports', name: 'Survey Census (By Date Range)', slug: 'survey-census-by-date-range', order: 23 },

  // B. Schedule Reports (17)
  { category: 'schedule-reports', name: 'Authorization Utilization Case Manager Task List', slug: 'authorization-utilization-case-manager-task-list', order: 1 },
  { category: 'schedule-reports', name: 'Days Since Last Visit', slug: 'days-since-last-visit', order: 2 },
  { category: 'schedule-reports', name: 'Employee Daily Work Schedule', slug: 'employee-daily-work-schedule', order: 3 },
  { category: 'schedule-reports', name: 'Employee Monthly Work Schedule', slug: 'employee-monthly-work-schedule', order: 4 },
  { category: 'schedule-reports', name: 'Employee Weekly Schedule', slug: 'employee-weekly-schedule', order: 5 },
  { category: 'schedule-reports', name: 'Missing Authorization', slug: 'missing-authorization', order: 6 },
  { category: 'schedule-reports', name: 'Past Due Recertifications', slug: 'past-due-recertifications', route: 'past-due-recertifications-report', order: 7 },
  { category: 'schedule-reports', name: 'Past Due Visits', slug: 'past-due-visits', order: 8 },
  { category: 'schedule-reports', name: 'Past Due Visits By Discipline', slug: 'past-due-visits-by-discipline', order: 9 },
  { category: 'schedule-reports', name: 'Patient Monthly Schedule', slug: 'patient-monthly-schedule', order: 10 },
  { category: 'schedule-reports', name: 'Patient Weekly Schedule', slug: 'patient-weekly-schedule', order: 11 },
  { category: 'schedule-reports', name: 'Schedule Deviation', slug: 'schedule-deviation', route: 'schedule-deviation-report', order: 12 },
  { category: 'schedule-reports', name: 'Schedule Report', slug: 'schedule-report', route: 'schedule-report', order: 13 },
  { category: 'schedule-reports', name: 'Unscheduled Visits', slug: 'unscheduled-visits', route: 'unscheduled-visits-report', order: 14 },
  { category: 'schedule-reports', name: 'Upcoming Recertifications', slug: 'upcoming-recertifications', route: 'upcoming-recerts', order: 15 },
  { category: 'schedule-reports', name: 'Visits By Status', slug: 'visits-by-status', order: 16 },
  { category: 'schedule-reports', name: 'Visits By Type', slug: 'visits-by-type', order: 17 },

  // C. Employee Reports (9)
  { category: 'employee-reports', name: 'All Employee Licenses/Records Listing', slug: 'all-employee-licenses-records-listing', order: 1 },
  { category: 'employee-reports', name: 'Employee Birthday Listing', slug: 'employee-birthday-listing', order: 2 },
  { category: 'employee-reports', name: 'Employee Licenses/Records Listing', slug: 'employee-licenses-records-listing', order: 3 },
  { category: 'employee-reports', name: 'Employee List', slug: 'employee-list', route: 'list-users', order: 4 },
  { category: 'employee-reports', name: 'Employee Permissions', slug: 'employee-permissions', order: 5 },
  { category: 'employee-reports', name: 'Employee Roster', slug: 'employee-roster', order: 6 },
  { category: 'employee-reports', name: 'Employee Tasks By Date Range', slug: 'employee-tasks-by-date-range', order: 7 },
  { category: 'employee-reports', name: 'Employee Visits By Date Range', slug: 'employee-visits-by-date-range', order: 8 },
  { category: 'employee-reports', name: 'Expiring Licenses/Records', slug: 'expiring-licenses-records', order: 9 },

  // D. Clinician Reports (12)
  { category: 'clinician-reports', name: '13th And 19th Therapy Visit Exception', slug: '13th-and-19th-therapy-visit-exception', order: 1 },
  { category: 'clinician-reports', name: '13th Therapy Re-evaluation Exception', slug: '13th-therapy-re-evaluation-exception', order: 2 },
  { category: 'clinician-reports', name: '19th Therapy Re-evaluation Exception', slug: '19th-therapy-re-evaluation-exception', order: 3 },
  { category: 'clinician-reports', name: 'Missed Visit', slug: 'missed-visit', route: 'list-missed-visits', order: 4 },
  { category: 'clinician-reports', name: 'Open OASIS', slug: 'open-oasis', route: 'not-exported-oasis', order: 5 },
  { category: 'clinician-reports', name: 'Orders Pending Signature', slug: 'orders-pending-signature', route: 'orders-pending-md-signature', order: 6 },
  { category: 'clinician-reports', name: 'Orders To Be Sent', slug: 'orders-to-be-sent', route: 'orders-to-be-sent', order: 7 },
  { category: 'clinician-reports', name: 'Patient Diagnosis Codes', slug: 'patient-diagnosis-codes', order: 8 },
  { category: 'clinician-reports', name: 'Physician Order History', slug: 'physician-order-history', route: 'orders-history', order: 9 },
  { category: 'clinician-reports', name: 'Plan of Care History', slug: 'plan-of-care-history', order: 10 },
  { category: 'clinician-reports', name: 'Therapy Management', slug: 'therapy-management', order: 11 },
  { category: 'clinician-reports', name: 'Wound Manager', slug: 'wound-manager', order: 12 }
];

export async function initReportCenterDatabase() {
  try {
    // 1. Create report_categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS report_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        icon VARCHAR(50) DEFAULT 'FileText',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id UUID NOT NULL REFERENCES report_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        route VARCHAR(255),
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reports_category_id ON reports(category_id);
      CREATE INDEX IF NOT EXISTS idx_reports_slug ON reports(slug);
    `);

    // 3. Upsert Categories
    for (const cat of CATEGORIES) {
      await pool.query(`
        INSERT INTO report_categories (name, slug, description, display_order, icon, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            display_order = EXCLUDED.display_order,
            icon = EXCLUDED.icon,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP;
      `, [cat.name, cat.slug, cat.description, cat.display_order, cat.icon]);
    }

    // Fetch category IDs map
    const catRows = await pool.query('SELECT id, slug FROM report_categories;');
    const catMap = new Map<string, string>();
    for (const r of catRows.rows) {
      catMap.set(r.slug, r.id);
    }

    // 4. Upsert all 61 Reports
    for (const rep of REPORTS) {
      const categoryId = catMap.get(rep.category);
      if (!categoryId) continue;

      await pool.query(`
        INSERT INTO reports (category_id, name, slug, description, route, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true)
        ON CONFLICT (slug) DO UPDATE
        SET category_id = EXCLUDED.category_id,
            name = EXCLUDED.name,
            route = EXCLUDED.route,
            display_order = EXCLUDED.display_order,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP;
      `, [
        categoryId,
        rep.name,
        rep.slug,
        `Auditing, analytics, and operational tracking for ${rep.name}.`,
        rep.route || null,
        rep.order
      ]);
    }

    const countCat = await pool.query('SELECT COUNT(*) FROM report_categories;');
    const countRep = await pool.query('SELECT COUNT(*) FROM reports;');
    console.log(`Report Center initialized successfully: ${countCat.rows[0].count} categories, ${countRep.rows[0].count} reports in database.`);
  } catch (err) {
    console.error('Error initializing Report Center database:', err);
    throw err;
  }
}

if (require.main === module) {
  initReportCenterDatabase()
    .then(() => pool.end())
    .catch(() => pool.end());
}
