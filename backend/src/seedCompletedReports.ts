import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/axxess'
});

export const STORAGE_DIR = path.resolve(__dirname, '../storage/reports');

export async function initCompletedReportsDatabase() {
  // Ensure storage folder exists
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }

  // 1. Create table generated_reports
  await pool.query(`
    CREATE TABLE IF NOT EXISTS generated_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
      report_name VARCHAR(255) NOT NULL,
      category_name VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500),
      file_format VARCHAR(20) NOT NULL,
      file_size_bytes BIGINT DEFAULT 0,
      status VARCHAR(50) NOT NULL,
      requested_by VARCHAR(255) NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      applied_filters JSONB DEFAULT '{}'::jsonb,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_gen_reports_status ON generated_reports(status);
    CREATE INDEX IF NOT EXISTS idx_gen_reports_requested_at ON generated_reports(requested_at DESC);
    CREATE INDEX IF NOT EXISTS idx_gen_reports_user_id ON generated_reports(user_id);
    CREATE INDEX IF NOT EXISTS idx_gen_reports_report_id ON generated_reports(report_id);
  `);

  // Check if existing records exist
  const countRes = await pool.query('SELECT COUNT(*)::int as count FROM generated_reports');
  if (countRes.rows[0].count > 0) {
    console.log(`[seedCompletedReports] generated_reports already has ${countRes.rows[0].count} records. Skipping seed.`);
    return;
  }

  console.log('[seedCompletedReports] Seeding initial generated reports into database...');

  // Fetch users to link
  const usersRes = await pool.query('SELECT id, full_name FROM users ORDER BY full_name ASC');
  const users = usersRes.rows;
  const adminUser = users.find(u => u.full_name?.includes('Director') || u.full_name?.includes('Alexandria')) || users[0] || { id: null, full_name: 'Director of Nursing' };
  const nurseUser = users.find(u => u.full_name?.includes('Susanna') || u.full_name?.includes('Sarah')) || users[1] || { id: null, full_name: 'Susanna Welch, BSN' };
  const clinUser = users.find(u => u.full_name?.includes('Hilder') || u.full_name?.includes('Carolyn')) || users[2] || { id: null, full_name: 'Hilder Magessa, RN' };
  const ptUser = users.find(u => u.full_name?.includes('Andre') || u.full_name?.includes('Prince')) || users[3] || { id: null, full_name: 'Andre Bellevue, PT' };

  // Fetch report references
  const reportsRes = await pool.query(`
    SELECT r.id, r.name, r.slug, c.name as category_name 
    FROM reports r 
    JOIN report_categories c ON r.category_id = c.id
  `);
  const reportMap = new Map<string, { id: string; name: string; category_name: string }>();
  reportsRes.rows.forEach(r => reportMap.set(r.name.toLowerCase(), r));

  // Helper to generate real sample Excel file
  const generateExcelFile = (filename: string, sheetName: string, headers: string[], rows: any[]) => {
    const filePath = path.join(STORAGE_DIR, filename);
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(filePath, buf);
    return { filePath, size: buf.length };
  };

  // Helper to generate real CSV file
  const generateCsvFile = (filename: string, headers: string[], rows: any[]) => {
    const filePath = path.join(STORAGE_DIR, filename);
    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    fs.writeFileSync(filePath, csvContent, 'utf8');
    const size = Buffer.byteLength(csvContent, 'utf8');
    return { filePath, size };
  };

  // 1. Schedule Report (XLSX, Completed)
  const schedRows = [
    { 'Patient': 'ABUISSA, HEATHER', 'MRN': '1061', 'Schedule Date': '10/26/2026', 'Time': '09:00 AM', 'Task': 'Skilled Nursing Visit', 'Status': 'Completed', 'Clinician': 'Alexandria Nelson, RN', 'Payable': 'Yes', 'Billable': 'Yes' },
    { 'Patient': 'ABUISSA, HEATHER', 'MRN': '1061', 'Schedule Date': '10/28/2026', 'Time': '11:00 AM', 'Task': 'PT Evaluation', 'Status': 'Completed', 'Clinician': 'Andre Bellevue, PT', 'Payable': 'Yes', 'Billable': 'Yes' },
    { 'Patient': 'BROWN, ELEANOR', 'MRN': '1042', 'Schedule Date': '10/29/2026', 'Time': '10:00 AM', 'Task': 'Wound Care Dressing', 'Status': 'Completed', 'Clinician': 'Sarah Jenkins, RN', 'Payable': 'Yes', 'Billable': 'Yes' },
    { 'Patient': 'CARSON, CHARLES', 'MRN': '1088', 'Schedule Date': '11/02/2026', 'Time': '01:30 PM', 'Task': 'HHA Personal Care', 'Status': 'Completed', 'Clinician': 'Clara Oswald, HHA', 'Payable': 'Yes', 'Billable': 'Yes' },
  ];
  const schedFile = generateExcelFile('Schedule_Report_20261122_093012.xlsx', 'Schedule Report', Object.keys(schedRows[0]), schedRows);

  // 2. Schedule Deviation Report (XLSX, Completed)
  const devRows = [
    { 'Branch': 'Standard Home Care', 'MRN': '1061', 'Task': 'Skilled Nursing Visit', 'Patient': 'ABUISSA, HEATHER', 'Status': 'Completed', 'User Name': 'Mario Fortune LPN', 'Schedule Visit': '10/26/2026', 'Visit Date': '10/27/2026 (+1d)' },
    { 'Branch': 'Standard Home Care', 'MRN': '1042', 'Task': 'Skilled Nursing Assessment', 'Patient': 'BROWN, ELEANOR', 'Status': 'Completed', 'User Name': 'Alexandria Nelson, RN', 'Schedule Visit': '10/28/2026', 'Visit Date': '10/28/2026 (0d)' },
    { 'Branch': 'Standard Home Care', 'MRN': '1088', 'Task': 'PT Evaluation', 'Patient': 'CARSON, CHARLES', 'Status': 'Missed Visit', 'User Name': 'Andre Bellevue, PT', 'Schedule Visit': '11/01/2026', 'Visit Date': 'Unscheduled' }
  ];
  const devFile = generateExcelFile('Schedule_Deviation_Report_20261122_101500.xlsx', 'Schedule Deviation', Object.keys(devRows[0]), devRows);

  // 3. Patient List (XLSX, Completed)
  const patRows = [
    { 'MRN': '1061', 'Name': 'Abuissa, Heather', 'DOB': '05/14/1958', 'Branch': 'Standards Home Care', 'Status': 'Active', 'Primary Diagnosis': 'Type 2 Diabetes mellitus (E11.9)', 'Case Manager': 'Alexandria Nelson, RN', 'Episode': '10/26/2026 - 12/24/2026' },
    { 'MRN': '1042', 'Name': 'Brown, Eleanor', 'DOB': '11/20/1949', 'Branch': 'Standards Home Care', 'Status': 'Active', 'Primary Diagnosis': 'Chronic Venous Stasis Ulcer (I87.2)', 'Case Manager': 'Carolyn Akukwe, RN', 'Episode': '10/12/2026 - 12/10/2026' },
    { 'MRN': '1088', 'Name': 'Carson, Charles', 'DOB': '02/03/1942', 'Branch': 'Standards Home Care', 'Status': 'Active', 'Primary Diagnosis': 'Congestive Heart Failure (I50.9)', 'Case Manager': 'Susanna Welch, BSN', 'Episode': '09/15/2026 - 11/13/2026' }
  ];
  const patFile = generateExcelFile('Patient_List_Master_20261122_084510.xlsx', 'Patient List', Object.keys(patRows[0]), patRows);

  // 4. Employee Roster (CSV, Completed)
  const empRows = [
    { 'Employee ID': 'EMP-101', 'Name': 'Alexandria Nelson, RN', 'Title': 'Clinical Supervisor', 'Discipline': 'Nursing', 'Branch': 'Standards Home Care', 'Status': 'Active', 'Email': 'alexandria.nelson@standardshomecare.com', 'Phone': '(555) 234-5678' },
    { 'Employee ID': 'EMP-102', 'Name': 'Susanna Welch, BSN', 'Title': 'Field Nurse RN', 'Discipline': 'Nursing', 'Branch': 'Standards Home Care', 'Status': 'Active', 'Email': 'susanna.welch@standardshomecare.com', 'Phone': '(555) 234-5679' },
    { 'Employee ID': 'EMP-103', 'Name': 'Andre Bellevue, PT', 'Title': 'Physical Therapist', 'Discipline': 'Physical Therapy', 'Branch': 'Standards Home Care', 'Status': 'Active', 'Email': 'andre.bellevue@standardshomecare.com', 'Phone': '(555) 234-5680' }
  ];
  const empFile = generateCsvFile('Employee_Roster_Current_20261122_112045.csv', Object.keys(empRows[0]), empRows);

  // 5. Infection Surveillance (XLSX, Completed)
  const infRows = [
    { 'Patient Name': 'ABUISSA, HEATHER', 'MRN': '1061', 'Date of Infection': '10/18/2026', 'Site': 'Urinary Tract (UTI)', 'Pathogen': 'E. coli', 'Treatment': 'Ciprofloxacin 500mg BID', 'Physician Notified': 'Yes', 'Resolved': 'Yes' },
    { 'Patient Name': 'BROWN, ELEANOR', 'MRN': '1042', 'Date of Infection': '10/22/2026', 'Site': 'Lower Extremity Surgical Wound', 'Pathogen': 'Staphylococcus aureus', 'Treatment': 'Vancomycin IV', 'Physician Notified': 'Yes', 'Resolved': 'In Progress' }
  ];
  const infFile = generateExcelFile('Infection_Surveillance_Report_20261121_160233.xlsx', 'Infection Logs', Object.keys(infRows[0]), infRows);

  // Seed data specifications
  const seedRecords = [
    {
      reportName: 'Schedule Report',
      categoryName: 'Schedule Reports',
      fileName: 'Schedule_Report_20261122_093012.xlsx',
      filePath: schedFile.filePath,
      format: 'XLSX',
      size: schedFile.size,
      status: 'Completed',
      requestedBy: adminUser.full_name || 'Director of Nursing',
      userId: adminUser.id,
      requestedAt: new Date(Date.now() - 3600 * 1000 * 5),
      startedAt: new Date(Date.now() - 3600 * 1000 * 5 + 3000),
      completedAt: new Date(Date.now() - 3600 * 1000 * 5 + 18000),
      appliedFilters: { branch: 'Standards Home Care', dateFrom: '10/01/2026', dateTo: '11/30/2026', status: 'All' },
      errorMessage: null
    },
    {
      reportName: 'Schedule Deviation',
      categoryName: 'Schedule Reports',
      fileName: 'Schedule_Deviation_Report_20261122_101500.xlsx',
      filePath: devFile.filePath,
      format: 'XLSX',
      size: devFile.size,
      status: 'Completed',
      requestedBy: clinUser.full_name || 'Hilder Magessa, RN',
      userId: clinUser.id,
      requestedAt: new Date(Date.now() - 3600 * 1000 * 4),
      startedAt: new Date(Date.now() - 3600 * 1000 * 4 + 2000),
      completedAt: new Date(Date.now() - 3600 * 1000 * 4 + 14000),
      appliedFilters: { branch: 'Standard Home Care', dateFrom: '10/01/2026', dateTo: '11/15/2026' },
      errorMessage: null
    },
    {
      reportName: 'Patient List',
      categoryName: 'Patient Reports',
      fileName: 'Patient_List_Master_20261122_084510.xlsx',
      filePath: patFile.filePath,
      format: 'XLSX',
      size: patFile.size,
      status: 'Completed',
      requestedBy: nurseUser.full_name || 'Susanna Welch, BSN',
      userId: nurseUser.id,
      requestedAt: new Date(Date.now() - 3600 * 1000 * 8),
      startedAt: new Date(Date.now() - 3600 * 1000 * 8 + 4000),
      completedAt: new Date(Date.now() - 3600 * 1000 * 8 + 22000),
      appliedFilters: { branch: 'Standards Home Care', status: 'Active' },
      errorMessage: null
    },
    {
      reportName: 'Employee Roster',
      categoryName: 'Employee Reports',
      fileName: 'Employee_Roster_Current_20261122_112045.csv',
      filePath: empFile.filePath,
      format: 'CSV',
      size: empFile.size,
      status: 'Completed',
      requestedBy: adminUser.full_name || 'Director of Nursing',
      userId: adminUser.id,
      requestedAt: new Date(Date.now() - 3600 * 1000 * 2),
      startedAt: new Date(Date.now() - 3600 * 1000 * 2 + 1000),
      completedAt: new Date(Date.now() - 3600 * 1000 * 2 + 8000),
      appliedFilters: { status: 'Active Employees' },
      errorMessage: null
    },
    {
      reportName: 'Infection Surveillance',
      categoryName: 'Patient Reports',
      fileName: 'Infection_Surveillance_Report_20261121_160233.xlsx',
      filePath: infFile.filePath,
      format: 'XLSX',
      size: infFile.size,
      status: 'Completed',
      requestedBy: clinUser.full_name || 'Hilder Magessa, RN',
      userId: clinUser.id,
      requestedAt: new Date(Date.now() - 3600 * 1000 * 26),
      startedAt: new Date(Date.now() - 3600 * 1000 * 26 + 3000),
      completedAt: new Date(Date.now() - 3600 * 1000 * 26 + 15000),
      appliedFilters: { timeframe: 'Last 30 Days' },
      errorMessage: null
    },
    {
      reportName: '60 Day Summary By Patient',
      categoryName: 'Patient Reports',
      fileName: '60_Day_Summary_Patient_1061.pdf',
      filePath: null,
      format: 'PDF',
      size: 0,
      status: 'Processing',
      requestedBy: ptUser.full_name || 'Andre Bellevue, PT',
      userId: ptUser.id,
      requestedAt: new Date(Date.now() - 60 * 1000 * 3),
      startedAt: new Date(Date.now() - 60 * 1000 * 2),
      completedAt: null,
      appliedFilters: { patientId: 'pat-1061', episode: '10/26/2026 - 12/24/2026' },
      errorMessage: null
    },
    {
      reportName: 'CAHPS',
      categoryName: 'Patient Reports',
      fileName: 'CAHPS_Survey_Report_Q4_2026.xlsx',
      filePath: null,
      format: 'XLSX',
      size: 0,
      status: 'Queued',
      requestedBy: adminUser.full_name || 'Director of Nursing',
      userId: adminUser.id,
      requestedAt: new Date(Date.now() - 60 * 1000 * 8),
      startedAt: null,
      completedAt: null,
      appliedFilters: { quarter: 'Q4 2026', sampleMethod: 'CMS Protocol' },
      errorMessage: null
    },
    {
      reportName: 'Expiring Authorizations',
      categoryName: 'Patient Reports',
      fileName: 'Expiring_Authorizations_Audit.xlsx',
      filePath: null,
      format: 'XLSX',
      size: 0,
      status: 'Failed',
      requestedBy: nurseUser.full_name || 'Susanna Welch, BSN',
      userId: nurseUser.id,
      requestedAt: new Date(Date.now() - 3600 * 1000 * 12),
      startedAt: new Date(Date.now() - 3600 * 1000 * 12 + 2000),
      completedAt: null,
      appliedFilters: { daysAhead: 30, payer: 'Medicare Advantage' },
      errorMessage: 'Payer clearinghouse connection timeout: Failed to retrieve EDI 278 authorization payload from gateway (HTTP 504 Gateway Timeout).'
    },
    {
      reportName: 'Unscheduled Visits',
      categoryName: 'Schedule Reports',
      fileName: 'Unscheduled_Visits_November_2026.xlsx',
      filePath: null,
      format: 'XLSX',
      size: 0,
      status: 'Failed',
      requestedBy: clinUser.full_name || 'Hilder Magessa, RN',
      userId: clinUser.id,
      requestedAt: new Date(Date.now() - 3600 * 1000 * 18),
      startedAt: new Date(Date.now() - 3600 * 1000 * 18 + 1500),
      completedAt: null,
      appliedFilters: { branch: 'Standards Home Care', discipline: 'All Disciplines' },
      errorMessage: 'Database serialization failure: concurrent update on visits partition lock during aggregation.'
    }
  ];

  for (const item of seedRecords) {
    const reportRef = reportMap.get(item.reportName.toLowerCase());
    await pool.query(`
      INSERT INTO generated_reports (
        report_id, report_name, category_name, file_name, file_path, file_format,
        file_size_bytes, status, requested_by, user_id, requested_at, started_at,
        completed_at, applied_filters, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      reportRef?.id || null,
      item.reportName,
      reportRef?.category_name || item.categoryName,
      item.fileName,
      item.filePath,
      item.format,
      item.size,
      item.status,
      item.requestedBy,
      item.userId,
      item.requestedAt,
      item.startedAt,
      item.completedAt,
      JSON.stringify(item.appliedFilters),
      item.errorMessage
    ]);
  }

  console.log(`[seedCompletedReports] Successfully seeded ${seedRecords.length} generated reports.`);
}

if (require.main === module) {
  initCompletedReportsDatabase().then(() => {
    console.log('Done');
    process.exit(0);
  }).catch(err => {
    console.error('Seed completed reports error:', err);
    process.exit(1);
  });
}
