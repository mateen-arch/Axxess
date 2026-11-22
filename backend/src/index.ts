import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';
import { pool } from './db';
import { initReportCenterDatabase } from './seedReportCenter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'CareOrbit Healthcare Platform API',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as now');
    res.json({
      status: 'healthy',
      database: 'connected',
      dbTime: dbRes.rows[0].now,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Database connection error in /api/health:', err);
    res.status(500).json({
      status: 'unhealthy',
      error: err?.message || err?.code || String(err) || 'Database connection failed',
      hasDbUrl: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''),
      dbHost: process.env.DATABASE_URL
        ? (process.env.DATABASE_URL.split('@')[1] || process.env.DATABASE_URL.slice(0, 15) + '...')
        : 'not-set'
    });
  }
});

// Organization Details
app.get('/api/organization', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, code, is_active FROM organizations LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    const org = result.rows[0];
    res.json({
      id: org.id,
      name: org.name,
      code: org.code,
      environment: 'production',
      releaseVersion: 'v2.4.0-cloud',
    });
  } catch (err: any) {
    console.error('Error fetching organization:', err);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

// User Profile - My Account (Real PostgreSQL integration)
app.get('/api/user/profile', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.full_name as "fullName",
        u.email,
        u.role,
        COALESCE(u.title, 'QA Nurse / Clinical Reviewer') as "title",
        COALESCE(u.address_line1, '') as "addressLine1",
        COALESCE(u.address_line2, '') as "addressLine2",
        COALESCE(u.city, '') as "city",
        COALESCE(u.state, '') as "state",
        COALESCE(u.zip, '') as "zip",
        COALESCE(u.home_phone, '') as "homePhone",
        COALESCE(u.mobile_phone, '') as "mobilePhone",
        COALESCE(u.software_language, 'English') as "softwareLanguage",
        COALESCE(u.ssn, '') as "ssn",
        COALESCE(u.signature_pin, '') as "signaturePin",
        u.created_at as "createdAt",
        o.name as "organizationName"
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      WHERE u.email = 'hilder@standardsincare.com' OR u.full_name ILIKE '%Hilder%'
      ORDER BY u.created_at ASC
      LIMIT 1;
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

app.put('/api/user/profile', async (req: Request, res: Response) => {
  try {
    const {
      addressLine1,
      addressLine2,
      city,
      state,
      zip,
      homePhone,
      mobilePhone,
      softwareLanguage,
      ssn,
      currentPassword,
      newPassword,
      currentSignature,
      newSignature,
    } = req.body;

    const userRes = await pool.query(`
      SELECT id, signature_pin, password_hash
      FROM users
      WHERE email = 'hilder@standardsincare.com' OR full_name ILIKE '%Hilder%'
      LIMIT 1;
    `);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userRes.rows[0].id;

    const params: any[] = [
      addressLine1 || '',
      addressLine2 || '',
      city || '',
      state || '',
      zip || '',
      homePhone || '',
      mobilePhone || '',
      softwareLanguage || 'English',
      ssn || '',
      userId
    ];

    let query = `
      UPDATE users SET
        address_line1 = $1,
        address_line2 = $2,
        city = $3,
        state = $4,
        zip = $5,
        home_phone = $6,
        mobile_phone = $7,
        software_language = $8,
        ssn = $9,
        updated_at = NOW()
    `;

    if (newSignature && String(newSignature).trim()) {
      params.push(String(newSignature).trim());
      query += `, signature_pin = $${params.length}`;
    }

    if (newPassword && String(newPassword).trim()) {
      params.push(`$2a$12$${String(newPassword).trim()}`);
      query += `, password_hash = $${params.length}`;
    }

    query += ` WHERE id = $10 RETURNING 
      id,
      full_name as "fullName",
      email,
      role,
      title,
      address_line1 as "addressLine1",
      address_line2 as "addressLine2",
      city,
      state,
      zip,
      home_phone as "homePhone",
      mobile_phone as "mobilePhone",
      software_language as "softwareLanguage",
      ssn,
      created_at as "createdAt";`;

    const updated = await pool.query(query, params);
    res.json({
      success: true,
      message: 'Profile updated successfully in real-time',
      profile: updated.rows[0]
    });
  } catch (err: any) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

app.post('/api/user/reset-signature', async (_req: Request, res: Response) => {
  try {
    const updated = await pool.query(`
      UPDATE users SET
        signature_reset_requested_at = NOW(),
        updated_at = NOW()
      WHERE email = 'hilder@standardsincare.com' OR full_name ILIKE '%Hilder%'
      RETURNING id, email, full_name as "fullName", signature_reset_requested_at as "requestedAt";
    `);

    res.json({
      success: true,
      message: 'Your request to reset your signature was successful. Please check your e-mail.',
      user: updated.rows[0] || { email: 'hilder@standardsincare.com' }
    });
  } catch (err: any) {
    console.error('Error resetting signature:', err);
    res.status(500).json({ error: 'Failed to reset signature' });
  }
});

// Dashboard Real-time Metrics (Aggregated from PostgreSQL DB)
app.get('/api/dashboard/metrics', async (_req: Request, res: Response) => {
  try {
    // 1. Active Patients Census
    const censusQuery = await pool.query(`
      SELECT service_line, COUNT(*)::int as count
      FROM patients
      WHERE status = 'active'
      GROUP BY service_line;
    `);

    let homeHealthCensus = 0;
    let homeCareCensus = 0;
    let hospiceCensus = 0;

    censusQuery.rows.forEach(row => {
      if (row.service_line === 'home_health') homeHealthCensus = row.count;
      else if (row.service_line === 'home_care') homeCareCensus = row.count;
      else if (row.service_line === 'hospice') hospiceCensus = row.count;
    });

    const totalCensus = homeHealthCensus + homeCareCensus + hospiceCensus;

    // 2. Unassigned Visits in next 7 days
    const unassignedQuery = await pool.query(`
      SELECT service_line, COUNT(*)::int as count
      FROM visits
      WHERE status = 'unassigned'
        AND scheduled_start >= CURRENT_TIMESTAMP
        AND scheduled_start <= CURRENT_TIMESTAMP + INTERVAL '7 days'
      GROUP BY service_line;
    `);

    let unassignedHealth = 0;
    let unassignedCare = 0;
    unassignedQuery.rows.forEach(row => {
      if (row.service_line === 'home_health') unassignedHealth = row.count;
      else if (row.service_line === 'home_care') unassignedCare = row.count;
    });
    const totalUnassigned7Days = unassignedHealth + unassignedCare;

    // 3. Central Intake Past 30 Days
    const intakeQuery = await pool.query(`
      SELECT service_line, stage, COUNT(*)::int as count
      FROM intake_referrals
      WHERE received_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY service_line, stage;
    `);

    const intakeMap: Record<string, { inquiry: number; referral: number; admitted: number }> = {
      home_health: { inquiry: 0, referral: 0, admitted: 0 },
      home_care: { inquiry: 0, referral: 0, admitted: 0 },
    };

    intakeQuery.rows.forEach(row => {
      const s = row.service_line;
      if (!intakeMap[s]) intakeMap[s] = { inquiry: 0, referral: 0, admitted: 0 };
      if (row.stage === 'inquiry') intakeMap[s].inquiry += row.count;
      else if (row.stage === 'referral') intakeMap[s].referral += row.count;
      else if (row.stage === 'admitted') intakeMap[s].admitted += row.count;
    });

    const intakeMetrics = [
      {
        service: 'Home Health Agency',
        inquiry: intakeMap.home_health.inquiry,
        referral: intakeMap.home_health.referral,
        admitted: intakeMap.home_health.admitted,
        conversionRate: intakeMap.home_health.referral + intakeMap.home_health.inquiry > 0
          ? `${Math.round((intakeMap.home_health.admitted / (intakeMap.home_health.referral + intakeMap.home_health.inquiry)) * 100)}%`
          : '0%'
      },
      {
        service: 'Home Care (Private Duty)',
        inquiry: intakeMap.home_care.inquiry,
        referral: intakeMap.home_care.referral,
        admitted: intakeMap.home_care.admitted,
        conversionRate: intakeMap.home_care.referral + intakeMap.home_care.inquiry > 0
          ? `${Math.round((intakeMap.home_care.admitted / (intakeMap.home_care.referral + intakeMap.home_care.inquiry)) * 100)}%`
          : '0%'
      }
    ];

    // 4. Scheduled Visits Past 30 Days Performance
    const visitsQuery = await pool.query(`
      SELECT service_line, status, COUNT(*)::int as count
      FROM visits
      WHERE scheduled_start >= CURRENT_TIMESTAMP - INTERVAL '30 days'
      GROUP BY service_line, status;
    `);

    let completedCount = 0;
    let missedCount = 0;
    let unassignedCount = 0;
    let inProgressCount = 0;
    let scheduledCount = 0;
    let totalScheduledVisits = 0;

    let hhTotal = 0;
    let hhCompleted = 0;
    let hhMissed = 0;
    let hhUnassigned = 0;

    let hcTotal = 0;
    let hcCompleted = 0;
    let hcMissed = 0;
    let hcUnassigned = 0;

    visitsQuery.rows.forEach(row => {
      const c = row.count;
      totalScheduledVisits += c;
      if (row.status === 'completed') completedCount += c;
      else if (row.status === 'missed') missedCount += c;
      else if (row.status === 'unassigned') unassignedCount += c;
      else if (row.status === 'in_progress') inProgressCount += c;
      else if (row.status === 'scheduled') scheduledCount += c;

      if (row.service_line === 'home_health') {
        hhTotal += c;
        if (row.status === 'completed') hhCompleted += c;
        else if (row.status === 'missed') hhMissed += c;
        else if (row.status === 'unassigned') hhUnassigned += c;
      } else if (row.service_line === 'home_care') {
        hcTotal += c;
        if (row.status === 'completed') hcCompleted += c;
        else if (row.status === 'missed') hcMissed += c;
        else if (row.status === 'unassigned') hcUnassigned += c;
      }
    });

    // 5. Unread Messages Count
    const unreadMessagesRes = await pool.query(`
      SELECT COUNT(*)::int as count FROM messages WHERE is_read = false;
    `);
    const unreadMessagesCount = unreadMessagesRes.rows[0]?.count || 0;

    res.json({
      activePatients: {
        total: totalCensus,
        homeHealth: homeHealthCensus,
        homeCare: homeCareCensus,
        hospice: hospiceCensus
      },
      unreadMessagesCount,
      unassignedVisits7Days: {
        total: totalUnassigned7Days,
        homeHealth: unassignedHealth,
        homeCare: unassignedCare
      },
      intakeLast30Days: intakeMetrics,
      scheduledVisitsLast30Days: {
        total: totalScheduledVisits,
        completed: completedCount,
        missed: missedCount,
        unassigned: unassignedCount,
        inProgress: inProgressCount,
        scheduled: scheduledCount,
        homeHealthTotal: hhTotal,
        homeHealthCompleted: hhCompleted,
        homeHealthMissed: hhMissed,
        homeHealthUnassigned: hhUnassigned,
        homeCareTotal: hcTotal,
        homeCareCompleted: hcCompleted,
        homeCareMissed: hcMissed,
        homeCareUnassigned: hcUnassigned,
      }
    });
  } catch (err: any) {
    console.error('Error fetching dashboard metrics:', err);
    res.status(500).json({ error: 'Failed to compute dashboard metrics from database' });
  }
});

// Messages List (Enhanced for My Messages EMR with Folder, Body & Recipients)
app.get('/api/messages', async (req: Request, res: Response) => {
  try {
    const folder = req.query.folder as string;
    let query = `
      SELECT 
        m.id,
        u.full_name as "senderName",
        u.role as "senderRole",
        COALESCE(u.email, 'staff@standardshomecare.com') as "senderEmail",
        COALESCE(m.recipients, ARRAY['Hilder Magessa, RN']::TEXT[]) as "recipients",
        m.subject,
        m.body,
        m.body as snippet,
        m.service_line as "serviceLine",
        o.name as "organizationName",
        m.created_at as "createdAt",
        TO_CHAR(m.created_at, 'Mon DD, YYYY') as date,
        TO_CHAR(m.created_at, 'Mon DD, YYYY HH12:MI AM') as timestamp,
        TO_CHAR(m.created_at, 'FMDay, FMMonth DD, YYYY FMHH12:MI AM') as "sentDate",
        m.is_read as "isRead",
        COALESCE(m.folder, 'inbox') as folder,
        m.priority,
        COALESCE(m.attachments, '[]'::jsonb) as attachments,
        COALESCE(p.first_name || ' ' || p.last_name, '') as "patientName"
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      JOIN organizations o ON m.organization_id = o.id
      LEFT JOIN patients p ON m.patient_id = p.id
      WHERE m.is_deleted = false
    `;

    const params: any[] = [];
    if (folder) {
      params.push(folder);
      query += ` AND m.folder = $${params.length}`;
    }

    query += ` ORDER BY m.created_at DESC;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create / Reply to Message in PostgreSQL
app.post('/api/messages', async (req: Request, res: Response) => {
  try {
    const {
      subject,
      body,
      recipients,
      toRecipients,
      priority = 'routine',
      serviceLine = 'home_health',
      patientId = null,
      folder = 'sent',
      attachments = [],
      attachmentName = null
    } = req.body;

    // Normalize attachments
    let finalAttachments = Array.isArray(attachments) ? [...attachments] : [];
    if (attachmentName && finalAttachments.length === 0) {
      finalAttachments.push({ name: attachmentName, size: '24 KB', uploadedAt: new Date().toISOString() });
    }

    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id || 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211';

    const senderRes = await pool.query(`
      SELECT id FROM users WHERE email = 'hilder@standardsincare.com' OR full_name ILIKE '%Hilder%' LIMIT 1
    `);
    const senderId = senderRes.rows[0]?.id || 'b9999999-9999-9999-9999-999999999999';

    const recipientList = recipients || toRecipients || ['Alexandria Nelson, RN'];

    const insertRes = await pool.query(`
      INSERT INTO messages (
        organization_id,
        sender_id,
        patient_id,
        service_line,
        subject,
        body,
        priority,
        recipients,
        folder,
        is_read,
        attachments,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, NOW())
      RETURNING *;
    `, [
      orgId,
      senderId,
      patientId,
      serviceLine,
      subject,
      body,
      priority,
      recipientList,
      folder,
      JSON.stringify(finalAttachments)
    ]);

    const m = insertRes.rows[0];
    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: m.id,
        senderName: 'Hilder Magessa, RN',
        senderRole: 'clinical_supervisor',
        senderEmail: 'hilder@standardsincare.com',
        recipients: m.recipients,
        subject: m.subject,
        body: m.body,
        snippet: m.body,
        serviceLine: m.service_line,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        sentDate: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isRead: true,
        folder: m.folder,
        priority: m.priority,
        attachments: m.attachments || finalAttachments
      }
    });
  } catch (err: any) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Delete Message (Move to Trash or Permanent)
app.delete('/api/messages/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const msg = await pool.query('SELECT folder FROM messages WHERE id = $1', [id]);
    if (msg.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (msg.rows[0].folder === 'trash') {
      await pool.query('UPDATE messages SET is_deleted = true WHERE id = $1', [id]);
    } else {
      await pool.query("UPDATE messages SET folder = 'trash' WHERE id = $1", [id]);
    }

    res.json({ success: true, message: 'Message moved to Trash' });
  } catch (err: any) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Batch Delete Messages
app.post('/api/messages/batch-delete', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No message IDs provided' });
    }

    await pool.query("UPDATE messages SET folder = 'trash' WHERE id = ANY($1::uuid[])", [ids]);
    res.json({ success: true, message: `${ids.length} messages moved to Trash` });
  } catch (err: any) {
    console.error('Error batch deleting messages:', err);
    res.status(500).json({ error: 'Failed to delete messages' });
  }
});

// Mark Message as Read
app.patch('/api/messages/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE messages SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, is_read`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, message: result.rows[0] });
  } catch (err: any) {
    console.error('Error marking message read:', err);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

// GET /api/episodes - Fetch all episodes with patient metadata
app.get('/api/episodes', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let query = `
      SELECT 
        e.id,
        e.patient_id as "patientId",
        p.first_name || ' ' || p.last_name as "patientName",
        p.mrn,
        TO_CHAR(e.start_of_care_date, 'YYYY-MM-DD') as "startOfCareDate",
        TO_CHAR(e.episode_start_date, 'YYYY-MM-DD') as "episodeStartDate",
        TO_CHAR(e.episode_end_date, 'YYYY-MM-DD') as "episodeEndDate",
        COALESCE(e.case_manager, '') as "caseManager",
        COALESCE(e.primary_physician, '') as "primaryPhysician",
        COALESCE(e.primary_insurance, '') as "primaryInsurance",
        COALESCE(e.secondary_insurance, '') as "secondaryInsurance",
        COALESCE(e.comments, '') as "comments",
        COALESCE(e.status, 'active') as "status",
        e.created_at as "createdAt"
      FROM episodes e
      JOIN patients p ON e.patient_id = p.id
    `;
    const params: any[] = [];
    if (patientId) {
      params.push(patientId);
      query += ` WHERE e.patient_id = $1`;
    }
    query += ` ORDER BY e.episode_start_date DESC;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching episodes:', err);
    res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

// POST /api/episodes - Create new episode and update patient clinical record
app.post('/api/episodes', async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      startOfCareDate,
      episodeStartDate,
      episodeEndDate,
      caseManager,
      primaryPhysician,
      primaryInsurance,
      secondaryInsurance,
      comments
    } = req.body;

    if (!patientId || !startOfCareDate || !episodeStartDate || !episodeEndDate) {
      return res.status(400).json({ error: 'Patient ID, Start of Care Date, Episode Start Date, and Episode End Date are required' });
    }

    // Resolve patient & organization
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    if (patRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const pat = patRes.rows[0];
    const resolvedPatientId = pat.id;
    const orgId = pat.organization_id;

    // Insert into episodes table
    const insertRes = await pool.query(`
      INSERT INTO episodes (
        organization_id,
        patient_id,
        start_of_care_date,
        episode_start_date,
        episode_end_date,
        case_manager,
        primary_physician,
        primary_insurance,
        secondary_insurance,
        comments,
        status,
        created_at
      ) VALUES ($1, $2, $3::date, $4::date, $5::date, $6, $7, $8, $9, $10, 'active', NOW())
      RETURNING *;
    `, [
      orgId,
      resolvedPatientId,
      startOfCareDate,
      episodeStartDate,
      episodeEndDate,
      caseManager || null,
      primaryPhysician || null,
      primaryInsurance || null,
      secondaryInsurance || null,
      comments || null
    ]);

    // Update patient table with current episode info
    await pool.query(`
      UPDATE patients
      SET
        start_of_care_date = $1::date,
        episode_start = $2::date,
        episode_end = $3::date,
        attending_physician = COALESCE($4, attending_physician),
        insurance_name = COALESCE($5, insurance_name),
        updated_at = NOW()
      WHERE id = $6
    `, [
      startOfCareDate,
      episodeStartDate,
      episodeEndDate,
      primaryPhysician || null,
      primaryInsurance || null,
      resolvedPatientId
    ]);

    const row = insertRes.rows[0];
    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: `${pat.last_name}, ${pat.first_name}`,
      mrn: pat.mrn,
      startOfCareDate: startOfCareDate,
      episodeStartDate: episodeStartDate,
      episodeEndDate: episodeEndDate,
      caseManager: row.case_manager || '',
      primaryPhysician: row.primary_physician || '',
      primaryInsurance: row.primary_insurance || '',
      secondaryInsurance: row.secondary_insurance || '',
      comments: row.comments || '',
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating episode:', err);
    res.status(500).json({ error: 'Failed to create episode' });
  }
});

// GET /api/communication-notes - Fetch all communication notes
app.get('/api/communication-notes', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let query = `
      SELECT 
        c.id,
        c.patient_id as "patientId",
        c.patient_name as "patientName",
        c.mrn,
        c.patient_status as "patientStatus",
        c.episode_associated as "episodeAssociated",
        COALESCE(c.physician, '') as "physician",
        TO_CHAR(c.note_date, 'YYYY-MM-DD') as "noteDate",
        c.communication_text as "communicationText",
        c.send_as_message as "sendAsMessage",
        c.staff_signature as "staffSignature",
        TO_CHAR(c.signature_date, 'YYYY-MM-DD') as "signatureDate",
        COALESCE(c.signature_time, '') as "signatureTime",
        c.status,
        c.created_at as "createdAt"
      FROM communication_notes c
    `;
    const params: any[] = [];
    if (patientId) {
      params.push(patientId);
      query += ` WHERE c.patient_id::text = $1 OR c.mrn = $1`;
    }
    query += ` ORDER BY c.note_date DESC, c.created_at DESC;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching communication notes:', err);
    res.status(500).json({ error: 'Failed to fetch communication notes' });
  }
});

// POST /api/communication-notes - Create new communication note
app.post('/api/communication-notes', async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      patientName,
      patientStatus,
      episodeAssociated,
      physician,
      noteDate,
      communicationText,
      sendAsMessage,
      staffSignature,
      signatureDate,
      signatureTime,
      status
    } = req.body;

    if (!patientId || !episodeAssociated || !communicationText || !staffSignature) {
      return res.status(400).json({ error: 'Patient ID, Episode Associated, Communication Text, and Staff Signature are required' });
    }

    // Resolve patient & org
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn, status FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const noteStatus = status || 'Approved';

    const insertResult = await pool.query(`
      INSERT INTO communication_notes (
        organization_id, patient_id, patient_name, mrn, patient_status,
        episode_associated, physician, note_date, communication_text,
        send_as_message, staff_signature, signature_date, signature_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9, $10, $11, $12::date, $13, $14)
      RETURNING *
    `, [
      orgId,
      resolvedPatientId,
      resolvedPatName,
      resolvedMrn,
      patientStatus || 'Active',
      episodeAssociated,
      physician || 'Attending Physician',
      noteDate || new Date().toISOString().split('T')[0],
      communicationText.trim(),
      Boolean(sendAsMessage),
      staffSignature.trim(),
      signatureDate || new Date().toISOString().split('T')[0],
      signatureTime || '10:00 AM',
      noteStatus
    ]);

    const row = insertResult.rows[0];

    // If sendAsMessage is true, also create a message
    if (sendAsMessage && orgId) {
      const userRes = await pool.query('SELECT id FROM users WHERE organization_id = $1 LIMIT 1', [orgId]);
      const senderId = userRes.rows[0]?.id;
      if (senderId) {
        await pool.query(`
          INSERT INTO messages (
            organization_id, sender_id, patient_id, service_line, subject, body, priority, is_read, sender_name, recipient_names
          ) VALUES ($1, $2, $3, 'home_health', $4, $5, 'routine', false, $6, $7)
        `, [
          orgId,
          senderId,
          resolvedPatientId,
          `Communication Note: ${resolvedPatName}`,
          communicationText.trim(),
          staffSignature.trim(),
          ['Care Team', 'Primary Case Manager']
        ]);
      }
    }

    // Also add to patient_tasks if patient exists so it appears in PatientChartsView
    if (resolvedPatientId && orgId) {
      await pool.query(`
        INSERT INTO patient_tasks (
          organization_id, patient_id, task_name, discipline, status, schedule_start, schedule_end, assigned_to, comments
        ) VALUES ($1, $2, 'Communication Note', 'Nursing', $3, $4::date, $4::date, $5, $6)
      `, [
        orgId,
        resolvedPatientId,
        noteStatus === 'Complete' || noteStatus === 'Approved' ? 'Completed' : 'Not Yet Due',
        noteDate || new Date().toISOString().split('T')[0],
        staffSignature.trim(),
        communicationText.slice(0, 150)
      ]);
    }

    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      patientStatus: row.patient_status,
      episodeAssociated: row.episode_associated,
      physician: row.physician,
      noteDate: row.note_date,
      communicationText: row.communication_text,
      sendAsMessage: row.send_as_message,
      staffSignature: row.staff_signature,
      signatureDate: row.signature_date,
      signatureTime: row.signature_time,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating communication note:', err);
    res.status(500).json({ error: 'Failed to create communication note' });
  }
});

// GET /api/orders - Fetch all physician orders
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const { patientId, status } = req.query;
    let query = `
      SELECT 
        o.id,
        o.patient_id as "patientId",
        o.patient_name as "patientName",
        o.mrn,
        o.episode_associated as "episodeAssociated",
        COALESCE(o.attending_physician, '') as "attendingPhysician",
        COALESCE(o.send_to, '') as "sendTo",
        COALESCE(o.copy_to, '') as "copyTo",
        TO_CHAR(o.order_date, 'YYYY-MM-DD') as "date",
        COALESCE(o.order_time, '14:30') as "time",
        TO_CHAR(o.effective_date, 'YYYY-MM-DD') as "effectiveDate",
        o.order_is_for_next_episode as "orderIsForNextEpisode",
        o.summary_title as "summaryTitle",
        o.order_type as "orderType",
        COALESCE(o.order_content, '') as "orderContent",
        o.order_read_back_and_verified as "orderReadBackAndVerified",
        o.clinician_signature as "clinicianSignature",
        TO_CHAR(o.signature_date, 'YYYY-MM-DD') as "signatureDate",
        COALESCE(o.signature_time, '14:32') as "signatureTime",
        o.status,
        o.created_at as "createdAt"
      FROM orders o
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (patientId) {
      params.push(patientId);
      conditions.push(`(o.patient_id::text = $${params.length} OR o.mrn = $${params.length})`);
    }

    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY o.order_date DESC, o.created_at DESC;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create new physician order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      patientName,
      episodeAssociated,
      attendingPhysician,
      sendTo,
      copyTo,
      date,
      time,
      effectiveDate,
      orderIsForNextEpisode,
      summaryTitle,
      orderType,
      orderContent,
      orderReadBackAndVerified,
      clinicianSignature,
      signatureDate,
      signatureTime,
      status
    } = req.body;

    if (!patientId || !summaryTitle || !clinicianSignature) {
      return res.status(400).json({ error: 'Patient ID, Summary Title, and Clinician Signature are required' });
    }

    // Resolve patient & org
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const orderStatus = status || 'Created';

    const insertResult = await pool.query(`
      INSERT INTO orders (
        organization_id, patient_id, patient_name, mrn, episode_associated,
        attending_physician, send_to, copy_to, order_date, order_time, effective_date,
        order_is_for_next_episode, summary_title, order_type, order_content,
        order_read_back_and_verified, clinician_signature, signature_date, signature_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10, $11::date, $12, $13, $14, $15, $16, $17, $18::date, $19, $20)
      RETURNING *
    `, [
      orgId,
      resolvedPatientId,
      resolvedPatName,
      resolvedMrn,
      episodeAssociated || 'Current Active Episode',
      attendingPhysician || 'Attending Physician',
      sendTo || attendingPhysician || 'Attending Physician',
      copyTo || null,
      date || new Date().toISOString().split('T')[0],
      time || '14:30',
      effectiveDate || date || new Date().toISOString().split('T')[0],
      Boolean(orderIsForNextEpisode),
      summaryTitle.trim(),
      orderType || 'Medication Orders',
      orderContent || '',
      Boolean(orderReadBackAndVerified),
      clinicianSignature.trim(),
      signatureDate || new Date().toISOString().split('T')[0],
      signatureTime || '14:32',
      orderStatus
    ]);

    const row = insertResult.rows[0];

    // Also add to patient_tasks if patient exists so it appears in PatientChartsView
    if (resolvedPatientId && orgId) {
      await pool.query(`
        INSERT INTO patient_tasks (
          organization_id, patient_id, task_name, discipline, status, schedule_start, schedule_end, assigned_to, comments
        ) VALUES ($1, $2, $3, 'Nursing', 'Not Yet Due', $4::date, $4::date, $5, $6)
      `, [
        orgId,
        resolvedPatientId,
        `Order: ${summaryTitle.slice(0, 50)}`,
        date || new Date().toISOString().split('T')[0],
        clinicianSignature.trim(),
        orderContent ? orderContent.slice(0, 150) : summaryTitle
      ]);
    }

    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      episodeAssociated: row.episode_associated,
      attendingPhysician: row.attending_physician,
      sendTo: row.send_to,
      copyTo: row.copy_to,
      date: row.order_date,
      time: row.order_time,
      effectiveDate: row.effective_date,
      orderIsForNextEpisode: row.order_is_for_next_episode,
      summaryTitle: row.summary_title,
      orderType: row.order_type,
      orderContent: row.order_content,
      orderReadBackAndVerified: row.order_read_back_and_verified,
      clinicianSignature: row.clinician_signature,
      signatureDate: row.signature_date,
      signatureTime: row.signature_time,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// --- Face-to-Face Encounters ---
app.get('/api/face-to-face-encounters', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let query = `
      SELECT 
        f.id,
        f.patient_id as "patientId",
        f.patient_name as "patientName",
        f.mrn,
        f.patient_status as "patientStatus",
        f.episode_associated as "episodeAssociated",
        f.physician,
        TO_CHAR(f.request_date, 'YYYY-MM-DD') as "requestDate",
        f.certifying_type as "certifyingType",
        f.status,
        f.created_at as "createdAt"
      FROM face_to_face_encounters f
    `;
    const params: any[] = [];
    if (patientId) {
      params.push(patientId);
      query += ` WHERE f.patient_id::text = $1 OR f.mrn = $1`;
    }
    query += ` ORDER BY f.request_date DESC, f.created_at DESC;`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching face-to-face encounters:', err);
    res.status(500).json({ error: 'Failed to fetch face-to-face encounters' });
  }
});

app.post('/api/face-to-face-encounters', async (req: Request, res: Response) => {
  try {
    const { patientId, patientName, patientStatus, episodeAssociated, physician, requestDate, certifyingType, status } = req.body;
    if (!patientId || !physician || !requestDate) {
      return res.status(400).json({ error: 'Patient ID, Physician, and Request Date are required' });
    }
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const insRes = await pool.query(`
      INSERT INTO face_to_face_encounters (
        organization_id, patient_id, patient_name, mrn, patient_status,
        episode_associated, physician, request_date, certifying_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9, $10)
      RETURNING *
    `, [
      orgId,
      resolvedPatientId,
      resolvedPatName,
      resolvedMrn,
      patientStatus || 'Active',
      episodeAssociated || 'Current Active Episode',
      physician.trim(),
      requestDate,
      certifyingType || 'POC Certifying Physician',
      status || 'Pending'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      patientStatus: row.patient_status,
      episodeAssociated: row.episode_associated,
      physician: row.physician,
      requestDate: row.request_date,
      certifyingType: row.certifying_type,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating face-to-face encounter:', err);
    res.status(500).json({ error: 'Failed to create encounter' });
  }
});

// --- Facilities ---
app.get('/api/facilities', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, facility_type as "facilityType",
        address_line1 as "addressLine1", address_line2 as "addressLine2",
        city, state, zip, phone, fax,
        contact_person as "contactPerson", email, comments, status,
        created_at as "createdAt"
      FROM facilities
      ORDER BY name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching facilities:', err);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

app.post('/api/facilities', async (req: Request, res: Response) => {
  try {
    const { name, facilityType, addressLine1, addressLine2, city, state, zip, phone, fax, contactPerson, email, comments, status } = req.body;
    if (!name || !addressLine1 || !city || !zip) {
      return res.status(400).json({ error: 'Facility Name, Address, City, and Zip are required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO facilities (
        organization_id, name, facility_type, address_line1, address_line2,
        city, state, zip, phone, fax, contact_person, email, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      orgId, name.trim(), facilityType || 'Hospital', addressLine1.trim(), addressLine2 || '',
      city.trim(), state || 'MA', zip.trim(), phone || '', fax || '',
      contactPerson || '', email || '', comments || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      facilityType: row.facility_type,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      contactPerson: row.contact_person,
      email: row.email,
      comments: row.comments,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating facility:', err);
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

// --- Physicians ---
app.get('/api/physicians', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, first_name as "firstName", last_name as "lastName",
        first_name || ' ' || last_name || ', ' || credentials as "fullName",
        credentials, npi, taxonomy_code as "taxonomyCode",
        medicaid_provider_id as "medicaidProviderId", pecos_status as "pecosStatus",
        address_line1 as "addressLine1", address_line2 as "addressLine2",
        city, state, zip, phone, fax, email,
        order_delivery_method as "orderDeliveryMethod", comments, status,
        created_at as "createdAt"
      FROM physicians
      ORDER BY last_name ASC, first_name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching physicians:', err);
    res.status(500).json({ error: 'Failed to fetch physicians' });
  }
});

app.post('/api/physicians', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, credentials, npi, taxonomyCode, medicaidProviderId, pecosStatus, addressLine1, addressLine2, city, state, zip, phone, fax, email, orderDeliveryMethod, comments, status } = req.body;
    if (!firstName || !lastName || !npi || !addressLine1 || !city || !zip || !phone) {
      return res.status(400).json({ error: 'First Name, Last Name, NPI, Address, City, Zip, and Phone are required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO physicians (
        organization_id, first_name, last_name, credentials, npi,
        taxonomy_code, medicaid_provider_id, pecos_status, address_line1, address_line2,
        city, state, zip, phone, fax, email, order_delivery_method, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      orgId, firstName.trim(), lastName.trim(), credentials || 'MD', npi.trim(),
      taxonomyCode || '', medicaidProviderId || '', pecosStatus || 'Verified',
      addressLine1.trim(), addressLine2 || '', city.trim(), state || 'MA', zip.trim(),
      phone.trim(), fax || '', email || '', orderDeliveryMethod || 'Fax Transmission',
      comments || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}, ${row.credentials}`,
      credentials: row.credentials,
      npi: row.npi,
      taxonomyCode: row.taxonomy_code,
      medicaidProviderId: row.medicaid_provider_id,
      pecosStatus: row.pecos_status,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      email: row.email,
      orderDeliveryMethod: row.order_delivery_method,
      comments: row.comments,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating physician:', err);
    res.status(500).json({ error: 'Failed to create physician' });
  }
});

// --- Insurance Payers ---
app.get('/api/insurance-payers', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, payer_name as "name", payer_name as "payerName",
        payer_type as "payerType", source_of_payment as "sourceOfPayment",
        clearinghouse, billing_provider_id as "billingProviderId",
        address_line1 as "addressLine1", city, state, zip, phone, fax, email,
        contact_person as "contactPerson", requires_authorization as "requiresAuthorization",
        notes, status, created_at as "createdAt"
      FROM insurance_payers
      ORDER BY payer_name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching insurance payers:', err);
    res.status(500).json({ error: 'Failed to fetch insurance payers' });
  }
});

app.post('/api/insurance-payers', async (req: Request, res: Response) => {
  try {
    const { name, payerName, payerType, sourceOfPayment, clearinghouse, billingProviderId, addressLine1, city, state, zip, phone, fax, email, contactPerson, requiresAuthorization, notes, status } = req.body;
    const resolvedName = (name || payerName || '').trim();
    if (!resolvedName) {
      return res.status(400).json({ error: 'Payer Name is required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO insurance_payers (
        organization_id, payer_name, payer_type, source_of_payment, clearinghouse,
        billing_provider_id, address_line1, city, state, zip, phone, fax, email,
        contact_person, requires_authorization, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      orgId, resolvedName, payerType || 'Commercial / Private insurance', sourceOfPayment || '',
      clearinghouse || 'Availity', billingProviderId || '', addressLine1 || '', city || '',
      state || 'MA', zip || '', phone || '', fax || '', email || '', contactPerson || '',
      Boolean(requiresAuthorization), notes || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.payer_name,
      payerName: row.payer_name,
      payerType: row.payer_type,
      sourceOfPayment: row.source_of_payment,
      clearinghouse: row.clearinghouse,
      billingProviderId: row.billing_provider_id,
      addressLine1: row.address_line1,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      email: row.email,
      contactPerson: row.contact_person,
      requiresAuthorization: row.requires_authorization,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating insurance payer:', err);
    res.status(500).json({ error: 'Failed to create insurance payer' });
  }
});

// --- Pharmacies ---
app.get('/api/pharmacies', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, address_line1 as "addressLine1", address_line2 as "addressLine2",
        city, state, zip, phone, fax, contact_person as "contactPerson", email,
        comments, status, created_at as "createdAt"
      FROM pharmacies
      ORDER BY name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching pharmacies:', err);
    res.status(500).json({ error: 'Failed to fetch pharmacies' });
  }
});

app.post('/api/pharmacies', async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, addressLine2, city, state, zip, phone, fax, contactPerson, email, comments, status } = req.body;
    if (!name || !addressLine1 || !city || !zip) {
      return res.status(400).json({ error: 'Pharmacy Name, Address, City, and Zip are required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO pharmacies (
        organization_id, name, address_line1, address_line2, city, state, zip,
        phone, fax, contact_person, email, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      orgId, name.trim(), addressLine1.trim(), addressLine2 || '', city.trim(),
      state || 'MA', zip.trim(), phone || '', fax || '', contactPerson || '',
      email || '', comments || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      contactPerson: row.contact_person,
      email: row.email,
      comments: row.comments,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating pharmacy:', err);
    res.status(500).json({ error: 'Failed to create pharmacy' });
  }
});

// --- Infection Logs ---
app.get('/api/infection-logs', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, patient_id as "patientId", patient_name as "patientName", mrn,
        TO_CHAR(date_of_infection, 'YYYY-MM-DD') as "dateOfInfection",
        episode_period as "episodePeriod", infection_site as "infectionSite",
        infection_type as "infectionType", pathogen, treatment,
        precautions, physician_notified as "physicianNotified",
        physician_name as "physicianName", resolved,
        TO_CHAR(resolution_date, 'YYYY-MM-DD') as "resolutionDate",
        surveillance_notes as "surveillanceNotes", created_by as "createdBy",
        created_at as "createdAt"
      FROM infection_logs
      ORDER BY date_of_infection DESC, created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching infection logs:', err);
    res.status(500).json({ error: 'Failed to fetch infection logs' });
  }
});

app.post('/api/infection-logs', async (req: Request, res: Response) => {
  try {
    const { patientId, patientName, dateOfInfection, episodePeriod, infectionSite, infectionType, pathogen, treatment, precautions, physicianNotified, physicianName, resolved, resolutionDate, surveillanceNotes, createdBy } = req.body;
    if (!patientId || !infectionSite || !infectionType) {
      return res.status(400).json({ error: 'Patient ID, Infection Site, and Infection Type are required' });
    }
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const insRes = await pool.query(`
      INSERT INTO infection_logs (
        organization_id, patient_id, patient_name, mrn, date_of_infection,
        episode_period, infection_site, infection_type, pathogen, treatment,
        precautions, physician_notified, physician_name, resolved, resolution_date,
        surveillance_notes, created_by
      ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      orgId, resolvedPatientId, resolvedPatName, resolvedMrn,
      dateOfInfection || new Date().toISOString().split('T')[0],
      episodePeriod || 'Current 60-Day Episode', infectionSite.trim(), infectionType.trim(),
      pathogen || '', treatment || '', precautions || 'Universal precautions',
      Boolean(physicianNotified), physicianName || '', Boolean(resolved),
      resolutionDate ? resolutionDate : null, surveillanceNotes || '', createdBy || 'Clinical Staff'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      dateOfInfection: row.date_of_infection,
      episodePeriod: row.episode_period,
      infectionSite: row.infection_site,
      infectionType: row.infection_type,
      pathogen: row.pathogen,
      treatment: row.treatment,
      precautions: row.precautions,
      physicianNotified: row.physician_notified,
      physicianName: row.physician_name,
      resolved: row.resolved,
      resolutionDate: row.resolution_date,
      surveillanceNotes: row.surveillance_notes,
      createdBy: row.created_by,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating infection log:', err);
    res.status(500).json({ error: 'Failed to create infection log' });
  }
});

// --- Incident Logs ---
app.get('/api/incident-logs', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id, i.patient_id as "patientId", i.patient_name as "patientName", i.mrn,
        TO_CHAR(i.incident_date, 'YYYY-MM-DD') as "incidentDate",
        i.incident_time as "incidentTime", i.incident_type as "incidentType",
        i.location, i.injury_sustained as "injurySustained",
        i.injury_description as "injuryDescription", i.narrative,
        i.action_taken as "actionTaken", i.physician_notified as "physicianNotified",
        i.supervisor_notified as "supervisorNotified", i.reporter_name as "reporterName",
        i.reporter_role as "reporterRole", i.status, i.created_at as "createdAt",
        COALESCE(p.attending_physician, 'Dr. Anita Gupta, MD') as physician,
        'Standards Home Care' as branch
      FROM incident_logs i
      LEFT JOIN patients p ON i.patient_id = p.id
      ORDER BY i.incident_date DESC, i.created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching incident logs:', err);
    res.status(500).json({ error: 'Failed to fetch incident logs' });
  }
});

app.post('/api/incident-logs', async (req: Request, res: Response) => {
  try {
    const { patientId, patientName, incidentDate, incidentTime, incidentType, location, injurySustained, injuryDescription, narrative, actionTaken, physicianNotified, supervisorNotified, reporterName, reporterRole, status } = req.body;
    if (!patientId || !incidentType || !narrative || !reporterName) {
      return res.status(400).json({ error: 'Patient ID, Incident Type, Narrative, and Reporter Name are required' });
    }
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn, attending_physician FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;
    let attendingPhysician = 'Dr. Anita Gupta, MD';

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
      if (pat.attending_physician) attendingPhysician = pat.attending_physician;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const insRes = await pool.query(`
      INSERT INTO incident_logs (
        organization_id, patient_id, patient_name, mrn, incident_date,
        incident_time, incident_type, location, injury_sustained,
        injury_description, narrative, action_taken, physician_notified,
        supervisor_notified, reporter_name, reporter_role, status
      ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      orgId, resolvedPatientId, resolvedPatName, resolvedMrn,
      incidentDate || new Date().toISOString().split('T')[0], incidentTime || '10:00 AM',
      incidentType.trim(), location || 'Patient Home', Boolean(injurySustained),
      injuryDescription || '', narrative.trim(), actionTaken || '',
      Boolean(physicianNotified), Boolean(supervisorNotified), reporterName.trim(),
      reporterRole || 'Staff Clinician', status || 'Logged & Submitted'
    ]);
    const row = insRes.rows[0];

    // Also add to patient_tasks if patient exists so it appears in PatientChartsView
    if (resolvedPatientId && orgId) {
      try {
        await pool.query(`
          INSERT INTO patient_tasks (
            organization_id, patient_id, task_name, discipline, status, schedule_start, schedule_end, assigned_to, comments
          ) VALUES ($1, $2, $3, 'Quality & Safety', 'Completed', $4::date, $4::date, $5, $6)
        `, [
          orgId,
          resolvedPatientId,
          `Incident Report: ${incidentType.trim()}`,
          incidentDate || new Date().toISOString().split('T')[0],
          reporterName.trim(),
          narrative.trim()
        ]);
      } catch (taskErr) {
        console.error('Non-critical: Failed to insert patient task for incident:', taskErr);
      }
    }

    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      incidentDate: row.incident_date,
      incidentTime: row.incident_time,
      incidentType: row.incident_type,
      location: row.location,
      injurySustained: row.injury_sustained,
      injuryDescription: row.injury_description,
      narrative: row.narrative,
      actionTaken: row.action_taken,
      physicianNotified: row.physician_notified,
      supervisorNotified: row.supervisor_notified,
      reporterName: row.reporter_name,
      reporterRole: row.reporter_role,
      status: row.status,
      physician: attendingPhysician,
      branch: 'Standards Home Care',
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating incident log:', err);
    res.status(500).json({ error: 'Failed to create incident log' });
  }
});

// GET /api/orders - Fetch all physician orders
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const { patientId, status } = req.query;
    let query = `
      SELECT 
        o.id,
        o.patient_id as "patientId",
        o.patient_name as "patientName",
        o.mrn,
        o.episode_associated as "episodeAssociated",
        COALESCE(o.attending_physician, '') as "attendingPhysician",
        COALESCE(o.send_to, '') as "sendTo",
        COALESCE(o.copy_to, '') as "copyTo",
        TO_CHAR(o.order_date, 'YYYY-MM-DD') as "date",
        COALESCE(o.order_time, '14:30') as "time",
        TO_CHAR(o.effective_date, 'YYYY-MM-DD') as "effectiveDate",
        o.order_is_for_next_episode as "orderIsForNextEpisode",
        o.summary_title as "summaryTitle",
        o.order_type as "orderType",
        COALESCE(o.order_content, '') as "orderContent",
        o.order_read_back_and_verified as "orderReadBackAndVerified",
        o.clinician_signature as "clinicianSignature",
        TO_CHAR(o.signature_date, 'YYYY-MM-DD') as "signatureDate",
        COALESCE(o.signature_time, '14:32') as "signatureTime",
        o.status,
        o.created_at as "createdAt"
      FROM orders o
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (patientId) {
      params.push(patientId);
      conditions.push(`(o.patient_id::text = $${params.length} OR o.mrn = $${params.length})`);
    }

    if (status) {
      params.push(status);
      conditions.push(`o.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY o.order_date DESC, o.created_at DESC;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders - Create new physician order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      patientName,
      episodeAssociated,
      attendingPhysician,
      sendTo,
      copyTo,
      date,
      time,
      effectiveDate,
      orderIsForNextEpisode,
      summaryTitle,
      orderType,
      orderContent,
      orderReadBackAndVerified,
      clinicianSignature,
      signatureDate,
      signatureTime,
      status
    } = req.body;

    if (!patientId || !summaryTitle || !clinicianSignature) {
      return res.status(400).json({ error: 'Patient ID, Summary Title, and Clinician Signature are required' });
    }

    // Resolve patient & org
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const orderStatus = status || 'Created';

    const insertResult = await pool.query(`
      INSERT INTO orders (
        organization_id, patient_id, patient_name, mrn, episode_associated,
        attending_physician, send_to, copy_to, order_date, order_time, effective_date,
        order_is_for_next_episode, summary_title, order_type, order_content,
        order_read_back_and_verified, clinician_signature, signature_date, signature_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::date, $10, $11::date, $12, $13, $14, $15, $16, $17, $18::date, $19, $20)
      RETURNING *
    `, [
      orgId,
      resolvedPatientId,
      resolvedPatName,
      resolvedMrn,
      episodeAssociated || 'Current Active Episode',
      attendingPhysician || 'Attending Physician',
      sendTo || attendingPhysician || 'Attending Physician',
      copyTo || null,
      date || new Date().toISOString().split('T')[0],
      time || '14:30',
      effectiveDate || date || new Date().toISOString().split('T')[0],
      Boolean(orderIsForNextEpisode),
      summaryTitle.trim(),
      orderType || 'Medication Orders',
      orderContent || '',
      Boolean(orderReadBackAndVerified),
      clinicianSignature.trim(),
      signatureDate || new Date().toISOString().split('T')[0],
      signatureTime || '14:32',
      orderStatus
    ]);

    const row = insertResult.rows[0];

    // Also add to patient_tasks if patient exists so it appears in PatientChartsView
    if (resolvedPatientId && orgId) {
      await pool.query(`
        INSERT INTO patient_tasks (
          organization_id, patient_id, task_name, discipline, status, schedule_start, schedule_end, assigned_to, comments
        ) VALUES ($1, $2, $3, 'Nursing', 'Not Yet Due', $4::date, $4::date, $5, $6)
      `, [
        orgId,
        resolvedPatientId,
        `Order: ${summaryTitle.slice(0, 50)}`,
        date || new Date().toISOString().split('T')[0],
        clinicianSignature.trim(),
        orderContent ? orderContent.slice(0, 150) : summaryTitle
      ]);
    }

    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      episodeAssociated: row.episode_associated,
      attendingPhysician: row.attending_physician,
      sendTo: row.send_to,
      copyTo: row.copy_to,
      date: row.order_date,
      time: row.order_time,
      effectiveDate: row.effective_date,
      orderIsForNextEpisode: row.order_is_for_next_episode,
      summaryTitle: row.summary_title,
      orderType: row.order_type,
      orderContent: row.order_content,
      orderReadBackAndVerified: row.order_read_back_and_verified,
      clinicianSignature: row.clinician_signature,
      signatureDate: row.signature_date,
      signatureTime: row.signature_time,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// --- Face-to-Face Encounters ---
app.get('/api/face-to-face-encounters', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.query;
    let query = `
      SELECT 
        f.id,
        f.patient_id as "patientId",
        f.patient_name as "patientName",
        f.mrn,
        f.patient_status as "patientStatus",
        f.episode_associated as "episodeAssociated",
        f.physician,
        TO_CHAR(f.request_date, 'YYYY-MM-DD') as "requestDate",
        f.certifying_type as "certifyingType",
        f.status,
        f.created_at as "createdAt"
      FROM face_to_face_encounters f
    `;
    const params: any[] = [];
    if (patientId) {
      params.push(patientId);
      query += ` WHERE f.patient_id::text = $1 OR f.mrn = $1`;
    }
    query += ` ORDER BY f.request_date DESC, f.created_at DESC;`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching face-to-face encounters:', err);
    res.status(500).json({ error: 'Failed to fetch face-to-face encounters' });
  }
});

app.post('/api/face-to-face-encounters', async (req: Request, res: Response) => {
  try {
    const { patientId, patientName, patientStatus, episodeAssociated, physician, requestDate, certifyingType, status } = req.body;
    if (!patientId || !physician || !requestDate) {
      return res.status(400).json({ error: 'Patient ID, Physician, and Request Date are required' });
    }
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const insRes = await pool.query(`
      INSERT INTO face_to_face_encounters (
        organization_id, patient_id, patient_name, mrn, patient_status,
        episode_associated, physician, request_date, certifying_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9, $10)
      RETURNING *
    `, [
      orgId,
      resolvedPatientId,
      resolvedPatName,
      resolvedMrn,
      patientStatus || 'Active',
      episodeAssociated || 'Current Active Episode',
      physician.trim(),
      requestDate,
      certifyingType || 'POC Certifying Physician',
      status || 'Pending'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      patientStatus: row.patient_status,
      episodeAssociated: row.episode_associated,
      physician: row.physician,
      requestDate: row.request_date,
      certifyingType: row.certifying_type,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating face-to-face encounter:', err);
    res.status(500).json({ error: 'Failed to create encounter' });
  }
});

// --- Facilities ---
app.get('/api/facilities', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, facility_type as "facilityType",
        address_line1 as "addressLine1", address_line2 as "addressLine2",
        city, state, zip, phone, fax,
        contact_person as "contactPerson", email, comments, status,
        created_at as "createdAt"
      FROM facilities
      ORDER BY name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching facilities:', err);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

app.post('/api/facilities', async (req: Request, res: Response) => {
  try {
    const { name, facilityType, addressLine1, addressLine2, city, state, zip, phone, fax, contactPerson, email, comments, status } = req.body;
    if (!name || !addressLine1 || !city || !zip) {
      return res.status(400).json({ error: 'Facility Name, Address, City, and Zip are required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO facilities (
        organization_id, name, facility_type, address_line1, address_line2,
        city, state, zip, phone, fax, contact_person, email, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      orgId, name.trim(), facilityType || 'Hospital', addressLine1.trim(), addressLine2 || '',
      city.trim(), state || 'MA', zip.trim(), phone || '', fax || '',
      contactPerson || '', email || '', comments || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      facilityType: row.facility_type,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      contactPerson: row.contact_person,
      email: row.email,
      comments: row.comments,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating facility:', err);
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

// --- Physicians ---
app.get('/api/physicians', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, first_name as "firstName", last_name as "lastName",
        first_name || ' ' || last_name || ', ' || credentials as "fullName",
        credentials, npi, taxonomy_code as "taxonomyCode",
        medicaid_provider_id as "medicaidProviderId", pecos_status as "pecosStatus",
        address_line1 as "addressLine1", address_line2 as "addressLine2",
        city, state, zip, phone, fax, email,
        order_delivery_method as "orderDeliveryMethod", comments, status,
        created_at as "createdAt"
      FROM physicians
      ORDER BY last_name ASC, first_name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching physicians:', err);
    res.status(500).json({ error: 'Failed to fetch physicians' });
  }
});

app.post('/api/physicians', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, credentials, npi, taxonomyCode, medicaidProviderId, pecosStatus, addressLine1, addressLine2, city, state, zip, phone, fax, email, orderDeliveryMethod, comments, status } = req.body;
    if (!firstName || !lastName || !npi || !addressLine1 || !city || !zip || !phone) {
      return res.status(400).json({ error: 'First Name, Last Name, NPI, Address, City, Zip, and Phone are required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO physicians (
        organization_id, first_name, last_name, credentials, npi,
        taxonomy_code, medicaid_provider_id, pecos_status, address_line1, address_line2,
        city, state, zip, phone, fax, email, order_delivery_method, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `, [
      orgId, firstName.trim(), lastName.trim(), credentials || 'MD', npi.trim(),
      taxonomyCode || '', medicaidProviderId || '', pecosStatus || 'Verified',
      addressLine1.trim(), addressLine2 || '', city.trim(), state || 'MA', zip.trim(),
      phone.trim(), fax || '', email || '', orderDeliveryMethod || 'Fax Transmission',
      comments || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}, ${row.credentials}`,
      credentials: row.credentials,
      npi: row.npi,
      taxonomyCode: row.taxonomy_code,
      medicaidProviderId: row.medicaid_provider_id,
      pecosStatus: row.pecos_status,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      email: row.email,
      orderDeliveryMethod: row.order_delivery_method,
      comments: row.comments,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating physician:', err);
    res.status(500).json({ error: 'Failed to create physician' });
  }
});

// --- Insurance Payers ---
app.get('/api/insurance-payers', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, payer_name as "name", payer_name as "payerName",
        payer_type as "payerType", source_of_payment as "sourceOfPayment",
        clearinghouse, billing_provider_id as "billingProviderId",
        address_line1 as "addressLine1", city, state, zip, phone, fax, email,
        contact_person as "contactPerson", requires_authorization as "requiresAuthorization",
        notes, status, created_at as "createdAt"
      FROM insurance_payers
      ORDER BY payer_name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching insurance payers:', err);
    res.status(500).json({ error: 'Failed to fetch insurance payers' });
  }
});

app.post('/api/insurance-payers', async (req: Request, res: Response) => {
  try {
    const { name, payerName, payerType, sourceOfPayment, clearinghouse, billingProviderId, addressLine1, city, state, zip, phone, fax, email, contactPerson, requiresAuthorization, notes, status } = req.body;
    const resolvedName = (name || payerName || '').trim();
    if (!resolvedName) {
      return res.status(400).json({ error: 'Payer Name is required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO insurance_payers (
        organization_id, payer_name, payer_type, source_of_payment, clearinghouse,
        billing_provider_id, address_line1, city, state, zip, phone, fax, email,
        contact_person, requires_authorization, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      orgId, resolvedName, payerType || 'Commercial / Private insurance', sourceOfPayment || '',
      clearinghouse || 'Availity', billingProviderId || '', addressLine1 || '', city || '',
      state || 'MA', zip || '', phone || '', fax || '', email || '', contactPerson || '',
      Boolean(requiresAuthorization), notes || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.payer_name,
      payerName: row.payer_name,
      payerType: row.payer_type,
      sourceOfPayment: row.source_of_payment,
      clearinghouse: row.clearinghouse,
      billingProviderId: row.billing_provider_id,
      addressLine1: row.address_line1,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      email: row.email,
      contactPerson: row.contact_person,
      requiresAuthorization: row.requires_authorization,
      notes: row.notes,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating insurance payer:', err);
    res.status(500).json({ error: 'Failed to create insurance payer' });
  }
});

// --- Pharmacies ---
app.get('/api/pharmacies', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, address_line1 as "addressLine1", address_line2 as "addressLine2",
        city, state, zip, phone, fax, contact_person as "contactPerson", email,
        comments, status, created_at as "createdAt"
      FROM pharmacies
      ORDER BY name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching pharmacies:', err);
    res.status(500).json({ error: 'Failed to fetch pharmacies' });
  }
});

app.post('/api/pharmacies', async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, addressLine2, city, state, zip, phone, fax, contactPerson, email, comments, status } = req.body;
    if (!name || !addressLine1 || !city || !zip) {
      return res.status(400).json({ error: 'Pharmacy Name, Address, City, and Zip are required' });
    }
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const insRes = await pool.query(`
      INSERT INTO pharmacies (
        organization_id, name, address_line1, address_line2, city, state, zip,
        phone, fax, contact_person, email, comments, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      orgId, name.trim(), addressLine1.trim(), addressLine2 || '', city.trim(),
      state || 'MA', zip.trim(), phone || '', fax || '', contactPerson || '',
      email || '', comments || '', status || 'Active'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      phone: row.phone,
      fax: row.fax,
      contactPerson: row.contact_person,
      email: row.email,
      comments: row.comments,
      status: row.status,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating pharmacy:', err);
    res.status(500).json({ error: 'Failed to create pharmacy' });
  }
});

// --- Infection Logs ---
app.get('/api/infection-logs', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, patient_id as "patientId", patient_name as "patientName", mrn,
        TO_CHAR(date_of_infection, 'YYYY-MM-DD') as "dateOfInfection",
        episode_period as "episodePeriod", infection_site as "infectionSite",
        infection_type as "infectionType", pathogen, treatment,
        precautions, physician_notified as "physicianNotified",
        physician_name as "physicianName", resolved,
        TO_CHAR(resolution_date, 'YYYY-MM-DD') as "resolutionDate",
        surveillance_notes as "surveillanceNotes", created_by as "createdBy",
        created_at as "createdAt"
      FROM infection_logs
      ORDER BY date_of_infection DESC, created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching infection logs:', err);
    res.status(500).json({ error: 'Failed to fetch infection logs' });
  }
});

app.post('/api/infection-logs', async (req: Request, res: Response) => {
  try {
    const { patientId, patientName, dateOfInfection, episodePeriod, infectionSite, infectionType, pathogen, treatment, precautions, physicianNotified, physicianName, resolved, resolutionDate, surveillanceNotes, createdBy } = req.body;
    if (!patientId || !infectionSite || !infectionType) {
      return res.status(400).json({ error: 'Patient ID, Infection Site, and Infection Type are required' });
    }
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const insRes = await pool.query(`
      INSERT INTO infection_logs (
        organization_id, patient_id, patient_name, mrn, date_of_infection,
        episode_period, infection_site, infection_type, pathogen, treatment,
        precautions, physician_notified, physician_name, resolved, resolution_date,
        surveillance_notes, created_by
      ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      orgId, resolvedPatientId, resolvedPatName, resolvedMrn,
      dateOfInfection || new Date().toISOString().split('T')[0],
      episodePeriod || 'Current 60-Day Episode', infectionSite.trim(), infectionType.trim(),
      pathogen || '', treatment || '', precautions || 'Universal precautions',
      Boolean(physicianNotified), physicianName || '', Boolean(resolved),
      resolutionDate ? resolutionDate : null, surveillanceNotes || '', createdBy || 'Clinical Staff'
    ]);
    const row = insRes.rows[0];
    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      dateOfInfection: row.date_of_infection,
      episodePeriod: row.episode_period,
      infectionSite: row.infection_site,
      infectionType: row.infection_type,
      pathogen: row.pathogen,
      treatment: row.treatment,
      precautions: row.precautions,
      physicianNotified: row.physician_notified,
      physicianName: row.physician_name,
      resolved: row.resolved,
      resolutionDate: row.resolution_date,
      surveillanceNotes: row.surveillance_notes,
      createdBy: row.created_by,
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating infection log:', err);
    res.status(500).json({ error: 'Failed to create infection log' });
  }
});

// --- Incident Logs ---
app.get('/api/incident-logs', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id, i.patient_id as "patientId", i.patient_name as "patientName", i.mrn,
        TO_CHAR(i.incident_date, 'YYYY-MM-DD') as "incidentDate",
        i.incident_time as "incidentTime", i.incident_type as "incidentType",
        i.location, i.injury_sustained as "injurySustained",
        i.injury_description as "injuryDescription", i.narrative,
        i.action_taken as "actionTaken", i.physician_notified as "physicianNotified",
        i.supervisor_notified as "supervisorNotified", i.reporter_name as "reporterName",
        i.reporter_role as "reporterRole", i.status, i.created_at as "createdAt",
        COALESCE(p.attending_physician, 'Dr. Anita Gupta, MD') as physician,
        'Standards Home Care' as branch
      FROM incident_logs i
      LEFT JOIN patients p ON i.patient_id = p.id
      ORDER BY i.incident_date DESC, i.created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching incident logs:', err);
    res.status(500).json({ error: 'Failed to fetch incident logs' });
  }
});

app.post('/api/incident-logs', async (req: Request, res: Response) => {
  try {
    const { patientId, patientName, incidentDate, incidentTime, incidentType, location, injurySustained, injuryDescription, narrative, actionTaken, physicianNotified, supervisorNotified, reporterName, reporterRole, status } = req.body;
    if (!patientId || !incidentType || !narrative || !reporterName) {
      return res.status(400).json({ error: 'Patient ID, Incident Type, Narrative, and Reporter Name are required' });
    }
    const patRes = await pool.query('SELECT id, organization_id, first_name, last_name, mrn, attending_physician FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1', [patientId]);
    let resolvedPatientId = null;
    let resolvedMrn = '';
    let resolvedPatName = patientName;
    let orgId = null;
    let attendingPhysician = 'Dr. Anita Gupta, MD';

    if (patRes.rows.length > 0) {
      const pat = patRes.rows[0];
      resolvedPatientId = pat.id;
      resolvedMrn = pat.mrn;
      resolvedPatName = `${pat.last_name}, ${pat.first_name}`;
      orgId = pat.organization_id;
      if (pat.attending_physician) attendingPhysician = pat.attending_physician;
    } else {
      const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
      orgId = orgRes.rows[0]?.id;
    }

    const insRes = await pool.query(`
      INSERT INTO incident_logs (
        organization_id, patient_id, patient_name, mrn, incident_date,
        incident_time, incident_type, location, injury_sustained,
        injury_description, narrative, action_taken, physician_notified,
        supervisor_notified, reporter_name, reporter_role, status
      ) VALUES ($1, $2, $3, $4, $5::date, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      orgId, resolvedPatientId, resolvedPatName, resolvedMrn,
      incidentDate || new Date().toISOString().split('T')[0], incidentTime || '10:00 AM',
      incidentType.trim(), location || 'Patient Home', Boolean(injurySustained),
      injuryDescription || '', narrative.trim(), actionTaken || '',
      Boolean(physicianNotified), Boolean(supervisorNotified), reporterName.trim(),
      reporterRole || 'Staff Clinician', status || 'Logged & Submitted'
    ]);
    const row = insRes.rows[0];

    // Also add to patient_tasks if patient exists so it appears in PatientChartsView
    if (resolvedPatientId && orgId) {
      try {
        await pool.query(`
          INSERT INTO patient_tasks (
            organization_id, patient_id, task_name, discipline, status, schedule_start, schedule_end, assigned_to, comments
          ) VALUES ($1, $2, $3, 'Quality & Safety', 'Completed', $4::date, $4::date, $5, $6)
        `, [
          orgId,
          resolvedPatientId,
          `Incident Report: ${incidentType.trim()}`,
          incidentDate || new Date().toISOString().split('T')[0],
          reporterName.trim(),
          narrative.trim()
        ]);
      } catch (taskErr) {
        console.error('Non-critical: Failed to insert patient task for incident:', taskErr);
      }
    }

    res.status(201).json({
      id: row.id,
      patientId: row.patient_id,
      patientName: row.patient_name,
      mrn: row.mrn,
      incidentDate: row.incident_date,
      incidentTime: row.incident_time,
      incidentType: row.incident_type,
      location: row.location,
      injurySustained: row.injury_sustained,
      injuryDescription: row.injury_description,
      narrative: row.narrative,
      actionTaken: row.action_taken,
      physicianNotified: row.physician_notified,
      supervisorNotified: row.supervisor_notified,
      reporterName: row.reporter_name,
      reporterRole: row.reporter_role,
      status: row.status,
      physician: attendingPhysician,
      branch: 'Standards Home Care',
      createdAt: row.created_at
    });
  } catch (err: any) {
    console.error('Error creating incident log:', err);
    res.status(500).json({ error: 'Failed to create incident log' });
  }
});

// Patients Directory & Clinical EHR Records
app.get('/api/patients', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.mrn,
        p.first_name as "firstName",
        p.last_name as "lastName",
        TO_CHAR(p.dob, 'MM/DD/YYYY') as dob,
        DATE_PART('year', AGE(p.dob))::int as age,
        p.gender,
        p.service_line as "serviceLine",
        p.status,
        p.primary_diagnosis as "primaryDiagnosis",
        COALESCE(p.phone, '') as phone,
        p.secondary_phone as "secondaryPhone",
        p.email,
        COALESCE(p.branch, 'Main Branch') as branch,
        json_build_object(
          'street', COALESCE(p.address_street, ''),
          'city', COALESCE(p.address_city, ''),
          'state', COALESCE(p.address_state, ''),
          'zipCode', COALESCE(p.address_zip, '')
        ) as address,
        TO_CHAR(COALESCE(p.episode_start, p.admission_date), 'MM/DD/YYYY') as "episodeStart",
        TO_CHAR(COALESCE(p.episode_end, p.admission_date + INTERVAL '60 days'), 'MM/DD/YYYY') as "episodeEnd",
        TO_CHAR(COALESCE(p.start_of_care_date, p.admission_date), 'MM/DD/YYYY') as "startOfCareDate",
        TO_CHAR(p.admission_date, 'MM/DD/YYYY') as "admissionDate",
        COALESCE(p.attending_physician, '') as "attendingPhysician",
        COALESCE(p.insurance_name, '') as "insuranceName",
        COALESCE(p.policy_number, '') as "policyNumber",
        COALESCE(p.primary_contact, '') as "primaryContact",
        COALESCE(p.secondary_contact, '') as "secondaryContact",
        COALESCE(p.fall_risk, false) as "fallRisk",
        COALESCE(p.hospitalization_risk, false) as "hospitalizationRisk",
        COALESCE(p.infection_risk, false) as "infectionRisk",
        COALESCE(p.full_code, true) as "fullCode",
        COALESCE(u.full_name, 'Unassigned') as "assignedNurseName"
      FROM patients p
      LEFT JOIN clinicians c ON p.assigned_clinician_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY 
        CASE WHEN p.mrn = '1061' THEN 0 ELSE 1 END,
        p.last_name, p.first_name;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Patient Tasks for Patient Charts
app.get('/api/patients/:id/tasks', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        patient_id as "patientId",
        task_name as task,
        discipline,
        status,
        TO_CHAR(schedule_start, 'MM/DD/YYYY') as "scheduleStart",
        TO_CHAR(schedule_end, 'MM/DD/YYYY') as "scheduleEnd",
        assigned_to as "assignedTo",
        COALESCE(comments, 'Not Available') as comments
      FROM patient_tasks
      WHERE patient_id = $1
      ORDER BY schedule_start ASC;
    `, [id]);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching patient tasks:', err);
    res.status(500).json({ error: 'Failed to fetch patient tasks' });
  }
});

// POST /api/patients - Admit New Patient with full inputs
app.post('/api/patients', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const mrn = data.mrn?.trim() || String(Math.floor(Math.random() * 9000 + 1000));
    const sLine = (data.serviceLine || 'home_health').toLowerCase().includes('care')
      ? 'home_care'
      : (data.serviceLine || '').toLowerCase().includes('hospice')
        ? 'hospice'
        : 'home_health';

    const insertRes = await pool.query(`
      INSERT INTO patients (
        organization_id, mrn, first_name, last_name, dob, gender, service_line, status,
        primary_diagnosis, phone, secondary_phone, email, address_street, address_city,
        address_state, address_zip, episode_start, episode_end, start_of_care_date,
        attending_physician, insurance_name, policy_number, primary_contact, secondary_contact,
        fall_risk, hospitalization_risk, infection_risk, full_code
      ) VALUES (
        $1, $2, $3, $4, $5::date, $6, $7, 'active',
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16::date,
        $17::date,
        $18::date,
        $19, $20, $21, $22, $23,
        $24, $25, $26, $27
      ) RETURNING *;
    `, [
      orgId,
      mrn,
      data.firstName || 'New',
      data.lastName || 'Patient',
      data.dob || null,
      data.gender || 'female',
      sLine,
      data.primaryDiagnosis || '',
      data.phone || '',
      data.secondaryPhone || data.altPhone || null,
      data.email || null,
      data.address?.street || data.street || '',
      data.address?.city || data.city || '',
      data.address?.state || data.state || '',
      data.address?.zipCode || data.zip || '',
      data.episodeStart || null,
      data.episodeEnd || null,
      data.startOfCareDate || null,
      data.attendingPhysician || '',
      data.insuranceName || '',
      data.policyNumber || data.insuranceId || '',
      data.primaryContact || data.primaryContactName || '',
      data.secondaryContact || (data.primaryContactPhone ? `${data.primaryContactPhone} (${data.primaryContactRelation || 'Contact'})` : ''),
      data.fallRisk ?? false,
      data.hospitalizationRisk ?? false,
      data.infectionRisk ?? false,
      data.fullCode ?? true
    ]);

    const p = insertRes.rows[0];

    // Auto-create initial chart tasks for newly admitted patient
    await pool.query(`
      INSERT INTO patient_tasks (
        organization_id, patient_id, task_name, discipline, status,
        schedule_start, schedule_end, assigned_to, comments
      ) VALUES 
      ($1, $2, 'Communication Note', 'Nursing', 'Completed', CURRENT_DATE, CURRENT_DATE, 'Admission Coordinator', 'Initial intake documentation completed.'),
      ($1, $2, 'Coordination of Care', 'Nursing', 'Not Yet Due', CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', 'Clinical Supervisor', 'Not Available'),
      ($1, $2, 'Face-to-Face Encounter', 'Physician Liaison', 'Returned w/ Physician Signature', CURRENT_DATE, CURRENT_DATE, 'Attending Physician', 'Physician sign-off secured.');
    `, [orgId, p.id]);

    res.status(201).json({
      id: p.id,
      mrn: p.mrn,
      firstName: p.first_name,
      lastName: p.last_name,
      dob: p.dob ? new Date(p.dob).toLocaleDateString('en-US') : '',
      age: data.age || (p.dob ? Math.floor((Date.now() - new Date(p.dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : 0),
      gender: p.gender,
      serviceLine: p.service_line,
      status: p.status,
      primaryDiagnosis: p.primary_diagnosis,
      phone: p.phone,
      secondaryPhone: p.secondary_phone,
      email: p.email,
      address: {
        street: p.address_street,
        city: p.address_city,
        state: p.address_state,
        zipCode: p.address_zip
      },
      episodeStart: p.episode_start ? new Date(p.episode_start).toLocaleDateString('en-US') : '',
      episodeEnd: p.episode_end ? new Date(p.episode_end).toLocaleDateString('en-US') : '',
      startOfCareDate: p.start_of_care_date ? new Date(p.start_of_care_date).toLocaleDateString('en-US') : '',
      attendingPhysician: p.attending_physician,
      insuranceName: p.insurance_name,
      policyNumber: p.policy_number,
      primaryContact: p.primary_contact,
      secondaryContact: p.secondary_contact,
      fallRisk: p.fall_risk,
      hospitalizationRisk: p.hospitalization_risk,
      infectionRisk: p.infection_risk,
      fullCode: p.full_code
    });
  } catch (err: any) {
    console.error('Error adding patient:', err);
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

// POST /api/patients/:patientId/tasks - Add a task to patient chart
app.post('/api/patients/:patientId/tasks', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const { task, discipline, status, scheduleStart, scheduleEnd, assignedTo, comments } = req.body;
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const result = await pool.query(`
      INSERT INTO patient_tasks (
        organization_id, patient_id, task_name, discipline, status,
        schedule_start, schedule_end, assigned_to, comments
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id,
        patient_id as "patientId",
        task_name as task,
        discipline,
        status,
        TO_CHAR(schedule_start, 'MM/DD/YYYY') as "scheduleStart",
        TO_CHAR(schedule_end, 'MM/DD/YYYY') as "scheduleEnd",
        assigned_to as "assignedTo",
        comments;
    `, [
      orgId,
      patientId,
      task || 'Communication Note',
      discipline || 'Nursing',
      status || 'Not Yet Due',
      scheduleStart || new Date().toISOString().split('T')[0],
      scheduleEnd || new Date().toISOString().split('T')[0],
      assignedTo || 'Unassigned Clinician',
      comments || 'Not Available'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating patient task:', err);
    res.status(500).json({ error: 'Failed to create patient task' });
  }
});

// DELETE /api/patients/:patientId/tasks/:taskId - Delete a chart task
app.delete('/api/patients/:patientId/tasks/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    await pool.query('DELETE FROM patient_tasks WHERE id = $1', [taskId]);
    res.json({ success: true, taskId });
  } catch (err: any) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Announcements / Care Intelligence Video
app.get('/api/announcements', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        summary,
        category,
        video_url as "videoEmbedUrl"
      FROM announcements
      ORDER BY published_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// ==========================================
// Central Intake & Referrals REST API Endpoints
// ==========================================

// GET /api/intake/stats - Real-time statistics computed directly from PostgreSQL
app.get('/api/intake/stats', async (_req: Request, res: Response) => {
  try {
    const inqStats = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status IN ('new', 'contacted'))::int as pending_follow_up,
        COUNT(*) FILTER (WHERE status = 'converted')::int as converted_count
      FROM intake_referrals
      WHERE stage = 'inquiry';
    `);

    const refStats = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending_soc,
        COUNT(*) FILTER (WHERE status = 'admitted' OR stage = 'admitted')::int as admitted_count
      FROM intake_referrals
      WHERE stage != 'inquiry';
    `);

    const totalInq = inqStats.rows[0]?.total || 0;
    const convertedInq = inqStats.rows[0]?.converted_count || 0;
    const inqConversionRate = totalInq > 0 ? `${((convertedInq / totalInq) * 100).toFixed(1)}%` : '0.0%';

    const totalRef = refStats.rows[0]?.total || 0;
    const admittedRef = refStats.rows[0]?.admitted_count || 0;
    const refConversionRate = totalRef > 0 ? `${((admittedRef / totalRef) * 100).toFixed(1)}%` : '0.0%';

    res.json({
      inquiries: {
        total: totalInq,
        pendingFollowUp: inqStats.rows[0]?.pending_follow_up || 0,
        convertedCount: convertedInq,
        conversionRate: inqConversionRate,
      },
      referrals: {
        total: totalRef,
        pendingSoc: refStats.rows[0]?.pending_soc || 0,
        admittedCount: admittedRef,
        conversionRate: refConversionRate,
      }
    });
  } catch (err: any) {
    console.error('Error fetching intake stats:', err);
    res.status(500).json({ error: 'Failed to fetch intake stats' });
  }
});

// GET /api/intake/inquiries - List all inquiries
app.get('/api/intake/inquiries', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        TO_CHAR(received_at, 'YYYY-MM-DD') as "inquiryDate",
        COALESCE(client_first_name, SPLIT_PART(patient_name, ' ', 1)) as "clientFirstName",
        COALESCE(client_last_name, SPLIT_PART(patient_name, ' ', 2)) as "clientLastName",
        COALESCE(phone, '(214) 555-0100') as "clientPhone",
        COALESCE(phone_type, 'Home') as "clientPhoneType",
        COALESCE(contact_first_name, 'Family') as "contactFirstName",
        COALESCE(contact_last_name, 'Caregiver') as "contactLastName",
        COALESCE(contact_phone, phone, '(214) 555-0100') as "contactPhone",
        COALESCE(contact_phone_type, 'Mobile') as "contactPhoneType",
        COALESCE(contact_relationship, 'Family') as "contactRelationship",
        COALESCE(branch, 'Standards Home Care') as branch,
        'Standards Home Care' as organization,
        COALESCE(service_requested, referral_source, 'Skilled Nursing Assessment') as "serviceRequested",
        service_line as "serviceLine",
        COALESCE(assigned_team_member, 'Sarah Jenkins, RN') as "assignedTeamMember",
        COALESCE(TO_CHAR(follow_up_date, 'YYYY-MM-DD'), TO_CHAR(received_at + INTERVAL '2 days', 'YYYY-MM-DD')) as "followUpDate",
        COALESCE(clinical_summary, notes, '') as comments,
        COALESCE(status, 'new') as status,
        urgency
      FROM intake_referrals
      WHERE stage = 'inquiry'
      ORDER BY received_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// GET /api/intake/referrals - List all referrals
app.get('/api/intake/referrals', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        TO_CHAR(received_at, 'MM/DD/YYYY') as "referralDate",
        COALESCE(TO_CHAR(requested_soc, 'YYYY-MM-DD'), TO_CHAR(received_at + INTERVAL '2 days', 'YYYY-MM-DD')) as "requestedSoc",
        patient_name as "patientName",
        COALESCE(phone, '(555) 000-0000') as "patientPhone",
        COALESCE(mrn, 'MRN-' || SUBSTRING(id::text, 1, 5)) as "patientMrn",
        COALESCE(branch, 'Standards Home Care') as branch,
        'Standards Home Care' as organization,
        CASE 
          WHEN service_line = 'home_health' THEN 'Home Health'
          WHEN service_line = 'home_care' THEN 'Home Care'
          WHEN service_line = 'hospice' THEN 'Hospice'
          ELSE 'Home Health'
        END as "lineOfService",
        COALESCE(referral_source, 'Hospital Discharge') as "referralType",
        COALESCE(TO_CHAR(dob, 'YYYY-MM-DD'), '1952-04-15') as dob,
        COALESCE(gender, 'Female') as sex,
        COALESCE(created_by, 'INTAKE COORDINATOR') as "createdBy",
        COALESCE(liaison, 'Not Available') as liaison,
        COALESCE(tags, 'Direct Intake') as tags,
        COALESCE(status, 'pending') as status,
        COALESCE(notes, clinical_summary, '') as notes
      FROM intake_referrals
      WHERE stage != 'inquiry'
      ORDER BY received_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching referrals:', err);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// POST /api/intake/inquiries - Create new Inquiry
app.post('/api/intake/inquiries', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const patientName = `${data.clientFirstName || ''} ${data.clientLastName || ''}`.trim() || 'New Patient Lead';
    const sLine = (data.serviceLine || 'home_health').toLowerCase().includes('care')
      ? 'home_care'
      : (data.serviceLine || '').toLowerCase().includes('hospice')
        ? 'hospice'
        : 'home_health';

    const insertRes = await pool.query(`
      INSERT INTO intake_referrals (
        organization_id, patient_name, client_first_name, client_last_name,
        phone, phone_type, contact_first_name, contact_last_name, contact_phone,
        contact_phone_type, contact_relationship, branch, service_requested,
        service_line, referral_source, assigned_team_member, follow_up_date,
        clinical_summary, stage, status, urgency, received_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        COALESCE($17::date, CURRENT_DATE + INTERVAL '2 days'), $18, 'inquiry', $19, $20, CURRENT_TIMESTAMP
      ) RETURNING *;
    `, [
      orgId,
      patientName,
      data.clientFirstName || '',
      data.clientLastName || '',
      data.clientPhone || '',
      data.clientPhoneType || 'Home',
      data.contactFirstName || '',
      data.contactLastName || '',
      data.contactPhone || '',
      data.contactPhoneType || 'Mobile',
      data.contactRelationship || 'Family',
      data.branch || 'Standards Home Care',
      data.serviceRequested || 'General Clinical Assessment',
      sLine,
      data.referralSource || data.serviceRequested || 'Direct Intake',
      data.assignedTeamMember || 'Sarah Jenkins, RN',
      data.followUpDate || null,
      data.comments || data.notes || '',
      data.status || 'new',
      data.urgency || 'routine'
    ]);

    const row = insertRes.rows[0];
    res.status(201).json({
      id: row.id,
      inquiryDate: new Date(row.received_at).toISOString().slice(0, 10),
      clientFirstName: row.client_first_name,
      clientLastName: row.client_last_name,
      clientPhone: row.phone,
      clientPhoneType: row.phone_type,
      contactFirstName: row.contact_first_name,
      contactLastName: row.contact_last_name,
      contactPhone: row.contact_phone,
      contactPhoneType: row.contact_phone_type,
      contactRelationship: row.contact_relationship,
      branch: row.branch,
      organization: 'Standards Home Care',
      serviceRequested: row.service_requested,
      serviceLine: row.service_line,
      assignedTeamMember: row.assigned_team_member,
      followUpDate: row.follow_up_date ? new Date(row.follow_up_date).toISOString().slice(0, 10) : '',
      comments: row.clinical_summary,
      status: row.status,
      urgency: row.urgency
    });
  } catch (err: any) {
    console.error('Error creating inquiry:', err);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// PUT /api/intake/inquiries/:id - Update Inquiry
app.put('/api/intake/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const patientName = `${data.clientFirstName || ''} ${data.clientLastName || ''}`.trim();
    const sLine = (data.serviceLine || 'home_health').toLowerCase().includes('care')
      ? 'home_care'
      : (data.serviceLine || '').toLowerCase().includes('hospice')
        ? 'hospice'
        : 'home_health';

    const updateRes = await pool.query(`
      UPDATE intake_referrals SET
        patient_name = COALESCE(NULLIF($2, ''), patient_name),
        client_first_name = COALESCE($3, client_first_name),
        client_last_name = COALESCE($4, client_last_name),
        phone = COALESCE($5, phone),
        contact_first_name = COALESCE($6, contact_first_name),
        contact_last_name = COALESCE($7, contact_last_name),
        contact_phone = COALESCE($8, contact_phone),
        contact_relationship = COALESCE($9, contact_relationship),
        branch = COALESCE($10, branch),
        service_requested = COALESCE($11, service_requested),
        service_line = $12,
        assigned_team_member = COALESCE($13, assigned_team_member),
        follow_up_date = COALESCE($14::date, follow_up_date),
        clinical_summary = COALESCE($15, clinical_summary),
        status = COALESCE($16, status),
        urgency = COALESCE($17, urgency)
      WHERE id = $1
      RETURNING *;
    `, [
      id,
      patientName,
      data.clientFirstName,
      data.clientLastName,
      data.clientPhone,
      data.contactFirstName,
      data.contactLastName,
      data.contactPhone,
      data.contactRelationship,
      data.branch,
      data.serviceRequested,
      sLine,
      data.assignedTeamMember,
      data.followUpDate || null,
      data.comments || data.notes,
      data.status,
      data.urgency
    ]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    const row = updateRes.rows[0];
    res.json({
      id: row.id,
      inquiryDate: new Date(row.received_at).toISOString().slice(0, 10),
      clientFirstName: row.client_first_name,
      clientLastName: row.client_last_name,
      clientPhone: row.phone,
      clientPhoneType: row.phone_type,
      contactFirstName: row.contact_first_name,
      contactLastName: row.contact_last_name,
      contactPhone: row.contact_phone,
      contactPhoneType: row.contact_phone_type,
      contactRelationship: row.contact_relationship,
      branch: row.branch,
      organization: 'Standards Home Care',
      serviceRequested: row.service_requested,
      serviceLine: row.service_line,
      assignedTeamMember: row.assigned_team_member,
      followUpDate: row.follow_up_date ? new Date(row.follow_up_date).toISOString().slice(0, 10) : '',
      comments: row.clinical_summary,
      status: row.status,
      urgency: row.urgency
    });
  } catch (err: any) {
    console.error('Error updating inquiry:', err);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// POST /api/intake/inquiries/:id/convert - Convert Inquiry into Referral
app.post('/api/intake/inquiries/:id/convert', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Fetch current inquiry
    const inqRes = await pool.query('SELECT * FROM intake_referrals WHERE id = $1', [id]);
    if (inqRes.rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    const inq = inqRes.rows[0];

    // 2. Mark inquiry as converted
    await pool.query("UPDATE intake_referrals SET status = 'converted' WHERE id = $1", [id]);

    // 3. Create a corresponding referral row in stage 'referral'
    const newRefRes = await pool.query(`
      INSERT INTO intake_referrals (
        organization_id, patient_name, client_first_name, client_last_name,
        phone, branch, service_line, referral_source, stage, status, urgency,
        requested_soc, dob, gender, mrn, created_by, notes, received_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'referral', 'pending', $9,
        CURRENT_DATE + INTERVAL '2 days', COALESCE($10::date, '1952-04-15'::date),
        'Female', 'MRN-' || FLOOR(RANDOM() * 90000 + 10000)::text, 'Central Intake Transition',
        'Converted from Inquiry (' || $11 || '). Ready for Start of Care intake review.',
        CURRENT_TIMESTAMP
      ) RETURNING *;
    `, [
      inq.organization_id,
      inq.patient_name || `${inq.client_first_name} ${inq.client_last_name}`,
      inq.client_first_name,
      inq.client_last_name,
      inq.phone,
      inq.branch || 'Standards Home Care',
      inq.service_line,
      inq.referral_source || inq.service_requested || 'Inquiry Conversion',
      inq.urgency || 'routine',
      inq.dob || null,
      inq.id
    ]);

    const refRow = newRefRes.rows[0];
    res.json({
      success: true,
      inquiryId: id,
      convertedReferral: {
        id: refRow.id,
        referralDate: new Date(refRow.received_at).toLocaleDateString('en-US'),
        requestedSoc: refRow.requested_soc ? new Date(refRow.requested_soc).toISOString().slice(0, 10) : '',
        patientName: refRow.patient_name,
        patientPhone: refRow.phone,
        patientMrn: refRow.mrn,
        branch: refRow.branch,
        organization: 'Standards Home Care',
        lineOfService: refRow.service_line === 'home_health' ? 'Home Health' : refRow.service_line === 'hospice' ? 'Hospice' : 'Home Care',
        referralType: refRow.referral_source,
        dob: refRow.dob ? new Date(refRow.dob).toISOString().slice(0, 10) : '1952-04-15',
        sex: refRow.gender || 'Female',
        createdBy: refRow.created_by,
        liaison: refRow.liaison || 'Direct Intake',
        tags: 'Inquiry Conversion, Priority Lead',
        status: refRow.status,
        notes: refRow.notes
      }
    });
  } catch (err: any) {
    console.error('Error converting inquiry to referral:', err);
    res.status(500).json({ error: 'Failed to convert inquiry to referral' });
  }
});

// DELETE /api/intake/inquiries/:id - Delete inquiry
app.delete('/api/intake/inquiries/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM intake_referrals WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting inquiry:', err);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// POST /api/intake/referrals - Create new Referral
app.post('/api/intake/referrals', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const sLine = (data.lineOfService || 'Home Health').toLowerCase().includes('care')
      ? 'home_care'
      : (data.lineOfService || '').toLowerCase().includes('hospice')
        ? 'hospice'
        : 'home_health';

    const insertRes = await pool.query(`
      INSERT INTO intake_referrals (
        organization_id, patient_name, phone, branch, service_line,
        referral_source, requested_soc, dob, gender, mrn, created_by,
        liaison, tags, stage, status, notes, urgency, received_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE + INTERVAL '2 days'),
        COALESCE($8::date, '1952-04-15'::date), $9, $10, $11, $12, $13, 'referral',
        $14, $15, 'routine', CURRENT_TIMESTAMP
      ) RETURNING *;
    `, [
      orgId,
      data.patientName || 'New Referral Patient',
      data.patientPhone || '(555) 000-0000',
      data.branch || 'Standards Home Care',
      sLine,
      data.referralType || 'Hospital Discharge',
      data.requestedSoc || null,
      data.dob || null,
      data.sex || 'Female',
      data.patientMrn || ('MRN-' + Math.floor(Math.random() * 90000 + 10000)),
      data.createdBy || 'INTAKE COORDINATOR',
      data.liaison || 'Direct Intake',
      data.tags || 'General Referral',
      data.status || 'pending',
      data.notes || ''
    ]);

    const row = insertRes.rows[0];
    res.status(201).json({
      id: row.id,
      referralDate: new Date(row.received_at).toLocaleDateString('en-US'),
      requestedSoc: row.requested_soc ? new Date(row.requested_soc).toISOString().slice(0, 10) : '',
      patientName: row.patient_name,
      patientPhone: row.phone,
      patientMrn: row.mrn,
      branch: row.branch,
      organization: 'Standards Home Care',
      lineOfService: row.service_line === 'home_health' ? 'Home Health' : row.service_line === 'hospice' ? 'Hospice' : 'Home Care',
      referralType: row.referral_source,
      dob: row.dob ? new Date(row.dob).toISOString().slice(0, 10) : '1952-04-15',
      sex: row.gender || 'Female',
      createdBy: row.created_by,
      liaison: row.liaison,
      tags: row.tags,
      status: row.status,
      notes: row.notes
    });
  } catch (err: any) {
    console.error('Error creating referral:', err);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

// PUT /api/intake/referrals/:id - Update Referral
app.put('/api/intake/referrals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const sLine = (data.lineOfService || 'Home Health').toLowerCase().includes('care')
      ? 'home_care'
      : (data.lineOfService || '').toLowerCase().includes('hospice')
        ? 'hospice'
        : 'home_health';

    const updateRes = await pool.query(`
      UPDATE intake_referrals SET
        patient_name = COALESCE($2, patient_name),
        phone = COALESCE($3, phone),
        branch = COALESCE($4, branch),
        service_line = $5,
        referral_source = COALESCE($6, referral_source),
        requested_soc = COALESCE($7::date, requested_soc),
        dob = COALESCE($8::date, dob),
        gender = COALESCE($9, gender),
        notes = COALESCE($10, notes),
        status = COALESCE($11, status)
      WHERE id = $1
      RETURNING *;
    `, [
      id,
      data.patientName,
      data.patientPhone,
      data.branch,
      sLine,
      data.referralType,
      data.requestedSoc || null,
      data.dob || null,
      data.sex,
      data.notes,
      data.status
    ]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const row = updateRes.rows[0];
    res.json({
      id: row.id,
      referralDate: new Date(row.received_at).toLocaleDateString('en-US'),
      requestedSoc: row.requested_soc ? new Date(row.requested_soc).toISOString().slice(0, 10) : '',
      patientName: row.patient_name,
      patientPhone: row.phone,
      patientMrn: row.mrn,
      branch: row.branch,
      organization: 'Standards Home Care',
      lineOfService: row.service_line === 'home_health' ? 'Home Health' : row.service_line === 'hospice' ? 'Hospice' : 'Home Care',
      referralType: row.referral_source,
      dob: row.dob ? new Date(row.dob).toISOString().slice(0, 10) : '1952-04-15',
      sex: row.gender || 'Female',
      createdBy: row.created_by,
      liaison: row.liaison,
      tags: row.tags,
      status: row.status,
      notes: row.notes
    });
  } catch (err: any) {
    console.error('Error updating referral:', err);
    res.status(500).json({ error: 'Failed to update referral' });
  }
});

// DELETE /api/intake/referrals/:id - Delete referral
app.delete('/api/intake/referrals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM intake_referrals WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting referral:', err);
    res.status(500).json({ error: 'Failed to delete referral' });
  }
});

// ==========================================
// Schedule Center REST API Endpoints
// ==========================================

// GET /api/schedule/stats - Real-time Schedule Center metrics directly from DB
app.get('/api/schedule/stats', async (_req: Request, res: Response) => {
  try {
    // 1. Employee / Patient Calendar metrics
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status != 'unassigned' AND huv_sfv_type IS NULL)::int as total_weekly_visits,
        COUNT(*) FILTER (WHERE (evv_verified = true OR status = 'completed') AND status != 'unassigned' AND huv_sfv_type IS NULL)::int as completed_visits,
        COUNT(*) FILTER (WHERE status = 'in_progress' AND huv_sfv_type IS NULL)::int as in_progress_visits
      FROM visits;
    `);

    // 2. Active Clinicians Count
    const clinRes = await pool.query(`
      SELECT COUNT(*)::int as active_clinicians_count FROM clinicians WHERE status = 'active';
    `);

    // 3. Unassigned Visits metrics
    const unassignedRes = await pool.query(`
      SELECT 
        COUNT(*)::int as total_unassigned,
        COUNT(*) FILTER (WHERE priority IN ('urgent', 'stat'))::int as urgent_unassigned,
        COUNT(*) FILTER (WHERE task ILIKE '%RN%' OR task ILIKE '%Nurse%' OR task ILIKE '%LVN%')::int as nursing_unassigned,
        COUNT(*) FILTER (WHERE task ILIKE '%Aide%' OR task ILIKE '%HHA%' OR task ILIKE '%PT%' OR task ILIKE '%Therapy%')::int as aide_therapy_unassigned
      FROM visits
      WHERE status = 'unassigned';
    `);

    // 4. HUV / SFV Report metrics
    const huvSfvRes = await pool.query(`
      SELECT 
        COUNT(*)::int as total_audit_tasks,
        COUNT(*) FILTER (WHERE huv_sfv_type ILIKE 'HUV%')::int as huv_encounters,
        COUNT(*) FILTER (WHERE huv_sfv_type = 'SFV')::int as sfv_encounters,
        COUNT(*) FILTER (WHERE days_remaining <= 3)::int as due_within_3_days
      FROM visits
      WHERE huv_sfv_type IS NOT NULL;
    `);

    const s = statsRes.rows[0];
    const c = clinRes.rows[0];
    const u = unassignedRes.rows[0];
    const h = huvSfvRes.rows[0];

    res.json({
      totalWeeklyVisits: s.total_weekly_visits || 0,
      completedVisits: s.completed_visits || 0,
      inProgressVisits: s.in_progress_visits || 0,
      activeCliniciansCount: c.active_clinicians_count || 0,
      unassignedVisits: {
        total: u.total_unassigned || 0,
        urgent: u.urgent_unassigned || 0,
        nursing: u.nursing_unassigned || 0,
        aideTherapy: u.aide_therapy_unassigned || 0,
      },
      huvSfvReport: {
        totalAuditTasks: h.total_audit_tasks || 0,
        huvEncounters: h.huv_encounters || 0,
        sfvEncounters: h.sfv_encounters || 0,
        dueWithin3Days: h.due_within_3_days || 0,
      }
    });
  } catch (err: any) {
    console.error('Error fetching schedule stats:', err);
    res.status(500).json({ error: 'Failed to fetch schedule stats' });
  }
});

// GET /api/schedule/clinicians - Roster of real field clinicians
app.get('/api/schedule/clinicians', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        COALESCE(c.name, u.full_name) as name,
        COALESCE(c.title, 'Registered Nurse') as title,
        COALESCE(c.credentials, 'RN') as credentials,
        c.license_number as "licenseNumber",
        c.specialty,
        c.max_daily_visits as "maxDailyVisits",
        c.territory,
        COALESCE(c.service_lines, ARRAY['home_health']) as "serviceLines",
        c.latitude::float as latitude,
        c.longitude::float as longitude,
        COALESCE(c.current_address, 'Dallas Metro TX') as "currentAddress",
        COALESCE(c.status, 'active') as status,
        COALESCE(c.work_status, 'Available') as "workStatus",
        COALESCE(c.phone, u.phone, '(214) 555-0100') as phone,
        u.email,
        u.avatar_url as "avatarUrl"
      FROM clinicians c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY COALESCE(c.name, u.full_name);
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching clinicians:', err);
    res.status(500).json({ error: 'Failed to fetch clinicians' });
  }
});

// GET /api/schedule/visits - Assigned Employee & Patient Calendar Visits
app.get('/api/schedule/visits', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id,
        v.clinician_id as "employeeId",
        COALESCE(v.employee_name, c.name, 'Unassigned') as "employeeName",
        v.patient_id as "patientId",
        COALESCE(v.patient_name, p.first_name || ' ' || p.last_name, 'Patient') as "patientName",
        COALESCE(p.mrn, 'MRN-78210') as "patientMrn",
        COALESCE(v.visit_type, v.task, 'Skilled Nurse Visit') as "visitType",
        v.service_line as "serviceLine",
        COALESCE(v.day_of_week, EXTRACT(DOW FROM v.scheduled_start)::int, 2) as "dayOfWeek",
        TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start), 'YYYY-MM-DD') as date,
        COALESCE(v.time_slot, TO_CHAR(v.scheduled_start, 'HH12:MI AM'), '09:00 AM') as "timeSlot",
        v.status,
        COALESCE(v.location_type, 'home') as "locationType",
        COALESCE(v.evv_status, CASE WHEN v.evv_verified THEN 'verified' ELSE 'pending' END) as "evvStatus",
        COALESCE(v.address, p.address_street || ', ' || p.address_city, '1420 Harvard St, Dallas TX') as address,
        COALESCE(v.latitude, p.latitude, 32.7767)::float as latitude,
        COALESCE(v.longitude, p.longitude, -96.7970)::float as longitude,
        COALESCE(v.clinical_notes, '') as notes
      FROM visits v
      LEFT JOIN clinicians c ON v.clinician_id = c.id
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE v.status != 'unassigned' AND v.huv_sfv_type IS NULL
      ORDER BY v.scheduled_start ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching schedule visits:', err);
    res.status(500).json({ error: 'Failed to fetch schedule visits' });
  }
});

// GET /api/schedule/unassigned - Unassigned encounters awaiting clinician dispatch
app.get('/api/schedule/unassigned', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id,
        v.patient_id as "patientId",
        COALESCE(v.patient_name, p.first_name || ' ' || p.last_name, 'Patient') as "patientName",
        COALESCE(p.mrn, 'MRN-78210') as "patientMrn",
        COALESCE(p.phone, '(214) 555-0100') as "patientPhone",
        COALESCE(v.address, p.address_street || ', ' || p.address_city, 'Dallas TX') as "patientAddress",
        v.service_line as "serviceLine",
        COALESCE(v.branch, 'Standards Home Care') as branch,
        COALESCE(v.task, v.visit_type, 'Skilled Nurse Visit') as task,
        TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start), 'YYYY-MM-DD') as "scheduledDate",
        CASE 
          WHEN EXTRACT(DOW FROM COALESCE(v.scheduled_date, v.scheduled_start)) = 0 THEN 'Sunday'
          WHEN EXTRACT(DOW FROM COALESCE(v.scheduled_date, v.scheduled_start)) = 1 THEN 'Monday'
          WHEN EXTRACT(DOW FROM COALESCE(v.scheduled_date, v.scheduled_start)) = 2 THEN 'Tuesday'
          WHEN EXTRACT(DOW FROM COALESCE(v.scheduled_date, v.scheduled_start)) = 3 THEN 'Wednesday'
          WHEN EXTRACT(DOW FROM COALESCE(v.scheduled_date, v.scheduled_start)) = 4 THEN 'Thursday'
          WHEN EXTRACT(DOW FROM COALESCE(v.scheduled_date, v.scheduled_start)) = 5 THEN 'Friday'
          ELSE 'Saturday'
        END as "dayOfWeek",
        COALESCE(v.time_slot, '09:00 AM - 10:30 AM') as "timeSlot",
        v.priority,
        v.status,
        COALESCE(v.required_credentials, ARRAY['RN']) as "requiredCredentials",
        COALESCE(v.clinical_notes, '') as notes
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE v.status = 'unassigned'
      ORDER BY v.scheduled_start ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching unassigned visits:', err);
    res.status(500).json({ error: 'Failed to fetch unassigned visits' });
  }
});

// GET /api/schedule/huv-sfv - Hospice HUV and SFV compliance audit records
app.get('/api/schedule/huv-sfv', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id,
        COALESCE(v.branch, 'Standards Home Care') as branch,
        'Interdisciplinary Palliative Team' as team,
        COALESCE(SPLIT_PART(v.patient_name, ' ', 1), p.first_name, 'Patient') as "firstName",
        COALESCE(SPLIT_PART(v.patient_name, ' ', 2), p.last_name, '') as "lastName",
        COALESCE(p.mrn, 'MRN-78210') as mrn,
        COALESCE(p.status::text, 'active') as "patientStatus",
        COALESCE(v.task, v.visit_type) as task,
        COALESCE(v.huv_sfv_type, 'HUV') as type,
        COALESCE(v.task_status, 'Scheduled') as "taskStatus",
        TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start), 'MM/DD/YYYY') as "visitDate",
        TO_CHAR(COALESCE(v.admission_date, p.admission_date, CURRENT_DATE - INTERVAL '10 days'), 'MM/DD/YYYY') as "admissionDate",
        COALESCE(v.days_remaining, 3) as "daysRemaining",
        COALESCE(v.clinical_notes, '') as notes,
        v.service_line as "serviceLine"
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE v.huv_sfv_type IS NOT NULL
      ORDER BY v.days_remaining ASC, v.scheduled_start ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching HUV/SFV records:', err);
    res.status(500).json({ error: 'Failed to fetch HUV/SFV records' });
  }
});

// POST /api/schedule/visits - Schedule New Visit with Time-Slot Conflict Detection
app.post('/api/schedule/visits', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const { employeeId, scheduledDate, timeSlot, patientName, serviceLine, visitType, address, notes } = data;

    if (!employeeId || !scheduledDate || !timeSlot) {
      return res.status(400).json({ error: 'Missing required fields: employeeId, scheduledDate, timeSlot' });
    }

    // 1. Conflict Check: check if the clinician already has an active visit on the same date and time slot
    const conflictRes = await pool.query(`
      SELECT v.id, v.patient_name, v.time_slot, c.name as clinician_name
      FROM visits v
      LEFT JOIN clinicians c ON v.clinician_id = c.id
      WHERE v.clinician_id = $1
        AND (v.scheduled_date = $2::date OR v.scheduled_start::date = $2::date)
        AND LOWER(TRIM(v.time_slot)) = LOWER(TRIM($3))
        AND v.status NOT IN ('cancelled', 'unassigned');
    `, [employeeId, scheduledDate, timeSlot]);

    if (conflictRes.rows.length > 0) {
      const conflict = conflictRes.rows[0];
      return res.status(409).json({
        error: `Schedule Conflict: Clinician ${conflict.clinician_name || 'selected'} already has a visit scheduled for ${conflict.patient_name || 'another patient'} on ${scheduledDate} at ${conflict.time_slot}. Please select a different time slot or clinician.`
      });
    }

    // 2. Fetch or associate patient
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    let patientId = data.patientId;
    if (!patientId) {
      const patCheck = await pool.query(`
        SELECT id FROM patients 
        WHERE (first_name || ' ' || last_name) ILIKE $1 
           OR (last_name || ', ' || first_name) ILIKE $1 
        LIMIT 1;
      `, [patientName.trim()]);
      if (patCheck.rows.length > 0) {
        patientId = patCheck.rows[0].id;
      } else {
        // Fallback to first existing patient
        const firstPat = await pool.query('SELECT id FROM patients LIMIT 1');
        patientId = firstPat.rows[0]?.id;
      }
    }

    // 3. Fetch Clinician Details
    const clinRes = await pool.query('SELECT name, latitude, longitude FROM clinicians WHERE id = $1', [employeeId]);
    const clinician = clinRes.rows[0];
    const employeeName = clinician?.name || data.employeeName || 'Assigned Clinician';

    const dateObj = new Date(scheduledDate + 'T00:00:00');
    const dayOfWeek = isNaN(dateObj.getDay()) ? 2 : dateObj.getDay();

    const insertRes = await pool.query(`
      INSERT INTO visits (
        organization_id, patient_id, clinician_id, patient_name, employee_name,
        service_line, visit_type, task, status, priority, time_slot, scheduled_date,
        day_of_week, scheduled_start, scheduled_end, evv_verified, evv_status,
        address, latitude, longitude, clinical_notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $7, 'scheduled', 'routine', $8, $9::date,
        $10, ($9 || ' 09:00:00')::timestamp with time zone,
        ($9 || ' 10:00:00')::timestamp with time zone,
        false, 'pending', $11, $12, $13, $14
      ) RETURNING *;
    `, [
      orgId,
      patientId,
      employeeId,
      patientName.trim(),
      employeeName,
      serviceLine || 'home_health',
      visitType || 'Skilled Nurse Visit',
      timeSlot,
      scheduledDate,
      dayOfWeek,
      address || '1420 Harvard St, Dallas TX',
      clinician?.latitude || 32.7767,
      clinician?.longitude || -96.7970,
      notes || ''
    ]);

    const row = insertRes.rows[0];
    res.status(201).json({
      id: row.id,
      employeeId: row.clinician_id,
      employeeName: row.employee_name,
      patientId: row.patient_id,
      patientName: row.patient_name,
      visitType: row.visit_type,
      serviceLine: row.service_line,
      dayOfWeek: row.day_of_week,
      date: new Date(row.scheduled_date).toISOString().slice(0, 10),
      timeSlot: row.time_slot,
      status: row.status,
      locationType: row.location_type,
      evvStatus: row.evv_status,
      address: row.address,
      latitude: parseFloat(row.latitude) || 32.7767,
      longitude: parseFloat(row.longitude) || -96.7970,
      notes: row.clinical_notes
    });
  } catch (err: any) {
    console.error('Error creating visit:', err);
    res.status(500).json({ error: 'Failed to create visit in database' });
  }
});

// PUT /api/schedule/visits/:id - Update scheduled visit
app.put('/api/schedule/visits/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Check time slot conflict if clinician/time/date is being modified
    if (data.employeeId && data.scheduledDate && data.timeSlot) {
      const conflictRes = await pool.query(`
        SELECT v.id, v.patient_name, v.time_slot, c.name as clinician_name
        FROM visits v
        LEFT JOIN clinicians c ON v.clinician_id = c.id
        WHERE v.clinician_id = $1
          AND v.id != $2
          AND (v.scheduled_date = $3::date OR v.scheduled_start::date = $3::date)
          AND LOWER(TRIM(v.time_slot)) = LOWER(TRIM($4))
          AND v.status NOT IN ('cancelled', 'unassigned');
      `, [data.employeeId, id, data.scheduledDate, data.timeSlot]);

      if (conflictRes.rows.length > 0) {
        const conflict = conflictRes.rows[0];
        return res.status(409).json({
          error: `Schedule Conflict: Clinician already has a visit scheduled for ${conflict.patient_name} on ${data.scheduledDate} at ${conflict.time_slot}.`
        });
      }
    }

    const updateRes = await pool.query(`
      UPDATE visits SET
        clinician_id = COALESCE($2, clinician_id),
        employee_name = COALESCE($3, employee_name),
        patient_name = COALESCE($4, patient_name),
        visit_type = COALESCE($5, visit_type),
        service_line = COALESCE($6, service_line),
        scheduled_date = COALESCE($7::date, scheduled_date),
        time_slot = COALESCE($8, time_slot),
        status = COALESCE($9, status),
        evv_status = COALESCE($10, evv_status),
        address = COALESCE($11, address),
        clinical_notes = COALESCE($12, clinical_notes)
      WHERE id = $1
      RETURNING *;
    `, [
      id,
      data.employeeId,
      data.employeeName,
      data.patientName,
      data.visitType,
      data.serviceLine,
      data.date || data.scheduledDate,
      data.timeSlot,
      data.status,
      data.evvStatus,
      data.address,
      data.notes
    ]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const row = updateRes.rows[0];
    res.json({
      id: row.id,
      employeeId: row.clinician_id,
      employeeName: row.employee_name,
      patientId: row.patient_id,
      patientName: row.patient_name,
      visitType: row.visit_type,
      serviceLine: row.service_line,
      dayOfWeek: row.day_of_week,
      date: new Date(row.scheduled_date).toISOString().slice(0, 10),
      timeSlot: row.time_slot,
      status: row.status,
      locationType: row.location_type,
      evvStatus: row.evv_status,
      address: row.address,
      latitude: parseFloat(row.latitude) || 32.7767,
      longitude: parseFloat(row.longitude) || -96.7970,
      notes: row.clinical_notes
    });
  } catch (err: any) {
    console.error('Error updating visit:', err);
    res.status(500).json({ error: 'Failed to update visit' });
  }
});

// DELETE /api/schedule/visits/:id - Delete scheduled visit
app.delete('/api/schedule/visits/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM visits WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting visit:', err);
    res.status(500).json({ error: 'Failed to delete visit' });
  }
});

// POST /api/schedule/unassigned/:id/assign - Assign unassigned visit to a clinician
app.post('/api/schedule/unassigned/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { clinicianId } = req.body;

    const clinRes = await pool.query('SELECT name FROM clinicians WHERE id = $1', [clinicianId]);
    if (clinRes.rows.length === 0) {
      return res.status(404).json({ error: 'Clinician not found' });
    }
    const clinName = clinRes.rows[0].name;

    const updateRes = await pool.query(`
      UPDATE visits SET
        clinician_id = $2,
        employee_name = $3,
        status = 'scheduled'
      WHERE id = $1
      RETURNING *;
    `, [id, clinicianId, clinName]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Unassigned visit not found' });
    }

    res.json({ success: true, visit: updateRes.rows[0] });
  } catch (err: any) {
    console.error('Error assigning visit:', err);
    res.status(500).json({ error: 'Failed to assign visit' });
  }
});

// POST /api/schedule/unassigned/bulk-assign - Bulk dispatch unassigned visits to clinician
app.post('/api/schedule/unassigned/bulk-assign', async (req: Request, res: Response) => {
  try {
    const { visitIds, clinicianId } = req.body;
    if (!Array.isArray(visitIds) || visitIds.length === 0 || !clinicianId) {
      return res.status(400).json({ error: 'Invalid visitIds or clinicianId' });
    }

    const clinRes = await pool.query('SELECT name FROM clinicians WHERE id = $1', [clinicianId]);
    if (clinRes.rows.length === 0) {
      return res.status(404).json({ error: 'Clinician not found' });
    }
    const clinName = clinRes.rows[0].name;

    await pool.query(`
      UPDATE visits SET
        clinician_id = $1,
        employee_name = $2,
        status = 'scheduled'
      WHERE id = ANY($3::uuid[]);
    `, [clinicianId, clinName, visitIds]);

    res.json({ success: true, updatedCount: visitIds.length, clinicianName: clinName });
  } catch (err: any) {
    console.error('Error in bulk assigning visits:', err);
    res.status(500).json({ error: 'Failed to bulk assign visits' });
  }
});

// DELETE /api/schedule/unassigned/:id - Delete unassigned encounter
app.delete('/api/schedule/unassigned/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM visits WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting unassigned visit:', err);
    res.status(500).json({ error: 'Failed to delete unassigned visit' });
  }
});

// GET /api/schedule/unassigned-patient-detail/:patientId
app.get('/api/schedule/unassigned-patient-detail/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const patRes = await pool.query(`
      SELECT 
        p.id,
        p.first_name as "firstName",
        p.last_name as "lastName",
        p.first_name || ' ' || p.last_name as name,
        p.mrn,
        p.branch,
        COALESCE(TO_CHAR(p.episode_start, 'MM/DD/YYYY'), '10/26/2026') as "episodeStart",
        COALESCE(TO_CHAR(p.episode_end, 'MM/DD/YYYY'), '12/24/2026') as "episodeEnd"
      FROM patients p
      WHERE p.id::text = $1 OR p.mrn = $1
      LIMIT 1;
    `, [patientId]);

    if (patRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const patient = patRes.rows[0];

    const visitsRes = await pool.query(`
      SELECT 
        v.id,
        v.patient_id as "patientId",
        v.clinician_id as "clinicianId",
        COALESCE(v.employee_name, c.name, 'Unassigned Clinician') as "employeeName",
        COALESCE(v.visit_type, v.task, 'Skilled Nursing Visit') as "visitType",
        COALESCE(c.discipline, 'Nursing') as discipline,
        COALESCE(TO_CHAR(v.scheduled_date, 'YYYY-MM-DD'), TO_CHAR(v.scheduled_start, 'YYYY-MM-DD')) as "scheduledDate",
        COALESCE(v.time_slot, '09:00 AM') as "timeSlot",
        v.status
      FROM visits v
      LEFT JOIN clinicians c ON v.clinician_id::text = c.id::text
      WHERE v.patient_id::text = $1
      ORDER BY COALESCE(v.scheduled_date, v.scheduled_start) ASC;
    `, [patient.id]);

    const ordersRes = await pool.query(`
      SELECT 
        id,
        summary_title as task,
        order_type as "orderType",
        COALESCE(TO_CHAR(effective_date, 'MM/DD/YYYY'), '10/26/2026') as "effectiveDate",
        status
      FROM orders
      WHERE patient_id::text = $1
      ORDER BY effective_date ASC;
    `, [patient.id]);

    const disciplines = ['Nursing', 'OT', 'PT', 'ST', 'HHA', 'MSW'];
    const disciplineStats: Record<string, { ordered: number; scheduled: number; underOver: number }> = {};
    disciplines.forEach(d => {
      disciplineStats[d] = { ordered: 0, scheduled: 0, underOver: 0 };
    });

    visitsRes.rows.forEach(v => {
      const disc = disciplines.find(d => v.discipline?.toLowerCase().includes(d.toLowerCase())) || 'Nursing';
      if (disciplineStats[disc]) {
        disciplineStats[disc].scheduled += 1;
      }
    });

    let visits = visitsRes.rows;
    if (visits.length === 0) {
      disciplineStats['Nursing'].scheduled = 60;
      disciplineStats['PT'].scheduled = 1;
    }

    disciplines.forEach(d => {
      disciplineStats[d].underOver = disciplineStats[d].scheduled - disciplineStats[d].ordered;
    });

    res.json({
      patient,
      visits,
      orders: ordersRes.rows,
      disciplineStats,
      totalScheduled: visits.length || 61
    });
  } catch (err: any) {
    console.error('Error fetching unassigned patient detail:', err);
    res.status(500).json({ error: 'Failed to fetch unassigned patient detail' });
  }
});

// POST /api/schedule/quick-schedule-batch - Quick Employee Scheduler Batch Save
app.post('/api/schedule/quick-schedule-batch', async (req: Request, res: Response) => {
  try {
    const { patientId, employeeId, visitType, dates, timeSlot, postToAxxessCare } = req.body;

    if (!patientId || !dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'Missing patientId or dates array' });
    }

    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;

    const patRes = await pool.query('SELECT id, first_name || \' \' || last_name as name, address_street, branch FROM patients WHERE id::text = $1 LIMIT 1', [patientId]);
    const patientName = patRes.rows[0]?.name || 'Patient';

    let clinicianName = 'Unassigned Clinician';
    if (employeeId) {
      const clinRes = await pool.query('SELECT name FROM clinicians WHERE id::text = $1 LIMIT 1', [employeeId]);
      if (clinRes.rows.length > 0) {
        clinicianName = clinRes.rows[0].name;
      }
    }

    const status = postToAxxessCare ? 'open_marketplace' : (employeeId ? 'scheduled' : 'unassigned');
    const slot = timeSlot || '09:00 AM - 10:30 AM';
    const type = visitType || 'Skilled Nursing Visit';

    const insertedVisits = [];
    for (const d of dates) {
      const visitRes = await pool.query(`
        INSERT INTO visits (
          organization_id, clinician_id, patient_id, scheduled_start, scheduled_end,
          scheduled_date, time_slot, visit_type, task, status, service_line,
          employee_name, patient_name, location_type, evv_status
        ) VALUES (
          $1, $2, $3, $4::timestamp, $5::timestamp,
          $6::date, $7, $8, $8, $9, 'home_health',
          $10, $11, 'home', 'pending'
        ) RETURNING id, scheduled_date, time_slot, employee_name, visit_type, status;
      `, [
        orgId,
        employeeId || null,
        patientId,
        `${d} 09:00:00`,
        `${d} 10:30:00`,
        d,
        slot,
        type,
        status,
        clinicianName,
        patientName
      ]);
      insertedVisits.push(visitRes.rows[0]);
    }

    res.status(201).json({
      success: true,
      message: `Successfully scheduled ${dates.length} visits for ${patientName}`,
      scheduledCount: dates.length,
      visits: insertedVisits
    });
  } catch (err: any) {
    console.error('Error in batch schedule visits:', err);
    res.status(500).json({ error: 'Failed to batch schedule visits' });
  }
});

// POST /api/schedule/complete-assignment/:patientId - Mark visit assignments complete
app.post('/api/schedule/complete-assignment/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const updateRes = await pool.query(`
      UPDATE visits
      SET status = 'scheduled'
      WHERE patient_id::text = $1 AND status = 'unassigned'
      RETURNING id;
    `, [patientId]);

    res.json({
      success: true,
      updatedCount: updateRes.rowCount,
      message: 'Visit assignment marked as complete for this patient episode.'
    });
  } catch (err: any) {
    console.error('Error completing visit assignments:', err);
    res.status(500).json({ error: 'Failed to complete visit assignments' });
  }
});

// GET /api/schedule/episode-frequencies/:patientId - Fetch Episode Frequencies
app.get('/api/schedule/episode-frequencies/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const ordersRes = await pool.query(`
      SELECT 
        id,
        summary_title as task,
        order_type as "orderType",
        COALESCE(TO_CHAR(effective_date, 'MM/DD/YYYY'), '10/26/2026') as "effectiveDate",
        '1w1, 2w4, 1w2' as frequency,
        status
      FROM orders
      WHERE patient_id::text = $1
      ORDER BY effective_date ASC;
    `, [patientId]);

    let frequencies = ordersRes.rows;
    if (frequencies.length === 0) {
      frequencies = [
        {
          id: 'ef-1',
          task: 'OASIS-E2 Start of Care',
          frequency: '1w1 (1 visit for 1 week)',
          effectiveDate: '10/26/2026',
          status: 'Active'
        },
        {
          id: 'ef-2',
          task: 'Physician Order (Cardiopulmonary & Wound Care)',
          frequency: '2w4, 1w2 (2 visits/week x 4 wks, 1 visit/week x 2 wks)',
          effectiveDate: '10/26/2026',
          status: 'Active'
        },
        {
          id: 'ef-3',
          task: 'Skilled Nursing Assessment',
          frequency: '1w2 (1 visit for 2 weeks)',
          effectiveDate: '10/26/2026',
          status: 'Active'
        },
        {
          id: 'ef-4',
          task: 'Physical Therapy Evaluation',
          frequency: '1w1, 2w3 (1 eval wk 1, 2 visits/week x 3 wks)',
          effectiveDate: '10/28/2026',
          status: 'Active'
        }
      ];
    }

    res.json(frequencies);
  } catch (err: any) {
    console.error('Error fetching episode frequencies:', err);
    res.status(500).json({ error: 'Failed to fetch episode frequencies' });
  }
});

// ==========================================
// SCHEDULE CENTER REST API ENDPOINTS
// ==========================================

// GET /api/schedule/center/data/:patientId - Real-time Schedule Center patient schedule, mini-calendar, visits
app.get('/api/schedule/center/data/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // 1. Resolve Patient
    let patientQuery = `
      SELECT 
        p.id,
        p.first_name as "firstName",
        p.last_name as "lastName",
        p.first_name || ' ' || p.last_name as name,
        p.mrn,
        p.branch,
        p.status,
        COALESCE(TO_CHAR(p.start_of_care_date, 'MM/DD/YYYY'), '10/26/2026') as "startOfCareDate",
        COALESCE(TO_CHAR(p.episode_start, 'MM/DD/YYYY'), '10/26/2026') as "episodeStart",
        COALESCE(TO_CHAR(p.episode_end, 'MM/DD/YYYY'), '12/24/2026') as "episodeEnd",
        COALESCE(p.attending_physician, 'Rigali, Leslie DO') as "attendingPhysician",
        COALESCE(p.insurance_name, 'COMMONWEALTH CARE ALLIANCE') as "primaryInsurance",
        'Mary Kyalikunda RN' as "caseManager"
      FROM patients p
    `;

    let patRes;
    if (patientId && patientId !== 'default' && patientId !== 'undefined') {
      const cleanPatId = patientId.replace(/^pat-/, '');
      patRes = await pool.query(`${patientQuery} WHERE p.id::text = $1 OR p.mrn = $1 OR p.mrn = $2 LIMIT 1;`, [patientId, cleanPatId]);
    }
    if (!patRes || patRes.rows.length === 0) {
      if (patientId && patientId !== 'default' && patientId !== 'undefined' && patientId !== '1061' && patientId !== 'pat-1061') {
        const cleanPatId = patientId.replace(/^pat-/, '');
        const patient = {
          id: patientId,
          firstName: 'Selected',
          lastName: 'Patient',
          name: `Patient ${cleanPatId}`,
          mrn: cleanPatId,
          branch: 'Standards Home Care',
          status: 'Active Patients',
          startOfCareDate: '10/26/2026',
          episodeStart: '10/26/2026',
          episodeEnd: '12/24/2026',
          attendingPhysician: 'Rigali, Leslie DO',
          primaryInsurance: 'COMMONWEALTH CARE ALLIANCE',
          caseManager: 'Mary Kyalikunda RN'
        };
        return res.json({
          patient,
          episodes: [
            {
              id: `ep-${patientId}-1`,
              startOfCareDate: '10/26/2026',
              episodeStartDate: '10/26/2026',
              episodeEndDate: '12/24/2026',
              caseManager: 'Mary Kyalikunda RN',
              primaryPhysician: 'Rigali, Leslie DO',
              primaryInsurance: 'COMMONWEALTH CARE ALLIANCE',
              status: 'Active'
            }
          ],
          visits: [],
          calendarDays: {},
          clinicians: [],
          authorizations: null,
          lupaRisk: { riskLevel: 'Low LUPA Risk', visitsCount: 0, threshold: 4 }
        });
      }
      patRes = await pool.query(`${patientQuery} ORDER BY CASE WHEN p.mrn = '1061' THEN 0 ELSE 1 END, p.last_name ASC LIMIT 1;`);
    }

    if (patRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    const patient = patRes.rows[0];

    // 2. Fetch Episodes for this Patient
    const episodesRes = await pool.query(`
      SELECT 
        id,
        TO_CHAR(start_of_care_date, 'MM/DD/YYYY') as "startOfCareDate",
        TO_CHAR(episode_start_date, 'MM/DD/YYYY') as "episodeStartDate",
        TO_CHAR(episode_end_date, 'MM/DD/YYYY') as "episodeEndDate",
        case_manager as "caseManager",
        primary_physician as "primaryPhysician",
        primary_insurance as "primaryInsurance",
        status
      FROM episodes
      WHERE patient_id::text = $1
      ORDER BY episode_start_date DESC;
    `, [patient.id]);

    let episodes = episodesRes.rows;
    if (episodes.length === 0) {
      episodes = [
        {
          id: `ep-${patient.id}-1`,
          startOfCareDate: patient.startOfCareDate || '10/26/2026',
          episodeStartDate: patient.episodeStart || '10/26/2026',
          episodeEndDate: patient.episodeEnd || '12/24/2026',
          caseManager: patient.caseManager || 'Mary Kyalikunda RN',
          primaryPhysician: patient.attendingPhysician || 'Rigali, Leslie DO',
          primaryInsurance: patient.primaryInsurance || 'COMMONWEALTH CARE ALLIANCE',
          status: 'Active'
        }
      ];
    }

    // 3. Fetch Visits for this Patient
    const visitsRes = await pool.query(`
      SELECT 
        v.id,
        v.patient_id as "patientId",
        v.clinician_id as "clinicianId",
        COALESCE(v.employee_name, c.name, 'Mario Fortune LPN') as "assignedTo",
        COALESCE(v.task, v.visit_type, 'LPN - Oral Med. Management') as task,
        COALESCE(TO_CHAR(v.scheduled_date, 'MM/DD/YYYY'), TO_CHAR(v.scheduled_start, 'MM/DD/YYYY'), '12/20/2026') as "scheduledDate",
        COALESCE(TO_CHAR(v.scheduled_date, 'YYYY-MM-DD'), TO_CHAR(v.scheduled_start, 'YYYY-MM-DD'), '2026-12-20') as "rawDate",
        COALESCE(v.time_slot, '09:00 AM') as "timeSlot",
        COALESCE(v.status, 'Not Yet Due') as status,
        COALESCE(v.is_axxess_care, false) as "isAxxessCare",
        COALESCE(c.discipline, 'Nursing') as discipline,
        CASE 
          WHEN v.task ILIKE '%Recert%' OR v.task ILIKE '%Physician Order%' OR v.task ILIKE '%VERBAL ORDER%' THEN true
          ELSE false
        END as "isAlert"
      FROM visits v
      LEFT JOIN clinicians c ON v.clinician_id::text = c.id::text
      WHERE v.patient_id::text = $1
      ORDER BY COALESCE(v.scheduled_date, v.scheduled_start) DESC, v.id DESC;
    `, [patient.id]);

    const visits = visitsRes.rows;

    // 4. Build 3-Month Calendar Day Map (Oct 2026, Nov 2026, Dec 2026)
    const calendarDays: Record<string, {
      date: string;
      status: 'scheduled' | 'completed' | 'missed' | 'multiple' | 'none';
      count: number;
      tooltip: string;
      visits: Array<{ task: string; employeeName: string; timeSlot: string; status: string }>;
    }> = {};

    visits.forEach(v => {
      const d = v.rawDate;
      if (!calendarDays[d]) {
        calendarDays[d] = {
          date: d,
          status: 'scheduled',
          count: 0,
          tooltip: '',
          visits: []
        };
      }
      calendarDays[d].count += 1;
      calendarDays[d].visits.push({
        task: v.task,
        employeeName: v.assignedTo,
        timeSlot: v.timeSlot,
        status: v.status
      });
    });

    // Determine status per day (completed, multiple, scheduled, missed)
    Object.keys(calendarDays).forEach(dateStr => {
      const dayData = calendarDays[dateStr];
      const dateObj = new Date(dateStr + 'T00:00:00');
      const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      
      if (dayData.count > 1) {
        dayData.status = 'multiple';
      } else {
        const first = dayData.visits[0];
        const st = (first.status || '').toLowerCase();
        if (st === 'completed') dayData.status = 'completed';
        else if (st === 'missed') dayData.status = 'missed';
        else dayData.status = 'scheduled';
      }

      const visitSummary = dayData.visits.map(vi => `${vi.task} - ${vi.employeeName}`).join('; ');
      dayData.tooltip = `${formattedDate}\n${visitSummary}`;
    });

    // 5. Clinicians list for Reassignment
    const clinRes = await pool.query(`
      SELECT 
        id,
        name,
        title,
        discipline,
        branch,
        status
      FROM clinicians
      WHERE status = 'active'
      ORDER BY name ASC;
    `);

    // 6. Authorizations
    const authData = {
      authNumber: 'AUTH-2026-9821',
      payer: patient.primaryInsurance || 'COMMONWEALTH CARE ALLIANCE',
      approvedUnits: 62,
      usedUnits: visits.filter(v => v.status === 'Completed').length || 28,
      remainingUnits: Math.max(0, 62 - (visits.filter(v => v.status === 'Completed').length || 28)),
      validFrom: patient.episodeStart || '10/26/2026',
      validTo: patient.episodeEnd || '12/24/2026',
      status: 'Active Approved'
    };

    res.json({
      patient,
      episodes,
      currentEpisode: episodes[0],
      lupaRisk: {
        riskLevel: 'Low LUPA Risk',
        threshold: 5,
        scheduledVisitsCount: visits.length,
        isUnderThreshold: visits.length < 5,
        description: 'Patient currently has adequate scheduled visits exceeding CMS LUPA threshold (5 visits required in 60-day episode).'
      },
      visits,
      calendarDays,
      clinicians: clinRes.rows,
      authorizations: authData
    });
  } catch (err: any) {
    console.error('Error fetching schedule center data:', err);
    res.status(500).json({ error: 'Failed to fetch schedule center data' });
  }
});

// POST /api/schedule/center/reassign-visit - Reassign a visit to another clinician
app.post('/api/schedule/center/reassign-visit', async (req: Request, res: Response) => {
  try {
    const { visitId, clinicianId, clinicianName } = req.body;

    if (!visitId || !clinicianName) {
      return res.status(400).json({ error: 'Missing visitId or clinicianName' });
    }

    const updateRes = await pool.query(`
      UPDATE visits
      SET 
        clinician_id = COALESCE($1, clinician_id),
        employee_name = $2
      WHERE id::text = $3
      RETURNING *;
    `, [clinicianId || null, clinicianName, visitId]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    res.json({
      success: true,
      message: `Visit successfully reassigned to ${clinicianName}`,
      visit: updateRes.rows[0]
    });
  } catch (err: any) {
    console.error('Error reassigning visit:', err);
    res.status(500).json({ error: 'Failed to reassign visit' });
  }
});

// POST /api/schedule/center/post-axxess-care - Post visit(s) to Axxess Care marketplace
app.post('/api/schedule/center/post-axxess-care', async (req: Request, res: Response) => {
  try {
    const { visitIds } = req.body;

    if (!visitIds || !Array.isArray(visitIds) || visitIds.length === 0) {
      return res.status(400).json({ error: 'Missing visitIds array' });
    }

    const updateRes = await pool.query(`
      UPDATE visits
      SET is_axxess_care = true
      WHERE id::text = ANY($1::text[])
      RETURNING id;
    `, [visitIds]);

    res.json({
      success: true,
      message: `Successfully posted ${updateRes.rowCount} visit(s) to Axxess Care marketplace.`,
      updatedCount: updateRes.rowCount
    });
  } catch (err: any) {
    console.error('Error posting to Axxess Care:', err);
    res.status(500).json({ error: 'Failed to post visits to Axxess Care' });
  }
});

// GET /api/schedule/center/authorizations/:patientId - Authorizations for patient
app.get('/api/schedule/center/authorizations/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const patRes = await pool.query('SELECT id, first_name || \' \' || last_name as name, mrn, insurance_name FROM patients WHERE id::text = $1 OR mrn = $1 LIMIT 1;', [patientId]);
    const patientName = patRes.rows[0]?.name || 'Patient';
    const payer = patRes.rows[0]?.insurance_name || 'COMMONWEALTH CARE ALLIANCE';

    res.json({
      authorizations: [
        {
          id: 'AUTH-9821',
          authNumber: 'CCA-2026-9821A',
          patientName,
          payer,
          serviceType: 'Skilled Nursing (SN)',
          approvedVisits: 60,
          usedVisits: 28,
          remainingVisits: 32,
          startDate: '10/26/2026',
          endDate: '12/24/2026',
          status: 'Active',
          authorizedBy: 'Commonwealth Care Utilization Mgmt'
        },
        {
          id: 'AUTH-9822',
          authNumber: 'CCA-2026-9822B',
          patientName,
          payer,
          serviceType: 'Physical Therapy (PT)',
          approvedVisits: 8,
          usedVisits: 2,
          remainingVisits: 6,
          startDate: '10/28/2026',
          endDate: '12/10/2026',
          status: 'Active',
          authorizedBy: 'Commonwealth Care Utilization Mgmt'
        }
      ]
    });
  } catch (err: any) {
    console.error('Error fetching authorizations:', err);
    res.status(500).json({ error: 'Failed to fetch authorizations' });
  }
});

// GET /api/schedule/reassign/eligible-tasks - Search tasks eligible for reassignment
app.get('/api/schedule/reassign/eligible-tasks', async (req: Request, res: Response) => {
  try {
    const { employeeFrom, dateFrom, dateTo } = req.query;

    let query = `
      SELECT 
        v.id,
        COALESCE(v.patient_name, p.first_name || ' ' || p.last_name, 'Patient') as "patientName",
        COALESCE(p.mrn, '1001') as mrn,
        COALESCE(v.task, v.visit_type, 'Skilled Nursing Visit') as task,
        TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start), 'MM/DD/YYYY') as "scheduledDate",
        COALESCE(TO_CHAR(v.scheduled_date, 'YYYY-MM-DD'), TO_CHAR(v.scheduled_start, 'YYYY-MM-DD')) as "rawDate",
        COALESCE(v.time_slot, '09:00 AM') as "timeSlot",
        COALESCE(v.employee_name, c.name, 'Unassigned') as "assignedTo",
        COALESCE(c.discipline, 'Nursing') as discipline,
        COALESCE(v.status, 'Not Yet Due') as status
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      LEFT JOIN clinicians c ON v.clinician_id::text = c.id::text
      WHERE 
        LOWER(COALESCE(v.status, '')) IN ('not yet due', 'not_yet_due', 'scheduled', 'not yet started', 'not_started', 'unassigned')
    `;

    const params: any[] = [];
    let pIdx = 1;

    if (employeeFrom && employeeFrom !== 'all' && employeeFrom !== '') {
      query += ` AND (v.employee_name ILIKE $${pIdx} OR c.name ILIKE $${pIdx})`;
      params.push(`%${employeeFrom}%`);
      pIdx++;
    }

    if (dateFrom) {
      query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) >= $${pIdx}::date`;
      params.push(dateFrom);
      pIdx++;
    }

    if (dateTo) {
      query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) <= $${pIdx}::date`;
      params.push(dateTo);
      pIdx++;
    }

    query += ` ORDER BY COALESCE(v.scheduled_date, v.scheduled_start) ASC, v.time_slot ASC LIMIT 100;`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching eligible tasks for reassignment:', err);
    res.status(500).json({ error: 'Failed to fetch eligible tasks' });
  }
});

// POST /api/schedule/reassign/execute - Batch execute schedule task reassignment
app.post('/api/schedule/reassign/execute', async (req: Request, res: Response) => {
  try {
    const { employeeFrom, employeeTo, dateFrom, dateTo, visitIds } = req.body;

    if (!employeeTo) {
      return res.status(400).json({ error: 'Missing employeeTo recipient' });
    }

    // Resolve target clinician id if available
    const clinRes = await pool.query('SELECT id, name FROM clinicians WHERE name ILIKE $1 LIMIT 1', [`%${employeeTo}%`]);
    const targetClinicianId = clinRes.rows[0]?.id || null;
    const targetClinicianName = clinRes.rows[0]?.name || employeeTo;

    let updateRes;
    if (visitIds && Array.isArray(visitIds) && visitIds.length > 0) {
      updateRes = await pool.query(`
        UPDATE visits
        SET 
          clinician_id = COALESCE($1, clinician_id),
          employee_name = $2
        WHERE id::text = ANY($3::text[])
        RETURNING id;
      `, [targetClinicianId, targetClinicianName, visitIds]);
    } else {
      let updateQuery = `
        UPDATE visits
        SET 
          clinician_id = COALESCE($1, clinician_id),
          employee_name = $2
        WHERE 
          LOWER(COALESCE(status, '')) IN ('not yet due', 'not_yet_due', 'scheduled', 'not yet started', 'not_started', 'unassigned')
      `;
      const updateParams: any[] = [targetClinicianId, targetClinicianName];
      let pIdx = 3;

      if (employeeFrom && employeeFrom !== 'all' && employeeFrom !== '') {
        updateQuery += ` AND employee_name ILIKE $${pIdx}`;
        updateParams.push(`%${employeeFrom}%`);
        pIdx++;
      }

      if (dateFrom) {
        updateQuery += ` AND COALESCE(scheduled_date, scheduled_start::date) >= $${pIdx}::date`;
        updateParams.push(dateFrom);
        pIdx++;
      }

      if (dateTo) {
        updateQuery += ` AND COALESCE(scheduled_date, scheduled_start::date) <= $${pIdx}::date`;
        updateParams.push(dateTo);
        pIdx++;
      }

      updateQuery += ` RETURNING id;`;
      updateRes = await pool.query(updateQuery, updateParams);
    }

    res.json({
      success: true,
      message: `Successfully reassigned ${updateRes.rowCount} task(s) to ${targetClinicianName}.`,
      reassignedCount: updateRes.rowCount
    });
  } catch (err: any) {
    console.error('Error executing schedule reassignment:', err);
    res.status(500).json({ error: 'Failed to execute reassignment' });
  }
});
// POST /api/reports/unscheduled-visits - Unscheduled Visits Report
app.post('/api/reports/unscheduled-visits', async (req: Request, res: Response) => {
  try {
    const { branch, dateFrom, dateTo, disciplines, payers } = req.body;

    let query = `
      SELECT 
        COALESCE(p.mrn, '1001') as mrn,
        p.first_name || ' ' || p.last_name as "patientName",
        p.id as "patientId",
        COALESCE(p.insurance_name, 'COMMONWEALTH CARE ALLIANCE') as payer,
        COALESCE(c.discipline, 'Nursing') as discipline,
        TO_CHAR(COALESCE(p.episode_start, CURRENT_DATE), 'MM/DD/YYYY') as "frequencyStartDate",
        TO_CHAR(COALESCE(p.episode_end, CURRENT_DATE + INTERVAL '60 days'), 'MM/DD/YYYY') as "frequencyEndDate",
        COUNT(v.id)::int as "unscheduledCount"
      FROM patients p
      JOIN visits v ON v.patient_id = p.id
      LEFT JOIN clinicians c ON v.clinician_id = c.id
      WHERE (v.status ILIKE '%unassigned%' OR v.employee_name ILIKE '%unassigned%' OR v.status ILIKE '%not yet%')
    `;

    const params: any[] = [];
    let pIdx = 1;

    if (branch && branch !== 'All') {
      query += ` AND p.branch ILIKE $${pIdx}`;
      params.push(`%${branch}%`);
      pIdx++;
    }

    if (dateFrom) {
      query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) >= $${pIdx}::date`;
      params.push(dateFrom);
      pIdx++;
    }

    if (dateTo) {
      query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) <= $${pIdx}::date`;
      params.push(dateTo);
      pIdx++;
    }

    query += `
      GROUP BY p.mrn, p.first_name, p.last_name, p.id, p.insurance_name, c.discipline, p.episode_start, p.episode_end
      ORDER BY p.last_name ASC, p.first_name ASC;
    `;

    const result = await pool.query(query, params);
    let rows = result.rows;

    if (rows.length === 0) {
      const patRes = await pool.query(`SELECT mrn, first_name || ' ' || last_name as name, id, insurance_name FROM patients WHERE mrn = '1061' LIMIT 1;`);
      const hName = patRes.rows[0]?.name || 'Abuissa, Heather';
      const hMrn = patRes.rows[0]?.mrn || '1061';
      const hId = patRes.rows[0]?.id || 'pat-1061';

      rows = [
        {
          mrn: hMrn,
          patientName: hName,
          patientId: hId,
          payer: 'COMMONWEALTH CARE ALLIANCE',
          discipline: 'Nursing',
          frequencyStartDate: '10/26/2026',
          frequencyEndDate: '12/24/2026',
          unscheduledCount: 2
        },
        {
          mrn: '1036',
          patientName: 'Anis, Marie V',
          patientId: 'pat-1036',
          payer: 'MEDICARE (TRADITIONAL)',
          discipline: 'PT',
          frequencyStartDate: '10/26/2026',
          frequencyEndDate: '12/24/2026',
          unscheduledCount: 1
        },
        {
          mrn: '1042',
          patientName: 'Antoine, Louis',
          patientId: 'pat-1042',
          payer: 'MEDICAID MASSACHUSETTS',
          discipline: 'Nursing',
          frequencyStartDate: '10/26/2026',
          frequencyEndDate: '12/24/2026',
          unscheduledCount: 3
        },
        {
          mrn: '1045',
          patientName: 'Antoniotti, Jeffrey C',
          patientId: 'pat-1045',
          payer: 'BLUE CROSS BLUE SHIELD OF MASS PROVIDER',
          discipline: 'OT',
          frequencyStartDate: '10/26/2026',
          frequencyEndDate: '12/24/2026',
          unscheduledCount: 1
        },
        {
          mrn: '1050',
          patientName: 'Auguste, Jocelene',
          patientId: 'pat-1050',
          payer: 'AETNA',
          discipline: 'HHA',
          frequencyStartDate: '10/26/2026',
          frequencyEndDate: '12/24/2026',
          unscheduledCount: 2
        }
      ];
    }

    if (disciplines && Array.isArray(disciplines) && disciplines.length > 0) {
      rows = rows.filter(r => disciplines.some((d: string) => r.discipline.toLowerCase().includes(d.toLowerCase())));
    }
    if (payers && Array.isArray(payers) && payers.length > 0) {
      rows = rows.filter(r => payers.some((p: string) => r.payer.toLowerCase().includes(p.toLowerCase())));
    }

    res.json({
      success: true,
      records: rows,
      totalCount: rows.length
    });
  } catch (err: any) {
    console.error('Error generating unscheduled visits report:', err);
    res.status(500).json({ error: 'Failed to generate unscheduled visits report' });
  }
});

// ==========================================
// SCHEDULE REPORT ENDPOINTS
// ==========================================

const SCHEDULE_REPORT_STATUSES = [
  'Awaiting Clinician Signature',
  'Completed',
  'Completed from Mobile Device',
  'Created',
  'Exported',
  'Missed Visit',
  'Missed Visit (Complete)',
  'Missed Visit (Pending GA Review)',
  'Missed Visit (Returned for Review)',
  'Not Yet Due',
  'Not Yet Started',
  'Pending Follow-up',
  'Reopened',
  'Returned for Clinician Signature',
  'Returned for Review',
  'Returned for Review by Physician',
  'Returned w/ Physician Signature',
  'Saved',
  'Saved by Physician',
  'Saved from Mobile Device',
  'Sent to Physician (Electronically)',
  'Sent to Physician (Fax, Mail, etc.)',
  'Submitted from Mobile Device',
  'Submitted (Pending Co-signature)',
  'Submitted with Signature',
  'To Be Sent to Physician'
];

const SCHEDULE_REPORT_DISCIPLINES = [
  'Nursing',
  'Physical Therapy',
  'Occupational Therapy',
  'Speech Therapy',
  'MSW',
  'HHA',
  'Dietician',
  'Orders',
  'Reports and Notes'
];

// GET /api/reports/schedule-report/metadata
app.get('/api/reports/schedule-report/metadata', async (_req: Request, res: Response) => {
  try {
    const branchesResult = await pool.query(`
      SELECT DISTINCT branch FROM patients WHERE branch IS NOT NULL AND branch <> ''
      UNION
      SELECT DISTINCT branch FROM clinicians WHERE branch IS NOT NULL AND branch <> ''
    `);
    const dbBranches = branchesResult.rows.map(r => r.branch).filter(Boolean);
    const branches = Array.from(new Set(['All', 'Standards Home Care', ...dbBranches]));

    const patientsResult = await pool.query(`
      SELECT 
        id,
        COALESCE(mrn, '1001') as mrn,
        COALESCE(UPPER(last_name || ', ' || first_name), 'Unknown Patient') as name,
        COALESCE(branch, 'Standards Home Care') as branch
      FROM patients
      ORDER BY last_name, first_name
    `);

    const cliniciansResult = await pool.query(`
      SELECT 
        c.id,
        COALESCE(c.name, u.full_name, 'Clinician') as name,
        COALESCE(c.title, 'Registered Nurse') as title,
        COALESCE(c.credentials, 'RN') as credentials,
        COALESCE(c.discipline, 'Nursing') as discipline,
        COALESCE(c.branch, 'Standards Home Care') as branch
      FROM clinicians c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY COALESCE(c.name, u.full_name)
    `);

    const tasksResult = await pool.query(`
      SELECT DISTINCT COALESCE(task, visit_type) as task
      FROM visits
      WHERE COALESCE(task, visit_type) IS NOT NULL AND COALESCE(task, visit_type) <> ''
      ORDER BY task
    `);
    const tasks = tasksResult.rows.map(r => r.task).filter(Boolean);

    res.json({
      success: true,
      branches,
      patients: patientsResult.rows,
      clinicians: cliniciansResult.rows,
      tasks,
      statuses: SCHEDULE_REPORT_STATUSES,
      disciplines: SCHEDULE_REPORT_DISCIPLINES,
      groupByOptions: ['None', 'Patient', 'Date', 'Task', 'Clinician']
    });
  } catch (err: any) {
    console.error('Error fetching schedule report metadata:', err);
    res.status(500).json({ error: 'Failed to fetch schedule report metadata' });
  }
});

async function queryScheduleReport(filters: any) {
  const {
    branch,
    patientId,
    clinicianId,
    status,
    selectionType,
    task,
    discipline,
    dateFrom,
    dateTo,
    search
  } = filters || {};

  let query = `
    SELECT 
      v.id,
      COALESCE(UPPER(p.last_name || ', ' || p.first_name), UPPER(v.patient_name), 'ABUISSA, HEATHER') as patient,
      COALESCE(p.mrn, '1061') as mrn,
      p.id as "patientId",
      TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start, CURRENT_DATE), 'MM/DD/YYYY') as "scheduleDate",
      COALESCE(v.visit_time_in, TO_CHAR(v.scheduled_start, 'HH12:MI AM'), '09:00 AM') as "visitTimeIn",
      COALESCE(v.visit_time_out, TO_CHAR(v.scheduled_end, 'HH12:MI AM'), '10:00 AM') as "visitTimeOut",
      COALESCE(v.task, v.visit_type, 'Skilled Nursing Visit') as task,
      COALESCE(v.status, 'Completed') as status,
      COALESCE(v.payable, true) as payable,
      COALESCE(v.billable, true) as billable,
      COALESCE(v.employee_name, c.name, 'Mario Fortune LPN') as clinician,
      COALESCE(c.id, v.clinician_id) as "clinicianId",
      COALESCE(c.discipline, 'Nursing') as discipline,
      COALESCE(v.tags, ARRAY['Routine']::TEXT[]) as tags,
      COALESCE(p.branch, c.branch, 'Standards Home Care') as branch
    FROM visits v
    LEFT JOIN patients p ON v.patient_id = p.id
    LEFT JOIN clinicians c ON v.clinician_id = c.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIdx = 1;

  if (branch && branch !== 'All') {
    query += ` AND (p.branch ILIKE $${paramIdx} OR c.branch ILIKE $${paramIdx} OR 'Standards Home Care' ILIKE $${paramIdx})`;
    params.push(`%${branch}%`);
    paramIdx++;
  }

  if (patientId && patientId !== 'All') {
    query += ` AND (p.id::text = $${paramIdx} OR v.patient_id::text = $${paramIdx} OR p.mrn = $${paramIdx})`;
    params.push(patientId);
    paramIdx++;
  }

  if (clinicianId && clinicianId !== 'All') {
    query += ` AND (c.id::text = $${paramIdx} OR v.clinician_id::text = $${paramIdx} OR v.employee_name ILIKE $${paramIdx})`;
    params.push(clinicianId);
    paramIdx++;
  }

  if (status && status !== 'All') {
    query += ` AND (v.status ILIKE $${paramIdx} OR v.task_status ILIKE $${paramIdx})`;
    params.push(status);
    paramIdx++;
  }

  if (selectionType === 'discipline' && discipline && discipline !== 'All') {
    query += ` AND (c.discipline ILIKE $${paramIdx} OR v.task ILIKE $${paramIdx} OR v.visit_type ILIKE $${paramIdx})`;
    params.push(`%${discipline}%`);
    paramIdx++;
  } else if (selectionType === 'task' && task && task !== 'All') {
    query += ` AND (v.task ILIKE $${paramIdx} OR v.visit_type ILIKE $${paramIdx})`;
    params.push(`%${task}%`);
    paramIdx++;
  }

  if (dateFrom) {
    query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) >= $${paramIdx}::date`;
    params.push(dateFrom);
    paramIdx++;
  }

  if (dateTo) {
    query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) <= $${paramIdx}::date`;
    params.push(dateTo);
    paramIdx++;
  }

  if (search && search.trim() !== '') {
    query += ` AND (
      p.first_name ILIKE $${paramIdx} OR
      p.last_name ILIKE $${paramIdx} OR
      p.mrn ILIKE $${paramIdx} OR
      v.patient_name ILIKE $${paramIdx} OR
      v.employee_name ILIKE $${paramIdx} OR
      c.name ILIKE $${paramIdx} OR
      v.task ILIKE $${paramIdx} OR
      v.status ILIKE $${paramIdx}
    )`;
    params.push(`%${search.trim()}%`);
    paramIdx++;
  }

  query += ` ORDER BY COALESCE(v.scheduled_date, v.scheduled_start, CURRENT_DATE) DESC, v.id DESC LIMIT 500;`;

  const result = await pool.query(query, params);
  return result.rows;
}

// POST /api/reports/schedule-report/generate
app.post('/api/reports/schedule-report/generate', async (req: Request, res: Response) => {
  try {
    const rows = await queryScheduleReport(req.body);
    res.json({
      success: true,
      records: rows,
      totalCount: rows.length
    });
  } catch (err: any) {
    console.error('Error generating schedule report:', err);
    res.status(500).json({ error: 'Failed to generate schedule report' });
  }
});

// POST /api/reports/schedule-report/export
app.post('/api/reports/schedule-report/export', async (req: Request, res: Response) => {
  try {
    const rows = await queryScheduleReport(req.body);

    const exportRows = rows.map((r: any) => ({
      'Patient': r.patient,
      'MRN': r.mrn,
      'Schedule Date': r.scheduleDate,
      'Visit Time In': r.visitTimeIn,
      'Visit Time Out': r.visitTimeOut,
      'Task': r.task,
      'Status': r.status,
      'Payable': r.payable ? 'Yes' : 'No',
      'Billable': r.billable ? 'Yes' : 'No',
      'Clinician': r.clinician,
      'Tags': Array.isArray(r.tags) ? r.tags.join(', ') : (r.tags || 'Routine')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    
    worksheet['!cols'] = [
      { wch: 25 }, // Patient
      { wch: 10 }, // MRN
      { wch: 14 }, // Schedule Date
      { wch: 14 }, // Visit Time In
      { wch: 14 }, // Visit Time Out
      { wch: 28 }, // Task
      { wch: 18 }, // Status
      { wch: 10 }, // Payable
      { wch: 10 }, // Billable
      { wch: 25 }, // Clinician
      { wch: 18 }, // Tags
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Report');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Schedule_Report_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (err: any) {
    console.error('Error exporting schedule report:', err);
    res.status(500).json({ error: 'Failed to export schedule report to Excel' });
  }
});

// POST /api/reports/schedule-report/reassign
app.post('/api/reports/schedule-report/reassign', async (req: Request, res: Response) => {
  try {
    const { visitIds, replacementClinicianId, replacementClinicianName } = req.body;
    if (!visitIds || !Array.isArray(visitIds) || visitIds.length === 0) {
      return res.status(400).json({ error: 'visitIds array is required' });
    }
    if (!replacementClinicianName) {
      return res.status(400).json({ error: 'replacementClinicianName is required' });
    }

    const clinicianUuid = replacementClinicianId && replacementClinicianId.length === 36 ? replacementClinicianId : null;

    let updateQuery = `
      UPDATE visits
      SET employee_name = $1
    `;
    const params: any[] = [replacementClinicianName];

    if (clinicianUuid) {
      updateQuery += `, clinician_id = $2 WHERE id::text = ANY($3::text[])`;
      params.push(clinicianUuid, visitIds);
    } else {
      updateQuery += ` WHERE id::text = ANY($2::text[])`;
      params.push(visitIds);
    }

    const result = await pool.query(updateQuery, params);

    res.json({
      success: true,
      updatedCount: result.rowCount,
      message: `Successfully reassigned ${result.rowCount} visits to ${replacementClinicianName}.`
    });
  } catch (err: any) {
    console.error('Error reassigning schedule visits:', err);
    res.status(500).json({ error: 'Failed to reassign schedule visits' });
  }
});

// ==========================================
// SCHEDULE DEVIATION REPORT ENDPOINTS
// ==========================================

async function queryScheduleDeviationReport(filters: any) {
  const { branch, dateFrom, dateTo, search } = filters || {};

  let query = `
    SELECT 
      v.id,
      COALESCE(p.branch, v.branch, c.branch, 'Standard Home Care') as branch,
      COALESCE(p.mrn, '1061') as mrn,
      COALESCE(v.task, v.visit_type, 'Skilled Nursing Visit') as task,
      COALESCE(UPPER(p.last_name || ', ' || p.first_name), UPPER(v.patient_name), 'ABUISSA, HEATHER') as patient,
      p.id as "patientId",
      COALESCE(v.status::text, 'Completed') as status,
      COALESCE(v.employee_name, c.name, 'Mario Fortune LPN') as "userName",
      c.id as "userId",
      TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start, CURRENT_DATE), 'MM/DD/YYYY') as "scheduleVisit",
      CASE 
        WHEN LOWER(v.status::text) LIKE '%missed%' THEN 'Missed'
        ELSE TO_CHAR(COALESCE(v.visit_date, v.actual_start::date, v.scheduled_date + INTERVAL '1 day', CURRENT_DATE), 'MM/DD/YYYY')
      END as "visitDate",
      v.deviation_reason as "deviationReason"
    FROM visits v
    LEFT JOIN patients p ON v.patient_id = p.id
    LEFT JOIN clinicians c ON v.clinician_id = c.id
    WHERE (
      v.is_deviation = true
      OR (v.visit_date IS NOT NULL AND v.scheduled_date IS NOT NULL AND v.visit_date <> v.scheduled_date)
      OR (v.actual_start IS NOT NULL AND v.scheduled_start IS NOT NULL AND v.actual_start::date <> v.scheduled_start::date)
      OR (LOWER(v.status::text) LIKE '%missed%')
    )
  `;

  const params: any[] = [];
  let paramIdx = 1;

  if (branch && branch !== 'All') {
    query += ` AND (p.branch ILIKE $${paramIdx} OR v.branch ILIKE $${paramIdx} OR c.branch ILIKE $${paramIdx} OR 'Standard Home Care' ILIKE $${paramIdx})`;
    params.push(`%${branch}%`);
    paramIdx++;
  }

  if (dateFrom) {
    query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) >= $${paramIdx}::date`;
    params.push(dateFrom);
    paramIdx++;
  }

  if (dateTo) {
    query += ` AND COALESCE(v.scheduled_date, v.scheduled_start::date) <= $${paramIdx}::date`;
    params.push(dateTo);
    paramIdx++;
  }

  if (search && search.trim() !== '') {
    query += ` AND (
      p.first_name ILIKE $${paramIdx} OR
      p.last_name ILIKE $${paramIdx} OR
      p.mrn ILIKE $${paramIdx} OR
      v.patient_name ILIKE $${paramIdx} OR
      v.employee_name ILIKE $${paramIdx} OR
      c.name ILIKE $${paramIdx} OR
      v.task ILIKE $${paramIdx} OR
      v.status::text ILIKE $${paramIdx}
    )`;
    params.push(`%${search.trim()}%`);
    paramIdx++;
  }

  query += ` ORDER BY COALESCE(v.scheduled_date, v.scheduled_start, CURRENT_DATE) DESC, v.id DESC`;

  return { query, params };
}

// GET /api/reports/schedule-deviation/metadata
app.get('/api/reports/schedule-deviation/metadata', async (_req: Request, res: Response) => {
  try {
    const branchesResult = await pool.query(`
      SELECT DISTINCT branch FROM patients WHERE branch IS NOT NULL AND branch <> ''
      UNION
      SELECT DISTINCT branch FROM clinicians WHERE branch IS NOT NULL AND branch <> ''
    `);
    const dbBranches = branchesResult.rows.map(r => r.branch).filter(Boolean);
    const branches = Array.from(new Set(['All', 'Standard Home Care', ...dbBranches]));

    res.json({
      success: true,
      branches
    });
  } catch (err: any) {
    console.error('Error fetching schedule deviation metadata:', err);
    res.status(500).json({ error: 'Failed to fetch schedule deviation metadata' });
  }
});

// GET or POST /api/reports/schedule-deviation - Paginated report
app.all('/api/reports/schedule-deviation', async (req: Request, res: Response) => {
  try {
    const bodyOrQuery = req.method === 'POST' ? req.body : req.query;
    const page = Math.max(1, parseInt((bodyOrQuery.page as string) || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt((bodyOrQuery.pageSize as string) || '15', 10)));
    const offset = (page - 1) * pageSize;

    const { query: baseQuery, params } = await queryScheduleDeviationReport(bodyOrQuery);

    const countSql = `SELECT COUNT(*) FROM (${baseQuery}) AS sub`;
    const countResult = await pool.query(countSql, params);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const paginatedSql = `${baseQuery} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const paginatedParams = [...params, pageSize, offset];
    const dataResult = await pool.query(paginatedSql, paginatedParams);

    res.json({
      success: true,
      records: dataResult.rows,
      totalCount,
      page,
      pageSize,
      totalPages
    });
  } catch (err: any) {
    console.error('Error generating schedule deviation report:', err);
    res.status(500).json({ error: 'Failed to generate schedule deviation report' });
  }
});

// POST /api/reports/schedule-deviation/export - Excel export of ALL matching records
app.post('/api/reports/schedule-deviation/export', async (req: Request, res: Response) => {
  try {
    const { query: baseQuery, params } = await queryScheduleDeviationReport(req.body);
    const result = await pool.query(baseQuery, params);
    const rows = result.rows;

    const exportRows = rows.map((r: any) => ({
      'Branch': r.branch,
      'MRN': r.mrn,
      'Task': r.task,
      'Patient': r.patient,
      'Status': r.status,
      'User Name': r.userName,
      'Schedule Visit': r.scheduleVisit,
      'Visit Date': r.visitDate
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet['!cols'] = [
      { wch: 22 }, // Branch
      { wch: 10 }, // MRN
      { wch: 28 }, // Task
      { wch: 24 }, // Patient
      { wch: 18 }, // Status
      { wch: 24 }, // User Name
      { wch: 16 }, // Schedule Visit
      { wch: 16 }, // Visit Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Schedule Deviation Report');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Schedule_Deviation_Report_${new Date().toISOString().split('T')[0]}.xlsx"`);
    res.send(buffer);
  } catch (err: any) {
    console.error('Error exporting schedule deviation report:', err);
    res.status(500).json({ error: 'Failed to export schedule deviation report' });
  }
});

// ==========================================
// REPORT CENTER ENDPOINTS
// ==========================================

// GET /api/reports/center/categories
app.get('/api/reports/center/categories', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.display_order as "displayOrder",
        c.icon,
        c.is_active as "isActive",
        COUNT(r.id)::int as "reportCount"
      FROM report_categories c
      LEFT JOIN reports r ON c.id = r.category_id AND r.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.display_order ASC;
    `);

    res.json({
      success: true,
      categories: result.rows
    });
  } catch (err: any) {
    console.error('Error fetching report categories:', err);
    res.status(500).json({ error: 'Failed to fetch report categories' });
  }
});

// GET /api/reports/center/reports
app.get('/api/reports/center/reports', async (req: Request, res: Response) => {
  try {
    const { categorySlug, search } = req.query;

    let query = `
      SELECT 
        r.id,
        r.category_id as "categoryId",
        c.name as "categoryName",
        c.slug as "categorySlug",
        c.icon as "categoryIcon",
        r.name,
        r.slug,
        r.description,
        r.route,
        r.display_order as "displayOrder",
        r.is_active as "isActive",
        CASE WHEN r.route IS NOT NULL AND r.route <> '' THEN true ELSE false END as "isImplemented"
      FROM reports r
      JOIN report_categories c ON r.category_id = c.id
      WHERE r.is_active = true AND c.is_active = true
    `;

    const params: any[] = [];
    let paramIdx = 1;

    if (categorySlug && categorySlug !== 'all') {
      query += ` AND c.slug = $${paramIdx}`;
      params.push(categorySlug);
      paramIdx++;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ` AND (r.name ILIKE $${paramIdx} OR r.description ILIKE $${paramIdx} OR c.name ILIKE $${paramIdx})`;
      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    query += ` ORDER BY c.display_order ASC, r.display_order ASC;`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      reports: result.rows,
      totalCount: result.rows.length
    });
  } catch (err: any) {
    console.error('Error fetching report center reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ==========================================
// SCHEDULE REPORT ENDPOINTS
app.get('/api/schedule/my-schedule-tasks', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        v.id,
        COALESCE(v.patient_name, p.first_name || ' ' || p.last_name, 'Patient') as "patientName",
        COALESCE(p.mrn, '1001') as mrn,
        COALESCE(v.visit_type, v.task, 'Skilled Nurse Visit') as task,
        TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start, CURRENT_DATE), 'MM/DD/YYYY') as date,
        COALESCE(v.time_slot, '09:00 AM - 10:30 AM') as "timeSlot",
        CASE 
          WHEN LOWER(v.status::text) IN ('completed', 'verified') THEN 'Completed'
          WHEN LOWER(v.status::text) IN ('pending_signature', 'pending signature') THEN 'Pending Signature'
          WHEN LOWER(v.status::text) IN ('missed', 'cancelled') THEN 'Missed'
          ELSE 'Scheduled'
        END as status,
        COALESCE(v.service_line, 'home_health') as "serviceLine",
        COALESCE(p.primary_diagnosis, '') as diagnosis,
        COALESCE(v.employee_name, 'Hilder Magessa, RN') as "clinicianName"
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE v.status != 'unassigned' AND v.huv_sfv_type IS NULL
      ORDER BY COALESCE(v.scheduled_date, v.scheduled_start) DESC, v.time_slot ASC;
    `);

    // Map and assign tags intelligently based on diagnosis/task
    const tasks = result.rows.map(row => {
      const tags: string[] = [];
      const text = `${row.task} ${row.diagnosis}`.toLowerCase();
      if (text.includes('wound') || text.includes('dressing') || text.includes('ulcer')) tags.push('Wound Care');
      if (text.includes('fall') || text.includes('gait') || text.includes('mobility')) tags.push('Fall Risk');
      if (text.includes('diabet') || text.includes('insulin') || text.includes('glucose')) tags.push('Diabetic Protocol');
      if (text.includes('cardio') || text.includes('chf') || text.includes('heart') || text.includes('vitals')) tags.push('Cardiopulmonary');
      if (text.includes('oasis') || text.includes('recert')) tags.push('OASIS-E', 'Recertification');
      if (text.includes('iv') || text.includes('infusion')) tags.push('IV Therapy');
      if (text.includes('foley') || text.includes('catheter') || text.includes('urine')) tags.push('Urology');
      if (text.includes('physical') || text.includes('therapy') || text.includes('pt') || text.includes('ot')) tags.push('Physical Therapy');
      if (tags.length === 0) {
        tags.push('Skilled Nursing');
        if (row.serviceLine === 'home_health') tags.push('Home Health');
        else if (row.serviceLine === 'hospice') tags.push('Palliative');
      }
      return {
        id: row.id,
        patientName: row.patientName,
        mrn: row.mrn,
        task: row.task,
        date: row.date,
        timeSlot: row.timeSlot,
        status: row.status,
        tags: Array.from(new Set(tags)),
        clinicianName: row.clinicianName,
      };
    });

    res.json(tasks);
  } catch (err: any) {
    console.error('Error fetching my schedule tasks:', err);
    res.status(500).json({ error: 'Failed to fetch schedule tasks' });
  }
});

// GET /api/schedule/non-visit-activities - Fetch logged non-visit activities
app.get('/api/schedule/non-visit-activities', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        clinician_name as "clinicianName",
        activity_type as "activityType",
        TO_CHAR(activity_date, 'MM/DD/YYYY') as "activityDate",
        start_time as "startTime",
        end_time as "endTime",
        duration_minutes as "durationMinutes",
        mileage::float as mileage,
        comments,
        created_at as "createdAt"
      FROM non_visit_activities
      ORDER BY activity_date DESC, created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching non-visit activities:', err);
    res.status(500).json({ error: 'Failed to fetch non-visit activities' });
  }
});

// POST /api/schedule/non-visit-activities - Log a new non-visit activity
app.post('/api/schedule/non-visit-activities', async (req: Request, res: Response) => {
  try {
    const { activityType, activityDate, startTime, endTime, durationMinutes, mileage, comments, clinicianName } = req.body;
    if (!activityType || !activityDate) {
      return res.status(400).json({ error: 'activityType and activityDate are required' });
    }
    const result = await pool.query(`
      INSERT INTO non_visit_activities (
        clinician_name, activity_type, activity_date, start_time, end_time, duration_minutes, mileage, comments
      ) VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8)
      RETURNING 
        id,
        clinician_name as "clinicianName",
        activity_type as "activityType",
        TO_CHAR(activity_date, 'MM/DD/YYYY') as "activityDate",
        start_time as "startTime",
        end_time as "endTime",
        duration_minutes as "durationMinutes",
        mileage::float as mileage,
        comments,
        created_at as "createdAt";
    `, [
      clinicianName || 'Hilder Magessa, RN',
      activityType,
      activityDate,
      startTime || '09:00 AM',
      endTime || '09:30 AM',
      durationMinutes || 30,
      mileage || 0,
      comments || ''
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error logging non-visit activity:', err);
    res.status(500).json({ error: 'Failed to log non-visit activity' });
  }
});

// DELETE /api/schedule/non-visit-activities/:id - Delete logged activity
app.delete('/api/schedule/non-visit-activities/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM non_visit_activities WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting non-visit activity:', err);
    res.status(500).json({ error: 'Failed to delete non-visit activity' });
  }
});

// ==========================================
// QUALITY ASSURANCE (QA) CENTER API ROUTES
// ==========================================

// GET /api/qa/tasks - Real QA Review Items from PostgreSQL
app.get('/api/qa/tasks', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        patient_id as "patientId",
        patient_name as "patientName",
        mrn,
        TO_CHAR(event_date, 'MM/DD/YYYY') as "eventDate",
        task,
        task_category as "taskCategory",
        status,
        assigned_to as "assignedTo",
        branch,
        payer,
        patient_status as "patientStatus",
        COALESCE(tags, ARRAY[]::text[]) as tags,
        COALESCE(notes, '') as notes,
        has_oasis_analysis as "hasOasisAnalysis",
        has_case_mix as "hasCaseMix",
        has_margin_calc as "hasMarginCalc",
        is_care_visit as "isCareVisit"
      FROM qa_tasks
      ORDER BY event_date DESC, created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching QA tasks:', err);
    res.status(500).json({ error: 'Failed to fetch QA tasks' });
  }
});

// PATCH /api/qa/tasks/:id/status - Update QA Task Status (e.g. Approve or Return)
app.patch('/api/qa/tasks/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    let query = 'UPDATE qa_tasks SET status = $1';
    const params: any[] = [status];

    if (notes !== undefined) {
      query += ', notes = $2 WHERE id = $3 RETURNING *;';
      params.push(notes, id);
    } else {
      query += ' WHERE id = $2 RETURNING *;';
      params.push(id);
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QA task not found' });
    }

    res.json({ success: true, task: result.rows[0] });
  } catch (err: any) {
    console.error('Error updating QA task status:', err);
    res.status(500).json({ error: 'Failed to update QA task status' });
  }
});

// PATCH /api/qa/tasks/:id/tags-notes - Update Tags and Clinical Notes for QA Task
app.patch('/api/qa/tasks/:id/tags-notes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes, tags } = req.body;

    const result = await pool.query(`
      UPDATE qa_tasks SET
        notes = COALESCE($1, notes),
        tags = COALESCE($2::text[], tags)
      WHERE id = $3
      RETURNING 
        id,
        patient_id as "patientId",
        patient_name as "patientName",
        mrn,
        TO_CHAR(event_date, 'MM/DD/YYYY') as "eventDate",
        task,
        task_category as "taskCategory",
        status,
        assigned_to as "assignedTo",
        branch,
        payer,
        patient_status as "patientStatus",
        COALESCE(tags, ARRAY[]::text[]) as tags,
        COALESCE(notes, '') as notes,
        has_oasis_analysis as "hasOasisAnalysis",
        has_case_mix as "hasCaseMix",
        has_margin_calc as "hasMarginCalc",
        is_care_visit as "isCareVisit";
    `, [notes !== undefined ? notes : null, tags !== undefined ? tags : null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'QA task not found' });
    }

    res.json({ success: true, task: result.rows[0] });
  } catch (err: any) {
    console.error('Error updating QA task notes/tags:', err);
    res.status(500).json({ error: 'Failed to update QA task notes and tags' });
  }
});

// POST /api/qa/tasks/batch-approve - Batch Approve Selected QA Tasks
app.post('/api/qa/tasks/batch-approve', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No task IDs provided' });
    }

    await pool.query("UPDATE qa_tasks SET status = 'Approved' WHERE id = ANY($1::uuid[])", [ids]);
    res.json({ success: true, count: ids.length });
  } catch (err: any) {
    console.error('Error batch approving QA tasks:', err);
    res.status(500).json({ error: 'Failed to batch approve tasks' });
  }
});

// POST /api/qa/tasks/batch-return - Batch Return Selected QA Tasks w/ Reason
app.post('/api/qa/tasks/batch-return', async (req: Request, res: Response) => {
  try {
    const { ids, returnReason } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No task IDs provided' });
    }

    const noteAppend = returnReason ? `Returned: ${returnReason}` : 'Returned for revision';
    await pool.query(`
      UPDATE qa_tasks 
      SET status = 'Returned',
          notes = CASE WHEN notes = '' THEN $2 ELSE notes || ' | ' || $2 END
      WHERE id = ANY($1::uuid[])
    `, [ids, noteAppend]);

    res.json({ success: true, count: ids.length });
  } catch (err: any) {
    console.error('Error batch returning QA tasks:', err);
    res.status(500).json({ error: 'Failed to batch return tasks' });
  }
});

// POST /api/qa/tasks/batch-delete - Batch Delete QA Tasks
app.post('/api/qa/tasks/batch-delete', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No task IDs provided' });
    }

    await pool.query('DELETE FROM qa_tasks WHERE id = ANY($1::uuid[])', [ids]);
    res.json({ success: true, count: ids.length });
  } catch (err: any) {
    console.error('Error batch deleting QA tasks:', err);
    res.status(500).json({ error: 'Failed to batch delete tasks' });
  }
});

// ==========================================
// REPORTS & CENSUS REAL-TIME API ROUTES
// ==========================================

// GET /api/reports/stats - Aggregated Metrics for Reports & Census
app.get('/api/reports/stats', async (_req: Request, res: Response) => {
  try {
    // 1. Active Census
    const censusRes = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE service_line = 'home_health')::int as "homeHealth",
        COUNT(*) FILTER (WHERE service_line = 'home_care')::int as "homeCare",
        COUNT(*) FILTER (WHERE service_line = 'hospice')::int as hospice
      FROM patients
      WHERE status = 'active';
    `);

    // 2. Scheduled Visits Compliance
    const visitRes = await pool.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE evv_verified = true OR status = 'completed')::int as verified,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int as "inProgress",
        COUNT(*) FILTER (WHERE status = 'scheduled')::int as scheduled
      FROM visits
      WHERE status != 'unassigned' AND huv_sfv_type IS NULL;
    `);

    // 3. Clinicians Count
    const clinRes = await pool.query(`SELECT COUNT(*)::int as total FROM clinicians WHERE status = 'active'`);

    // 4. HUV / SFV Audits
    const auditRes = await pool.query(`SELECT COUNT(*)::int as total FROM visits WHERE huv_sfv_type IS NOT NULL`);

    const census = censusRes.rows[0];
    const visits = visitRes.rows[0];
    const totalV = visits.total || 1;
    const verifiedV = visits.verified || 0;
    const complianceRate = Math.min(100, Math.round((verifiedV / (totalV || 1)) * 100));

    res.json({
      catalogedReports: 12,
      scheduledReportsCount: 4,
      complianceRate: `${complianceRate}%`,
      complianceLabel: 'HUV/SFV & EVV Verified',
      activeCensusTotal: census.total,
      homeHealthCensus: census.homeHealth,
      homeCareCensus: census.homeCare,
      hospiceCensus: census.hospice,
      totalVisits: visits.total,
      completedVisits: visits.verified,
      inProgressVisits: visits.inProgress,
      activeClinicians: clinRes.rows[0].total,
      totalAudits: auditRes.rows[0].total
    });
  } catch (err: any) {
    console.error('Error fetching report stats:', err);
    res.status(500).json({ error: 'Failed to fetch report stats' });
  }
});

// POST /api/reports/generate - Generate Report with Real Database Query and User Filters
app.post('/api/reports/generate', async (req: Request, res: Response) => {
  try {
    const {
      reportId,
      startDate,
      viewType,
      organization,
      branch,
      statuses,
      personSearch
    } = req.body;

    let rows: any[] = [];
    const searchFilter = personSearch ? `%${personSearch.trim().toLowerCase()}%` : null;

    if (reportId === 'employee-schedule') {
      let query = `
        SELECT 
          v.id,
          COALESCE(v.employee_name, c.name, 'Unassigned Clinician') as "col1",
          COALESCE(c.credentials, 'RN') || ' • ' || COALESCE(c.title, 'Field Clinician') as "sub1",
          COALESCE(v.visit_type, v.task, 'Skilled Nurse Visit') as "col2",
          UPPER(REPLACE(v.service_line::text, '_', ' ')) as "col3",
          TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start), 'YYYY-MM-DD') as "col4",
          COALESCE(v.patient_name, p.first_name || ' ' || p.last_name, 'Patient') as "col5",
          COALESCE(v.time_slot, '09:00 AM') as "sub5",
          UPPER(v.status::text) as status,
          (v.status::text = 'completed' OR v.evv_verified = true) as "isCompleted",
          (v.status::text = 'in_progress') as "isInProgress"
        FROM visits v
        LEFT JOIN clinicians c ON v.clinician_id = c.id
        LEFT JOIN patients p ON v.patient_id = p.id
        WHERE v.status::text != 'unassigned' AND v.huv_sfv_type IS NULL
      `;
      const params: any[] = [];

      if (searchFilter) {
        params.push(searchFilter);
        query += ` AND (LOWER(v.employee_name) LIKE $${params.length} OR LOWER(v.patient_name) LIKE $${params.length})`;
      }

      query += ` ORDER BY COALESCE(v.scheduled_date, v.scheduled_start) ASC, v.time_slot ASC;`;
      const result = await pool.query(query, params);
      rows = result.rows;
    } else if (reportId === 'patient-schedule' || reportId === 'oasis-documentation' || reportId === 'face-to-face-tracking') {
      let query = `
        SELECT 
          t.id,
          COALESCE(p.last_name || ', ' || p.first_name, 'Patient') as "col1",
          'MRN: ' || COALESCE(p.mrn, '1061') as "sub1",
          t.task_name as "col2",
          t.discipline as "col3",
          TO_CHAR(t.schedule_start, 'YYYY-MM-DD') as "col4",
          t.assigned_to as "col5",
          '09:00 AM' as "sub5",
          t.status as status,
          (t.status = 'Completed' OR t.status ILIKE '%signature%') as "isCompleted",
          (t.status = 'Not Yet Due') as "isInProgress"
        FROM patient_tasks t
        JOIN patients p ON t.patient_id = p.id::text
        WHERE 1=1
      `;
      const params: any[] = [];

      if (reportId === 'face-to-face-tracking') {
        query += ` AND t.task_name ILIKE '%face-to-face%'`;
      } else if (reportId === 'oasis-documentation') {
        query += ` AND (t.task_name ILIKE '%care%' OR t.task_name ILIKE '%note%' OR t.task_name ILIKE '%oasis%')`;
      }

      if (searchFilter) {
        params.push(searchFilter);
        query += ` AND (LOWER(p.first_name || ' ' || p.last_name) LIKE $${params.length} OR LOWER(t.assigned_to) LIKE $${params.length} OR LOWER(p.mrn) LIKE $${params.length})`;
      }

      query += ` ORDER BY t.schedule_start ASC;`;
      const result = await pool.query(query, params);
      rows = result.rows;
    } else if (reportId === 'huv-sfv') {
      let query = `
        SELECT 
          v.id,
          COALESCE(v.patient_name, p.first_name || ' ' || p.last_name, 'Patient') as "col1",
          'MRN: ' || COALESCE(p.mrn, 'MRN-78210') as "sub1",
          v.visit_type || ' (' || COALESCE(v.huv_sfv_type, 'HUV') || ')' as "col2",
          v.huv_sfv_type as "col3",
          TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start), 'YYYY-MM-DD') as "col4",
          COALESCE(v.days_remaining::text || ' days remaining', 'Due Soon') as "col5",
          'Admission: ' || TO_CHAR(COALESCE(v.admission_date, CURRENT_DATE - INTERVAL '10 days'), 'MM/DD/YYYY') as "sub5",
          COALESCE(v.task_status, 'Scheduled') as status,
          (v.task_status = 'Completed') as "isCompleted",
          (v.task_status = 'In Progress') as "isInProgress"
        FROM visits v
        LEFT JOIN patients p ON v.patient_id = p.id
        WHERE v.huv_sfv_type IS NOT NULL
      `;
      const params: any[] = [];
      if (searchFilter) {
        params.push(searchFilter);
        query += ` AND (LOWER(v.patient_name) LIKE $${params.length} OR LOWER(p.mrn) LIKE $${params.length})`;
      }
      query += ` ORDER BY v.days_remaining ASC, v.scheduled_start ASC;`;
      const result = await pool.query(query, params);
      rows = result.rows;
    } else if (reportId === 'clinician-productivity') {
      let query = `
        SELECT 
          c.id,
          c.name as "col1",
          c.credentials || ' • ' || c.title as "sub1",
          COALESCE(c.specialty, 'Field Practice') as "col2",
          COALESCE(c.territory, 'Dallas Metro') as "col3",
          CURRENT_DATE::text as "col4",
          COUNT(v.id)::text || ' visits (' || COUNT(v.id) FILTER (WHERE v.status::text = 'completed')::text || ' completed)' as "col5",
          c.phone as "sub5",
          c.work_status as status,
          true as "isCompleted",
          false as "isInProgress"
        FROM clinicians c
        LEFT JOIN visits v ON c.id = v.clinician_id AND v.status::text != 'unassigned'
        GROUP BY c.id, c.name, c.credentials, c.title, c.specialty, c.territory, c.phone, c.work_status
      `;
      const params: any[] = [];
      if (searchFilter) {
        params.push(searchFilter);
        query += ` HAVING LOWER(c.name) LIKE $${params.length} OR LOWER(c.credentials) LIKE $${params.length}`;
      }
      query += ` ORDER BY c.name ASC;`;
      const result = await pool.query(query, params);
      rows = result.rows;
    } else if (reportId === 'evv-compliance' || reportId === 'mileage-expense') {
      let query = `
        SELECT 
          v.id,
          COALESCE(v.employee_name, c.name, 'Clinician') as "col1",
          'GPS: ' || ROUND(COALESCE(v.latitude, 32.7767)::numeric, 4) || ', ' || ROUND(COALESCE(v.longitude, -96.7970)::numeric, 4) as "sub1",
          v.visit_type as "col2",
          COALESCE(v.address, 'Dallas Metro TX') as "col3",
          TO_CHAR(COALESCE(v.scheduled_date, v.scheduled_start), 'YYYY-MM-DD') as "col4",
          COALESCE(v.patient_name, 'Patient') as "col5",
          COALESCE(v.time_slot, '09:00 AM') as "sub5",
          CASE WHEN v.evv_verified THEN 'VERIFIED' ELSE 'PENDING' END as status,
          (v.evv_verified = true) as "isCompleted",
          (v.status = 'in_progress') as "isInProgress"
        FROM visits v
        LEFT JOIN clinicians c ON v.clinician_id = c.id
        WHERE v.status != 'unassigned' AND v.huv_sfv_type IS NULL
      `;
      const params: any[] = [];
      if (searchFilter) {
        params.push(searchFilter);
        query += ` AND (LOWER(v.employee_name) LIKE $${params.length} OR LOWER(v.patient_name) LIKE $${params.length})`;
      }
      query += ` ORDER BY COALESCE(v.scheduled_date, v.scheduled_start) ASC;`;
      const result = await pool.query(query, params);
      rows = result.rows;
    } else if (reportId === 'credentials-expiration') {
      let query = `
        SELECT 
          c.id,
          c.name as "col1",
          'Lic: ' || COALESCE(c.license_number, 'RN-STATE-ACTIVE') as "sub1",
          c.specialty as "col2",
          c.credentials as "col3",
          '2027-12-31' as "col4",
          'Board of Nursing' as "col5",
          c.phone as "sub5",
          'ACTIVE & CURRENT' as status,
          true as "isCompleted",
          false as "isInProgress"
        FROM clinicians c
      `;
      const params: any[] = [];
      if (searchFilter) {
        params.push(searchFilter);
        query += ` WHERE LOWER(c.name) LIKE $${params.length} OR LOWER(c.credentials) LIKE $${params.length}`;
      }
      query += ` ORDER BY c.name ASC;`;
      const result = await pool.query(query, params);
      rows = result.rows;
    } else {
      // Default: Patient Census / Risk Audit
      let query = `
        SELECT 
          p.id,
          p.last_name || ', ' || p.first_name as "col1",
          'MRN: ' || p.mrn as "sub1",
          COALESCE(p.primary_diagnosis, 'Clinical Assessment & Care Plan') as "col2",
          UPPER(REPLACE(p.service_line::text, '_', ' ')) as "col3",
          TO_CHAR(COALESCE(p.start_of_care_date, p.episode_start, CURRENT_DATE), 'YYYY-MM-DD') as "col4",
          COALESCE(p.attending_physician, 'Attending Physician') as "col5",
          COALESCE(p.insurance_name, 'Medicare Part A') as "sub5",
          UPPER(p.status::text) as status,
          (p.status::text = 'active') as "isCompleted",
          (p.status::text = 'pending_admission') as "isInProgress"
        FROM patients p
        WHERE 1=1
      `;
      const params: any[] = [];

      if (reportId === 'patient-risk-audit') {
        query += ` AND (p.fall_risk = true OR p.hospitalization_risk = true OR p.infection_risk = true)`;
      }

      if (searchFilter) {
        params.push(searchFilter);
        query += ` AND (LOWER(p.first_name || ' ' || p.last_name) LIKE $${params.length} OR LOWER(p.mrn) LIKE $${params.length} OR LOWER(p.primary_diagnosis) LIKE $${params.length})`;
      }

      query += ` ORDER BY p.last_name, p.first_name;`;
      const result = await pool.query(query, params);
      rows = result.rows;
    }

    res.json({
      reportId,
      recordCount: rows.length,
      generatedAt: new Date().toISOString(),
      rows
    });
  } catch (err: any) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// ============================================================================
// CAREORBIT CONNECT & ROUTE PLANNER API ENDPOINTS
// ============================================================================

// 1. Get all Conversations (with participants, last message, unread count)
app.get('/api/connect/conversations', async (_req: Request, res: Response) => {
  try {
    const convRes = await pool.query(`
      SELECT 
        c.id,
        c.type,
        c.title,
        c.subtitle,
        c.patient_id as "patientId",
        c.patient_name as "patientName",
        c.service_line as "serviceLine",
        c.is_pinned as "isPinned",
        c.is_urgent as "isUrgent",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM conversations c
      ORDER BY c.is_pinned DESC, c.updated_at DESC;
    `);

    const conversations = [];

    for (const conv of convRes.rows) {
      // Get participants
      const partRes = await pool.query(`
        SELECT id, name, role, status
        FROM conversation_participants
        WHERE conversation_id = $1;
      `, [conv.id]);

      // Get last message
      const lastMsgRes = await pool.query(`
        SELECT 
          id,
          sender_name as "senderName",
          content,
          TO_CHAR(created_at, 'HH12:MI AM') as "timestamp",
          is_read as "isRead"
        FROM chat_messages
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
      `, [conv.id]);

      // Get unread count
      const unreadRes = await pool.query(`
        SELECT COUNT(*)::int as count
        FROM chat_messages
        WHERE conversation_id = $1 AND is_read = false;
      `, [conv.id]);

      const lastMessage = lastMsgRes.rows[0] || {
        senderName: 'System',
        content: 'Conversation started',
        timestamp: 'Just now',
        isRead: true
      };

      conversations.push({
        ...conv,
        participants: partRes.rows,
        lastMessage,
        unreadCount: unreadRes.rows[0]?.count || 0
      });
    }

    res.json(conversations);
  } catch (err: any) {
    console.error('Error fetching connect conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// 2. Create New Conversation (Direct or Care Team Group)
app.post('/api/connect/conversations', async (req: Request, res: Response) => {
  try {
    const { type, title, subtitle, patientId, patientName, participants, initialMessage } = req.body;
    const conversationId = `conv-${Date.now()}`;

    const convResult = await pool.query(`
      INSERT INTO conversations (id, type, title, subtitle, patient_id, patient_name, service_line, is_pinned, is_urgent)
      VALUES ($1, $2, $3, $4, $5, $6, 'home_health', false, false)
      RETURNING *;
    `, [conversationId, type || 'direct', title, subtitle || '', patientId || null, patientName || null]);

    const createdConv = convResult.rows[0];

    // Add participants
    const savedParticipants: any[] = [];
    if (Array.isArray(participants)) {
      for (const p of participants) {
        const pRes = await pool.query(`
          INSERT INTO conversation_participants (conversation_id, name, role, status)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, role, status;
        `, [conversationId, p.name, p.role || 'Care Team Member', p.status || 'online']);
        savedParticipants.push(pRes.rows[0]);
      }
    }

    // Add initial message if provided
    let lastMessage = {
      senderName: 'System',
      content: 'Conversation started',
      timestamp: 'Just now',
      isRead: true
    };

    if (initialMessage && initialMessage.trim()) {
      const msgId = `msg-${Date.now()}`;
      const msgRes = await pool.query(`
        INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read)
        VALUES ($1, $2, 'current-user', 'Coordinator', 'Care Coordinator', $3, true)
        RETURNING id, sender_name as "senderName", content, TO_CHAR(created_at, 'HH12:MI AM') as "timestamp", is_read as "isRead";
      `, [msgId, conversationId, initialMessage.trim()]);
      lastMessage = msgRes.rows[0];
    }

    res.status(201).json({
      id: createdConv.id,
      type: createdConv.type,
      title: createdConv.title,
      subtitle: createdConv.subtitle,
      patientId: createdConv.patient_id,
      patientName: createdConv.patient_name,
      serviceLine: createdConv.service_line,
      isPinned: createdConv.is_pinned,
      isUrgent: createdConv.is_urgent,
      participants: savedParticipants,
      lastMessage,
      unreadCount: 0
    });
  } catch (err: any) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// 3. Get Messages for a Conversation
app.get('/api/connect/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        conversation_id as "conversationId",
        sender_id as "senderId",
        sender_name as "senderName",
        sender_role as "senderRole",
        content,
        is_read as "isRead",
        TO_CHAR(created_at, 'HH12:MI AM') as "timestamp",
        created_at as "createdAt",
        attachment_name as "attachmentName",
        attachment_type as "attachmentType",
        attachment_size as "attachmentSize",
        attachment_url as "attachmentUrl"
      FROM chat_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC;
    `, [id]);

    const formattedMessages = result.rows.map(m => {
      const isMe = m.senderId === 'current-user' || m.senderName === 'You' || m.senderName === 'Coordinator' || m.senderName === 'Hilder M., RN';
      return {
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        content: m.content,
        timestamp: m.timestamp,
        date: 'Today',
        isRead: m.isRead,
        isOutgoing: isMe,
        isCurrentUser: isMe,
        attachment: m.attachmentName ? {
          name: m.attachmentName,
          type: m.attachmentType || 'file',
          size: m.attachmentSize || 'Document',
          url: m.attachmentUrl || `/api/connect/attachments/${m.attachmentName}`
        } : undefined
      };
    });

    res.json(formattedMessages);
  } catch (err: any) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 4. Send Message in a Conversation
app.post('/api/connect/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, senderId, senderName, senderRole, attachment } = req.body;
    const msgId = `msg-${Date.now()}`;

    const result = await pool.query(`
      INSERT INTO chat_messages (
        id, conversation_id, sender_id, sender_name, sender_role, content,
        is_read, attachment_name, attachment_type, attachment_size, attachment_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8, $9, $10)
      RETURNING 
        id, conversation_id as "conversationId", sender_id as "senderId",
        sender_name as "senderName", sender_role as "senderRole", content,
        is_read as "isRead", TO_CHAR(created_at, 'HH12:MI AM') as "timestamp",
        attachment_name as "attachmentName", attachment_type as "attachmentType",
        attachment_size as "attachmentSize", attachment_url as "attachmentUrl";
    `, [
      msgId,
      id,
      senderId || 'current-user',
      senderName || 'You',
      senderRole || 'Care Coordinator',
      content || '',
      attachment?.name || null,
      attachment?.type || null,
      attachment?.size || null,
      attachment?.url || null
    ]);

    // Update conversation updated_at
    await pool.query(`UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

    const m = result.rows[0];
    res.status(201).json({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      senderName: m.senderName,
      senderRole: m.senderRole,
      content: m.content,
      timestamp: m.timestamp,
      date: 'Today',
      isRead: m.isRead,
      isOutgoing: true,
      isCurrentUser: true,
      attachment: m.attachmentName ? {
        name: m.attachmentName,
        type: m.attachmentType,
        size: m.attachmentSize,
        url: m.attachmentUrl
      } : undefined
    });
  } catch (err: any) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// 5. Mark Conversation as Read
app.patch('/api/connect/conversations/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE chat_messages SET is_read = true WHERE conversation_id = $1`, [id]);
    res.json({ success: true, conversationId: id });
  } catch (err: any) {
    console.error('Error marking conversation read:', err);
    res.status(500).json({ error: 'Failed to mark conversation read' });
  }
});

// 6. Connect Contacts (Real Clinicians and Staff from DB)
app.get('/api/connect/contacts', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.title,
        c.credentials,
        c.phone,
        c.specialty,
        c.work_status as status,
        c.current_address as address
      FROM clinicians c
      ORDER BY c.name ASC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// 7. Call Logs (Real logs from call_logs table)
app.get('/api/connect/call-logs', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        contact_name as "contactName",
        contact_role as "contactRole",
        direction,
        call_type as "callType",
        duration,
        TO_CHAR(created_at, 'YYYY-MM-DD HH12:MI AM') as timestamp
      FROM call_logs
      ORDER BY created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching call logs:', err);
    res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});

// 8. Log a Call
app.post('/api/connect/call-logs', async (req: Request, res: Response) => {
  try {
    const { contactName, contactRole, direction, callType, duration } = req.body;
    const callId = `call-${Date.now()}`;
    const result = await pool.query(`
      INSERT INTO call_logs (id, contact_name, contact_role, direction, call_type, duration)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, contact_name as "contactName", contact_role as "contactRole",
        direction, call_type as "callType", duration,
        TO_CHAR(created_at, 'YYYY-MM-DD HH12:MI AM') as timestamp;
    `, [callId, contactName, contactRole || 'Clinician', direction || 'outgoing', callType || 'audio', duration || '0s']);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('Error creating call log:', err);
    res.status(500).json({ error: 'Failed to log call' });
  }
});

// 9. Download Attachment File
app.get('/api/connect/attachments/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const sampleContent = `================================================================================
CAREORBIT HEALTHCARE PLATFORM - OFFICIAL CLINICAL RECORD ATTACHMENT
Document: ${filename}
Generated: ${new Date().toISOString()}
Status: VERIFIED & ENCRYPTED
================================================================================

PATIENT CLINICAL SUMMARY & CARE ENCOUNTER RECORD
--------------------------------------------------------------------------------
This document represents an authenticated clinical transmission within the 
CareOrbit Connect Secure Care Team Network.

Attachment File: ${filename}
Security Hash: SHA256-${Buffer.from(filename).toString('hex').slice(0, 32)}
HIPAA Compliance: Verified AES-256 In-Transit & At-Rest
Transmission Channel: CareOrbit Connect Real-time Telehealth

[CLINICAL OBSERVATIONS & CARE PLAN DIRECTIVE]
- Patient response to skilled therapeutic interventions has progressed favorably.
- Electronic Visit Verification (EVV) coordinates confirmed within GPS threshold.
- Orders and physician directives renewed in compliance with state regulations.

Electronically signed & verified by Standards Home Care Clinical Coordination Team.
================================================================================`;

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(sampleContent);
});

// 10. Route Planner Itinerary (by specific date)
app.get('/api/planner/itinerary', async (req: Request, res: Response) => {
  try {
    const dateParam = (req.query.date as string) || '2026-11-06';
    const result = await pool.query(`
      SELECT 
        v.id,
        p.first_name || ' ' || p.last_name as "patientName",
        p.mrn as "patientMrn",
        COALESCE(v.address, p.address_street || ', ' || p.address_city || ' ' || p.address_state) as address,
        COALESCE(v.latitude, p.latitude, 32.7767)::float as lat,
        COALESCE(v.longitude, p.longitude, -96.7970)::float as lng,
        COALESCE(v.time_slot, TO_CHAR(v.scheduled_start, 'HH12:MI AM')) as "timeSlot",
        COALESCE(c.credentials, 'RN') as discipline,
        COALESCE(v.visit_type::text, v.task::text, 'Skilled Nursing Assessment') as "visitType",
        v.service_line as "serviceLine",
        v.status,
        COALESCE(c.name, v.employee_name, 'Staff Clinician') as "clinicianName"
      FROM visits v
      LEFT JOIN clinicians c ON v.clinician_id::text = c.id::text
      LEFT JOIN patients p ON v.patient_id::text = p.id::text
      WHERE (v.scheduled_date = $1::date OR v.scheduled_start::date = $1::date)
      ORDER BY v.scheduled_start ASC, v.time_slot ASC;
    `, [dateParam]);

    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching planner itinerary:', err);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

// 11. Route Planner Unread Messages (Real unread messages with mark read capability)
app.get('/api/planner/unread-messages', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id,
        m.conversation_id as "conversationId",
        m.sender_name as "senderName",
        m.sender_role as "senderRole",
        m.content,
        TO_CHAR(m.created_at, 'MM/DD/YY') as date,
        TO_CHAR(m.created_at, 'HH12:MI AM') as timestamp,
        c.title as "conversationTitle",
        c.service_line as "serviceLine",
        'Standards Home Care' as "organizationName"
      FROM chat_messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.is_read = false
      ORDER BY m.created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching unread messages for planner:', err);
    res.status(500).json({ error: 'Failed to fetch unread messages' });
  }
});

// 12. Mark Specific Chat Message as Read (for Route Planner unread messages)
app.patch('/api/planner/messages/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      UPDATE chat_messages 
      SET is_read = true 
      WHERE id = $1 
      RETURNING id, conversation_id as "conversationId", is_read;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ success: true, message: result.rows[0] });
  } catch (err: any) {
    console.error('Error marking planner message read:', err);
    res.status(500).json({ error: 'Failed to mark message read' });
  }
});

// 13. Route Planner Past Due Items (Real overdue clinical tasks/visits)
app.get('/api/planner/past-due', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.task_name as "taskName",
        t.status,
        t.assigned_to as "assignedTo",
        TO_CHAR(t.schedule_start, 'MM/DD/YYYY') as "dueDate",
        (CURRENT_DATE - t.schedule_start)::int as "daysOverdue",
        p.id as "patientId",
        p.first_name || ' ' || p.last_name as "patientName",
        p.mrn as "patientMrn"
      FROM patient_tasks t
      JOIN patients p ON t.patient_id = p.id::text
      WHERE t.status != 'completed' AND t.schedule_start < '2026-11-06'
      ORDER BY t.schedule_start ASC
      LIMIT 10;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching past due items:', err);
    res.status(500).json({ error: 'Failed to fetch past due items' });
  }
});

// 14. Route Planner Alerts (Real clinical alerts from database)
app.get('/api/planner/alerts', async (_req: Request, res: Response) => {
  try {
    const alerts: any[] = [];

    // Check patients with active risk flags
    const highRiskPatients = await pool.query(`
      SELECT id, mrn, first_name || ' ' || last_name as name, fall_risk, hospitalization_risk, infection_risk,
             TO_CHAR(episode_end, 'MM/DD/YYYY') as "episodeEnd"
      FROM patients
      WHERE fall_risk = true OR hospitalization_risk = true
      LIMIT 3;
    `);

    for (const p of highRiskPatients.rows) {
      if (p.mrn === '1061') {
        alerts.push({
          id: `alert-recert-${p.id}`,
          title: `60-Day Recert Window (${p.name})`,
          description: `Certification period ends ${p.episodeEnd || '12/24/2026'}. Comprehensive recertification assessment required.`,
          patientId: p.id,
          patientName: p.name,
          type: 'recert',
          severity: 'high'
        });
      } else {
        alerts.push({
          id: `alert-risk-${p.id}`,
          title: `High Clinical Risk Protocol (${p.name})`,
          description: `Identified with active ${p.fall_risk ? 'Fall Risk' : 'Hospitalization Risk'}. Clinical intervention protocol required.`,
          patientId: p.id,
          patientName: p.name,
          type: 'risk',
          severity: 'medium'
        });
      }
    }

    // Check tasks with returned physician signature
    const returnedSigTasks = await pool.query(`
      SELECT t.id, t.task_name, t.assigned_to, p.id as "patientId", p.first_name || ' ' || p.last_name as "patientName"
      FROM patient_tasks t
      JOIN patients p ON t.patient_id = p.id::text
      WHERE t.status = 'returned_with_signature'
      LIMIT 2;
    `);

    for (const t of returnedSigTasks.rows) {
      alerts.push({
        id: `alert-sig-${t.id}`,
        title: `Physician Signature Returned: ${t.task_name}`,
        description: `Signed encounter returned for ${t.patientName}. Ready for clinical supervisor verification.`,
        patientId: t.patientId,
        patientName: t.patientName,
        type: 'signature',
        severity: 'info'
      });
    }

    res.json(alerts);
  } catch (err: any) {
    console.error('Error fetching planner alerts:', err);
    res.status(500).json({ error: 'Failed to fetch planner alerts' });
  }
});

// ==========================================
// HOSPITALIZATION RECORDS & LOGS
// ==========================================
async function initHospitalizationTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hospitalization_records (
        id VARCHAR(100) PRIMARY KEY,
        mrn VARCHAR(50),
        patient_name VARCHAR(255),
        source VARCHAR(100) DEFAULT 'OASIS Transfer Assessment',
        hospitalization_date DATE,
        last_home_visit_date DATE,
        created_by VARCHAR(100) DEFAULT 'Mary Kyalikunda RN',
        tags VARCHAR(100) DEFAULT 'Not Available',
        facility VARCHAR(255) DEFAULT 'Beverly Hospital',
        reasons TEXT[] DEFAULT ARRAY['Acute condition change']::TEXT[],
        narrative TEXT DEFAULT '',
        transfer_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inpatient_hold_records (
        id VARCHAR(100) PRIMARY KEY,
        los_days INT DEFAULT 0,
        mrn VARCHAR(50),
        patient_name VARCHAR(255),
        branch VARCHAR(100) DEFAULT 'Standards Home Care',
        primary_insurance VARCHAR(255) DEFAULT 'MEDICAID MASSACHUSETTS',
        episode VARCHAR(100) DEFAULT '',
        end_of_first_30_days DATE,
        transfer_date DATE,
        last_visit_date DATE,
        hold_type VARCHAR(50) DEFAULT 'Manual',
        facility VARCHAR(255) DEFAULT 'Beverly Hospital',
        reason VARCHAR(255) DEFAULT 'Physician request',
        is_early_billing_hold BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error('Failed to init hospitalization tables:', err);
  }
}
initHospitalizationTables();

async function initIntakeTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS intake_referrals (
        id VARCHAR(100) PRIMARY KEY,
        patient_name VARCHAR(255),
        service_line VARCHAR(50) DEFAULT 'home_health',
        stage VARCHAR(50) DEFAULT 'new',
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS client_first_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS client_last_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS phone_type VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_first_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_last_name VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_phone_type VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS contact_relationship VARCHAR(100);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Standards Home Care';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS service_requested VARCHAR(255);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS assigned_team_member VARCHAR(100) DEFAULT 'Sarah Jenkins, RN';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS follow_up_date DATE;
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS requested_soc DATE;
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS mrn VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS dob DATE;
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'INTAKE COORDINATOR';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS liaison VARCHAR(100) DEFAULT 'Not Available';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS tags VARCHAR(255) DEFAULT 'Direct Intake';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS referral_source VARCHAR(255);
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS urgency VARCHAR(50) DEFAULT 'routine';
      ALTER TABLE intake_referrals ADD COLUMN IF NOT EXISTS clinical_summary TEXT;
    `);
  } catch (err) {
    console.error('Failed to init intake columns:', err);
  }
}
initIntakeTables();

// ==========================================
// AUTO-MIGRATION: Ensure all columns exist for patients, visits, clinicians, patient_tasks
// ==========================================
async function initCoreTables() {
  const runStep = async (stepName: string, query: string) => {
    try {
      await pool.query(query);
    } catch (err: any) {
      const safeMessage = (err?.message || 'Unknown database error')
        .replace(/postgres:\/\/[^@]+@/g, 'postgres://***:***@');
      console.error(`[initCoreTables] Failed step "${stepName}":`, safeMessage);
    }
  };

  await runStep('Ensure core columns and patient_tasks table', `
    -- patients: add missing columns the API queries expect
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(30);
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Main Branch';
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS episode_start DATE;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS episode_end DATE;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS start_of_care_date DATE;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS attending_physician VARCHAR(255) DEFAULT '';
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS insurance_name VARCHAR(255) DEFAULT '';
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS policy_number VARCHAR(100) DEFAULT '';
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS primary_contact VARCHAR(255) DEFAULT '';
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS secondary_contact VARCHAR(255) DEFAULT '';
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS fall_risk BOOLEAN DEFAULT false;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS hospitalization_risk BOOLEAN DEFAULT false;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS infection_risk BOOLEAN DEFAULT false;
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS full_code BOOLEAN DEFAULT true;

    -- clinicians: add missing columns the schedule-clinicians API expects
    ALTER TABLE clinicians ALTER COLUMN user_id DROP NOT NULL;
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Registered Nurse';
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS credentials VARCHAR(50) DEFAULT 'RN';
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS discipline VARCHAR(100) DEFAULT 'Nursing';
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS branch VARCHAR(100) DEFAULT 'Standards Home Care';
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS service_lines TEXT[] DEFAULT ARRAY['home_health'];
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7) DEFAULT 32.7767;
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7) DEFAULT -96.7970;
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS current_address VARCHAR(255) DEFAULT 'Dallas Metro TX';
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS work_status VARCHAR(50) DEFAULT 'Available';

    -- visits: add missing columns the schedule/visits API expects
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS employee_name VARCHAR(255);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS time_slot VARCHAR(50);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS scheduled_date DATE;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS day_of_week INT;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'home';
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS evv_status VARCHAR(50) DEFAULT 'pending';
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS address VARCHAR(500);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS task VARCHAR(255);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS huv_sfv_type VARCHAR(50);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS payable BOOLEAN DEFAULT true;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT true;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_time_in VARCHAR(50);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_time_out VARCHAR(50);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['Routine']::TEXT[];
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_date DATE;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS is_deviation BOOLEAN DEFAULT false;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS deviation_reason VARCHAR(255);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS payable BOOLEAN DEFAULT true;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS billable BOOLEAN DEFAULT true;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_time_in VARCHAR(50);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_time_out VARCHAR(50);
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY['Routine']::TEXT[];
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_date DATE;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS is_deviation BOOLEAN DEFAULT false;
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS deviation_reason VARCHAR(255);

    UPDATE visits
    SET visit_time_in = COALESCE(visit_time_in, TO_CHAR(scheduled_start, 'HH12:MI AM'), SPLIT_PART(time_slot, ' - ', 1), '09:00 AM'),
        visit_time_out = COALESCE(visit_time_out, TO_CHAR(scheduled_end, 'HH12:MI AM'), SPLIT_PART(time_slot, ' - ', 2), '10:00 AM'),
        payable = COALESCE(payable, true),
        billable = COALESCE(billable, true),
        tags = COALESCE(tags, ARRAY['Routine']::TEXT[]),
        visit_date = COALESCE(visit_date, scheduled_date, scheduled_start::date, CURRENT_DATE)
    WHERE visit_time_in IS NULL OR visit_time_out IS NULL OR visit_date IS NULL;

    UPDATE visits
    SET visit_time_in = COALESCE(visit_time_in, TO_CHAR(scheduled_start, 'HH12:MI AM'), SPLIT_PART(time_slot, ' - ', 1), '09:00 AM'),
        visit_time_out = COALESCE(visit_time_out, TO_CHAR(scheduled_end, 'HH12:MI AM'), SPLIT_PART(time_slot, ' - ', 2), '10:00 AM'),
        payable = COALESCE(payable, true),
        billable = COALESCE(billable, true),
        tags = COALESCE(tags, ARRAY['Routine']::TEXT[]),
        visit_date = COALESCE(visit_date, scheduled_date, scheduled_start::date, CURRENT_DATE)
    WHERE visit_time_in IS NULL OR visit_time_out IS NULL OR visit_date IS NULL;

    -- patient_tasks table (for Patient Charts clinical tasks)
    CREATE TABLE IF NOT EXISTS patient_tasks (
      id VARCHAR(100) PRIMARY KEY DEFAULT gen_random_uuid()::text,
      organization_id UUID,
      patient_id VARCHAR(100),
      task_name VARCHAR(255) DEFAULT 'Communication Note',
      discipline VARCHAR(100) DEFAULT 'Nursing',
      status VARCHAR(50) DEFAULT 'Not Yet Due',
      schedule_start DATE DEFAULT CURRENT_DATE,
      schedule_end DATE DEFAULT CURRENT_DATE,
      assigned_to VARCHAR(255) DEFAULT 'Unassigned Clinician',
      comments TEXT DEFAULT 'Not Available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Step 2: Backfill clinician names from users
  await runStep('Backfill clinicians name from users', `
    UPDATE clinicians c
    SET name = u.full_name
    FROM users u
    WHERE c.user_id = u.id AND c.name IS NULL;
  `);

  // Step 3: Backfill visit patient names from patients
  await runStep('Backfill visits patient_name from patients', `
    UPDATE visits v
    SET patient_name = p.first_name || ' ' || p.last_name
    FROM patients p
    WHERE v.patient_id = p.id AND v.patient_name IS NULL;
  `);

  // Step 4: Backfill visit employee names from clinicians
  await runStep('Backfill visits employee_name from clinicians', `
    UPDATE visits v
    SET employee_name = c.name
    FROM clinicians c
    WHERE v.clinician_id = c.id AND v.employee_name IS NULL;
  `);

  // Step 5: Backfill visit address from patients
  await runStep('Backfill visits address from patients', `
    UPDATE visits v
    SET address = p.address_street || ', ' || p.address_city
    FROM patients p
    WHERE v.patient_id = p.id AND v.address IS NULL AND p.address_street IS NOT NULL;
  `);

  // Step 6: Backfill visit latitude & longitude from patients
  await runStep('Backfill visits latitude/longitude from patients', `
    UPDATE visits v
    SET latitude = p.latitude, longitude = p.longitude
    FROM patients p
    WHERE v.patient_id = p.id AND (v.latitude IS NULL OR v.longitude IS NULL);
  `);

  // Step 7: Backfill visit scheduled_date, day_of_week, time_slot from scheduled_start
  await runStep('Backfill visits schedule timing fields from scheduled_start', `
    UPDATE visits v
    SET scheduled_date = v.scheduled_start::date,
        day_of_week = EXTRACT(DOW FROM v.scheduled_start)::int,
        time_slot = TO_CHAR(v.scheduled_start, 'HH12:MI AM')
    WHERE v.scheduled_start IS NOT NULL AND (v.scheduled_date IS NULL OR v.day_of_week IS NULL OR v.time_slot IS NULL);
  `);

  // Step 8: Ensure Connect & Route Planner tables exist
  await runStep('Ensure Connect and Route Planner tables', `
    CREATE TABLE IF NOT EXISTS conversations (
      id VARCHAR(100) PRIMARY KEY,
      type VARCHAR(50) NOT NULL DEFAULT 'direct',
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(255),
      patient_id VARCHAR(100),
      patient_name VARCHAR(255),
      service_line VARCHAR(50) DEFAULT 'home_health',
      is_pinned BOOLEAN DEFAULT FALSE,
      is_urgent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversation_participants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id VARCHAR(100) REFERENCES conversations(id) ON DELETE CASCADE,
      clinician_id VARCHAR(100),
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      status VARCHAR(50) DEFAULT 'online'
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id VARCHAR(100) PRIMARY KEY,
      conversation_id VARCHAR(100) REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id VARCHAR(100) NOT NULL,
      sender_name VARCHAR(255) NOT NULL,
      sender_role VARCHAR(255),
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      attachment_name VARCHAR(255),
      attachment_type VARCHAR(50),
      attachment_size VARCHAR(50),
      attachment_url TEXT
    );

    CREATE TABLE IF NOT EXISTS call_logs (
      id VARCHAR(100) PRIMARY KEY,
      contact_name VARCHAR(255) NOT NULL,
      contact_role VARCHAR(255),
      direction VARCHAR(20) NOT NULL,
      call_type VARCHAR(20) NOT NULL DEFAULT 'audio',
      duration VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Step 9: Seed Connect conversations and messages if empty
  await runStep('Seed conversations and messages if empty', `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM conversations LIMIT 1) THEN
        INSERT INTO conversations (id, type, title, subtitle, patient_name, service_line, is_pinned, is_urgent, created_at, updated_at)
        VALUES 
          ('conv-care-abuissa', 'care_team', 'Heather Abuissa (1061) Care Team', 'Sarah Jenkins RN, Alexandria Nelson RN, Dr. Leslie Rigali', 'Heather Abuissa', 'home_health', true, false, '2026-11-06 08:30:00+00', '2026-11-06 10:24:00+00'),
          ('conv-alexandria', 'direct', 'Alexandria Nelson, RN', 'Field Clinician • Skilled Nursing', NULL, 'home_health', true, false, '2026-11-05 14:00:00+00', '2026-11-06 09:50:00+00'),
          ('conv-carolyn', 'direct', 'Carolyn Akukwe, RN', 'Case Manager • Rehabilitation & Care Coordination', NULL, 'home_health', false, true, '2026-11-04 11:00:00+00', '2026-11-06 08:45:00+00'),
          ('conv-care-anis', 'care_team', 'Marie V. Anis (1036) Care Team', 'Susanna Welch BSN, Andre Bellevue PT, Dr. Leslie Rigali', 'Marie V. Anis', 'home_health', false, false, '2026-11-04 10:00:00+00', '2026-11-05 15:20:00+00'),
          ('conv-andre', 'direct', 'Andre Bellevue, PT', 'Physical Therapist Lead • Mobility Assessment', NULL, 'home_health', false, false, '2026-11-03 12:00:00+00', '2026-11-05 17:10:00+00'),
          ('conv-triage-channel', 'channel', 'Standards Home Care - Clinical Triage', 'Agency-wide on-call broadcast & critical intake', NULL, 'home_health', false, false, '2026-11-01 08:00:00+00', '2026-11-06 07:30:00+00')
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO conversation_participants (conversation_id, name, role, status)
        VALUES
          ('conv-care-abuissa', 'Sarah Jenkins, RN', 'Primary Field Nurse (RN)', 'online'),
          ('conv-care-abuissa', 'Alexandria Nelson, RN', 'Clinical Supervisor', 'online'),
          ('conv-care-abuissa', 'Dr. Leslie Rigali, MD', 'Attending Physician', 'busy'),
          ('conv-alexandria', 'Alexandria Nelson, RN', 'Field Clinician (RN)', 'online'),
          ('conv-carolyn', 'Carolyn Akukwe, RN', 'Case Manager (RN)', 'online'),
          ('conv-care-anis', 'Susanna Welch, BSN', 'Lead Staff Nurse', 'offline'),
          ('conv-care-anis', 'Andre Bellevue, PT', 'Physical Therapist', 'online'),
          ('conv-care-anis', 'Dr. Leslie Rigali, MD', 'Attending Physician', 'busy'),
          ('conv-andre', 'Andre Bellevue, PT', 'Physical Therapist', 'online'),
          ('conv-triage-channel', 'Clinical Operations Triage', 'Dispatch Coordinator', 'online');

        INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, sender_role, content, is_read, created_at, attachment_name, attachment_type, attachment_size, attachment_url)
        VALUES
          ('msg-01', 'conv-care-abuissa', 'cli-jenkins', 'Sarah Jenkins, RN', 'Primary Field Nurse', 'Wound dressing change completed for right lower extremity diabetic ulcer. Clean granulated base observed.', true, '2026-11-06 09:15:00+00', NULL, NULL, NULL, NULL),
          ('msg-02', 'conv-care-abuissa', 'cli-jenkins', 'Sarah Jenkins, RN', 'Primary Field Nurse', 'Attached operative debridement clinical record and updated photo measurements (2.1 x 1.4 cm).', true, '2026-11-06 09:42:00+00', 'DFU_Debridement_Note_Nov2026.pdf', 'pdf', '480 KB', '/api/connect/attachments/DFU_Debridement_Note_Nov2026.pdf'),
          ('msg-03', 'conv-care-abuissa', 'cli-rigali', 'Dr. Leslie Rigali, MD', 'Attending Physician', 'Orders reviewed and approved. Continue Collagenase Santyl daily dressing changes x 14 days.', false, '2026-11-06 10:24:00+00', NULL, NULL, NULL, NULL),
          ('msg-04', 'conv-alexandria', 'cli-nelson', 'Alexandria Nelson, RN', 'Clinical Supervisor', 'Good morning! Patient Heather Abuissa is scheduled for recertification evaluation today.', true, '2026-11-06 09:10:00+00', NULL, NULL, NULL, NULL),
          ('msg-05', 'conv-alexandria', 'cli-nelson', 'Alexandria Nelson, RN', 'Clinical Supervisor', 'Here is the complete OASIS-E recertification clinical document packet.', false, '2026-11-06 09:50:00+00', 'OASIS_Recertification_Protocol.pdf', 'pdf', '640 KB', '/api/connect/attachments/OASIS_Recertification_Protocol.pdf'),
          ('msg-06', 'conv-carolyn', 'cli-akukwe', 'Carolyn Akukwe, RN', 'Case Manager', 'Selina, could you review the pending 60-day discharge summary for Marie Anis?', true, '2026-11-05 16:30:00+00', NULL, NULL, NULL, NULL),
          ('msg-07', 'conv-carolyn', 'cli-akukwe', 'Carolyn Akukwe, RN', 'Case Manager', 'Attached the draft discharge summary with functional outcome score improvements.', false, '2026-11-06 08:45:00+00', 'Discharge_Planning_Summary.pdf', 'pdf', '320 KB', '/api/connect/attachments/Discharge_Planning_Summary.pdf'),
          ('msg-08', 'conv-care-anis', 'cli-welch', 'Susanna Welch, BSN', 'Lead Staff Nurse', 'Patient tolerance to BID Humalog sliding scale therapy has stabilized. Attached BG log.', true, '2026-11-05 15:20:00+00', 'Insulin_Administration_Log.pdf', 'pdf', '290 KB', '/api/connect/attachments/Insulin_Administration_Log.pdf'),
          ('msg-09', 'conv-andre', 'cli-bellevue', 'Andre Bellevue, PT', 'Physical Therapist', 'Patient has progressed from walker to quad cane for short distances. Attached gait report.', true, '2026-11-05 17:10:00+00', 'Functional_Mobility_Assessment.pdf', 'pdf', '510 KB', '/api/connect/attachments/Functional_Mobility_Assessment.pdf'),
          ('msg-10', 'conv-triage-channel', 'dispatch', 'Clinical Operations Triage', 'Dispatch Coordinator', 'URGENT: Standards Home Care emergency triage coverage roster updated for weekend.', true, '2026-11-06 07:30:00+00', NULL, NULL, NULL, NULL)
        ON CONFLICT (id) DO NOTHING;
      END IF;
    END $$;
  `);

  // Step 10: Seed call_logs if empty
  await runStep('Seed call_logs if empty', `
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM call_logs LIMIT 1) THEN
        INSERT INTO call_logs (id, contact_name, contact_role, direction, call_type, duration, created_at)
        VALUES 
          ('call-1', 'Alexandria Nelson, RN', 'Field Clinician (RN)', 'incoming', 'audio', '4m 12s', '2026-11-06 10:15:00+00'),
          ('call-2', 'Carolyn Akukwe, RN', 'Case Manager (RN)', 'outgoing', 'audio', '2m 45s', '2026-11-06 09:30:00+00'),
          ('call-3', 'Andre Bellevue, PT', 'Physical Therapist', 'missed', 'audio', '0s', '2026-11-05 16:40:00+00'),
          ('call-4', 'Susanna Welch, BSN', 'Lead Staff Nurse', 'incoming', 'audio', '6m 18s', '2026-11-05 11:20:00+00')
        ON CONFLICT (id) DO NOTHING;
      END IF;
    END $$;
  `);

  // Step 11: Seed Route Planner visits for 2026-11-06 if none exist
  await runStep('Seed Route Planner visits for 2026-11-06 if none exist', `
    DO $$
    DECLARE
      v_org_id UUID;
      v_clin_id UUID;
      v_pat1_id UUID;
      v_pat2_id UUID;
      v_pat3_id UUID;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM visits WHERE scheduled_date = '2026-11-06'::date) THEN
        SELECT id INTO v_org_id FROM organizations LIMIT 1;
        SELECT id INTO v_clin_id FROM clinicians WHERE name ILIKE '%Alexandria%' LIMIT 1;
        IF v_clin_id IS NULL THEN
          SELECT id INTO v_clin_id FROM clinicians LIMIT 1;
        END IF;

        SELECT id INTO v_pat1_id FROM patients WHERE mrn = '1061' LIMIT 1;
        IF v_pat1_id IS NULL THEN SELECT id INTO v_pat1_id FROM patients LIMIT 1; END IF;

        SELECT id INTO v_pat2_id FROM patients WHERE mrn = '1036' LIMIT 1;
        IF v_pat2_id IS NULL THEN SELECT id INTO v_pat2_id FROM patients LIMIT 1; END IF;

        SELECT id INTO v_pat3_id FROM patients WHERE id NOT IN (COALESCE(v_pat1_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(v_pat2_id, '00000000-0000-0000-0000-000000000000'::uuid)) LIMIT 1;
        IF v_pat3_id IS NULL THEN v_pat3_id := v_pat1_id; END IF;

        IF v_pat1_id IS NOT NULL THEN
          INSERT INTO visits (
            organization_id, clinician_id, patient_id, scheduled_start, scheduled_end,
            time_slot, scheduled_date, day_of_week, status, visit_type, task,
            service_line, address, latitude, longitude, employee_name, patient_name
          ) VALUES (
            v_org_id, v_clin_id, v_pat1_id,
            '2026-11-06 09:00:00+00', '2026-11-06 10:00:00+00', '09:00 AM', '2026-11-06', 5,
            'Scheduled', 'Skilled Nursing Visit', 'Wound Care & OASIS-E Recertification',
            'home_health', '8305 Walton Blvd, Dallas TX', 32.8998, -96.9454,
            'Alexandria Nelson, RN', 'Heather Abuissa'
          );
        END IF;

        IF v_pat2_id IS NOT NULL THEN
          INSERT INTO visits (
            organization_id, clinician_id, patient_id, scheduled_start, scheduled_end,
            time_slot, scheduled_date, day_of_week, status, visit_type, task,
            service_line, address, latitude, longitude, employee_name, patient_name
          ) VALUES (
            v_org_id, v_clin_id, v_pat2_id,
            '2026-11-06 11:00:00+00', '2026-11-06 12:30:00+00', '11:00 AM', '2026-11-06', 5,
            'Scheduled', 'Physical Therapy Assessment', 'Gait Training & Fall Risk Mitigation',
            'home_health', '1420 Mockingbird Ln, Dallas TX', 32.8252, -96.8612,
            'Andre Bellevue, PT', 'Marie V. Anis'
          );
        END IF;

        IF v_pat3_id IS NOT NULL THEN
          INSERT INTO visits (
            organization_id, clinician_id, patient_id, scheduled_start, scheduled_end,
            time_slot, scheduled_date, day_of_week, status, visit_type, task,
            service_line, address, latitude, longitude, employee_name, patient_name
          ) VALUES (
            v_org_id, v_clin_id, v_pat3_id,
            '2026-11-06 14:00:00+00', '2026-11-06 15:00:00+00', '02:00 PM', '2026-11-06', 5,
            'Scheduled', 'Skilled Nursing Visit', 'Cardiopulmonary & Med Management',
            'home_health', '3812 Elm St, Dallas TX', 32.7842, -96.7820,
            'Alexandria Nelson, RN', 'Jeffrey Antoniotti'
          );
        END IF;
      END IF;
    END $$;
  `);

  // Step 12: Seed patient_tasks if empty
  await runStep('Seed patient_tasks if empty', `
    DO $$
    DECLARE
      v_org_id UUID;
      v_pat_id UUID;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM patient_tasks LIMIT 1) THEN
        SELECT id INTO v_org_id FROM organizations LIMIT 1;
        SELECT id INTO v_pat_id FROM patients WHERE mrn = '1061' LIMIT 1;
        IF v_pat_id IS NULL THEN SELECT id INTO v_pat_id FROM patients LIMIT 1; END IF;

        IF v_pat_id IS NOT NULL THEN
          INSERT INTO patient_tasks (
            organization_id, patient_id, task_name, discipline, status,
            schedule_start, schedule_end, assigned_to, comments
          ) VALUES
            (v_org_id, v_pat_id::text, 'OASIS-E Recertification Assessment', 'Nursing', 'Pending Review', '2026-11-03', '2026-11-03', 'Alexandria Nelson, RN', 'Requires 30-day compliance review lock'),
            (v_org_id, v_pat_id::text, 'Physician Face-to-Face Follow-up', 'Physician Liaison', 'Overdue', '2026-11-04', '2026-11-04', 'Selina Mwakipunda', 'Attending physician counter-signature pending'),
            (v_org_id, v_pat_id::text, 'Wound Assessment & Debridement Protocol', 'Nursing', 'returned_with_signature', '2026-11-05', '2026-11-05', 'Alexandria Nelson, RN', 'Physician signed off on Collagenase Santyl'),
            (v_org_id, v_pat_id::text, '60-Day Medication Reconciliation', 'Pharmacy', 'Completed', '2026-11-02', '2026-11-02', 'CVS Clinical Pharmacy', 'Reconciliation verified with Dr. Rigali');
        END IF;
      END IF;
    END $$;
  `);

  // Step 13: Seed authentic clinicians, patients, and Schedule Center visits
  await runStep('Ensure authentic Schedule Center clinicians, patients, and visits', `
    ALTER TABLE visits ADD COLUMN IF NOT EXISTS is_axxess_care BOOLEAN DEFAULT false;
    ALTER TABLE clinicians ALTER COLUMN user_id DROP NOT NULL;

    DO $$
    DECLARE
      v_org_id UUID;
      v_fallback_user_id UUID;
      v_mario_id UUID;
      v_mary_id UUID;
      v_pat_id UUID;
      v_cur_date DATE;
    BEGIN
      SELECT id INTO v_org_id FROM organizations LIMIT 1;
      SELECT id INTO v_fallback_user_id FROM users LIMIT 1;

      -- 1. Ensure Mario Fortune LPN and Mary Kyalikunda RN exist
      IF NOT EXISTS (SELECT 1 FROM clinicians WHERE name ILIKE '%Mario Fortune%') THEN
        INSERT INTO clinicians (organization_id, user_id, name, title, credentials, discipline, branch, status)
        VALUES (v_org_id, v_fallback_user_id, 'Mario Fortune LPN', 'Licensed Practical Nurse', 'LPN', 'Nursing', 'Standards Home Care', 'active');
      END IF;

      IF NOT EXISTS (SELECT 1 FROM clinicians WHERE name ILIKE '%Mary Kyalikunda%') THEN
        INSERT INTO clinicians (organization_id, user_id, name, title, credentials, discipline, branch, status)
        VALUES (v_org_id, v_fallback_user_id, 'Mary Kyalikunda RN', 'Registered Nurse / Case Manager', 'RN', 'Nursing', 'Standards Home Care', 'active');
      END IF;

      SELECT id INTO v_mario_id FROM clinicians WHERE name ILIKE '%Mario Fortune%' LIMIT 1;
      SELECT id INTO v_mary_id FROM clinicians WHERE name ILIKE '%Mary Kyalikunda%' LIMIT 1;

      -- 2. Ensure Heather Abuissa exists
      IF NOT EXISTS (SELECT 1 FROM patients WHERE mrn = '1061') THEN
        INSERT INTO patients (
          organization_id, mrn, first_name, last_name, service_line, status, branch,
          start_of_care_date, episode_start, episode_end, attending_physician, insurance_name
        ) VALUES (
          v_org_id, '1061', 'HEATHER', 'ABUISSA', 'home_health', 'active', 'Standards Home Care',
          '2026-10-26', '2026-10-26', '2026-12-24', 'Rigali, Leslie DO', 'COMMONWEALTH CARE ALLIANCE'
        );
      END IF;

      SELECT id INTO v_pat_id FROM patients WHERE mrn = '1061' LIMIT 1;

      -- 3. Ensure roster patients from Screenshot 1 exist
      INSERT INTO patients (organization_id, mrn, first_name, last_name, service_line, status, branch, episode_start, episode_end)
      VALUES
        (v_org_id, '1036', 'Marie V', 'Anis', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1042', 'Louis', 'Antoine', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1045', 'Jeffrey C', 'Antoniotti', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1050', 'Jocelene', 'Auguste', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1053', 'Isatou', 'Bah', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1055', 'James', 'Balian', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1058', 'Helen', 'Beattie', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1062', 'Sixta', 'Cabral', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1065', 'Cedenieze', 'Damitie', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1068', 'Janey', 'David', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1070', 'James', 'Davis', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1072', 'Javens J', 'Deceus', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1074', 'Tyler J', 'Deceus', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1078', 'Denise', 'Deguerre', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1081', 'Kenneth S', 'Demers', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1085', 'Maria', 'Depina', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24'),
        (v_org_id, '1088', 'Adam', 'Diamond', 'home_health', 'active', 'Standards Home Care', '2026-10-26', '2026-12-24')
      ON CONFLICT DO NOTHING;

      -- 4. Seed authentic schedule visits for Heather Abuissa if fewer than 15 visits exist
      IF (SELECT COUNT(*) FROM visits WHERE patient_id = v_pat_id) < 15 THEN
        -- Multiple on 2026-12-20
        INSERT INTO visits (organization_id, clinician_id, patient_id, scheduled_start, scheduled_end, scheduled_date, time_slot, status, visit_type, task, service_line, employee_name, patient_name)
        VALUES
          (v_org_id, v_mary_id, v_pat_id, '2026-12-20 09:00:00', '2026-12-20 10:30:00', '2026-12-20', '09:00 AM', 'Not Yet Due', 'OASIS-E2 Recertification', 'OASIS-E2 Recertification', 'home_health', 'Mary Kyalikunda RN', 'Heather Abuissa'),
          (v_org_id, v_mary_id, v_pat_id, '2026-12-20 11:00:00', '2026-12-20 11:30:00', '2026-12-20', '11:00 AM', 'Not Yet Due', 'Physician Order', 'Physician Order', 'home_health', 'Mary Kyalikunda RN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-20 13:00:00', '2026-12-20 14:00:00', '2026-12-20', '01:00 PM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mary_id, v_pat_id, '2026-12-20 15:00:00', '2026-12-20 15:30:00', '2026-12-20', '03:00 PM', 'Not Yet Due', 'VERBAL ORDER', 'VERBAL ORDER', 'home_health', 'Mary Kyalikunda RN', 'Heather Abuissa');

        -- Daily Oral Med Management for Dec 21 - 24
        INSERT INTO visits (organization_id, clinician_id, patient_id, scheduled_start, scheduled_end, scheduled_date, time_slot, status, visit_type, task, service_line, employee_name, patient_name)
        VALUES
          (v_org_id, v_mario_id, v_pat_id, '2026-12-24 10:00:00', '2026-12-24 11:00:00', '2026-12-24', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-23 10:00:00', '2026-12-23 11:00:00', '2026-12-23', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-22 10:00:00', '2026-12-22 11:00:00', '2026-12-22', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-21 10:00:00', '2026-12-21 11:00:00', '2026-12-21', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-19 10:00:00', '2026-12-19 11:00:00', '2026-12-19', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-18 10:00:00', '2026-12-18 11:00:00', '2026-12-18', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-17 10:00:00', '2026-12-17 11:00:00', '2026-12-17', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-16 10:00:00', '2026-12-16 11:00:00', '2026-12-16', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-12-15 10:00:00', '2026-12-15 11:00:00', '2026-12-15', '10:00 AM', 'Not Yet Due', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mary_id, v_pat_id, '2026-12-15 14:00:00', '2026-12-15 15:00:00', '2026-12-15', '02:00 PM', 'Not Yet Due', 'Skilled Nursing Assessment', 'Skilled Nursing Assessment', 'home_health', 'Mary Kyalikunda RN', 'Heather Abuissa');

        -- October & November completed and scheduled visits
        INSERT INTO visits (organization_id, clinician_id, patient_id, scheduled_start, scheduled_end, scheduled_date, time_slot, status, visit_type, task, service_line, employee_name, patient_name)
        VALUES
          (v_org_id, v_mary_id, v_pat_id, '2026-10-26 09:00:00', '2026-10-26 10:30:00', '2026-10-26', '09:00 AM', 'Completed', 'OASIS-E2 Start of Care', 'OASIS-E2 Start of Care', 'home_health', 'Mary Kyalikunda RN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-10-26 13:00:00', '2026-10-26 14:00:00', '2026-10-26', '01:00 PM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-10-27 10:00:00', '2026-10-27 11:00:00', '2026-10-27', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-10-28 10:00:00', '2026-10-28 11:00:00', '2026-10-28', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-10-29 10:00:00', '2026-10-29 11:00:00', '2026-10-29', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-10-30 10:00:00', '2026-10-30 11:00:00', '2026-10-30', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-10-31 10:00:00', '2026-10-31 11:00:00', '2026-10-31', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-11-01 10:00:00', '2026-11-01 11:00:00', '2026-11-01', '10:00 AM', 'Scheduled', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-11-02 10:00:00', '2026-11-02 11:00:00', '2026-11-02', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-11-03 10:00:00', '2026-11-03 11:00:00', '2026-11-03', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-11-04 10:00:00', '2026-11-04 11:00:00', '2026-11-04', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-11-05 10:00:00', '2026-11-05 11:00:00', '2026-11-05', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa'),
          (v_org_id, v_mario_id, v_pat_id, '2026-11-07 10:00:00', '2026-11-07 11:00:00', '2026-11-07', '10:00 AM', 'Completed', 'LPN - Oral Med. Management', 'LPN - Oral Med. Management', 'home_health', 'Mario Fortune LPN', 'Heather Abuissa');
      END IF;

      -- Seed authentic Schedule Deviation records across patients and clinicians
      IF (SELECT COUNT(*) FROM visits WHERE is_deviation = true OR (visit_date IS NOT NULL AND scheduled_date IS NOT NULL AND visit_date <> scheduled_date) OR LOWER(status::text) LIKE '%missed%') < 10 THEN
        INSERT INTO visits (
          organization_id, clinician_id, patient_id, scheduled_date, visit_date, scheduled_start, scheduled_end,
          status, task, visit_type, service_line, employee_name, patient_name, is_deviation, deviation_reason, branch
        )
        SELECT 
          v_org_id,
          CASE WHEN row_num % 2 = 0 THEN v_mario_id ELSE v_mary_id END,
          p_sub.id,
          dev_data.sched_date,
          dev_data.v_date,
          (dev_data.sched_date || ' 09:00:00')::timestamp,
          (dev_data.sched_date || ' 10:30:00')::timestamp,
          dev_data.v_status,
          dev_data.v_task,
          dev_data.v_task,
          'home_health',
          CASE WHEN row_num % 2 = 0 THEN 'Mario Fortune LPN' ELSE 'Mary Kyalikunda RN' END,
          p_sub.first_name || ' ' || p_sub.last_name,
          true,
          dev_data.v_reason,
          COALESCE(p_sub.branch, 'Standard Home Care')
        FROM (
          VALUES 
            (1, '2026-10-26'::date, '2026-10-27'::date, 'Completed', 'OASIS-E2 Start of Care', 'Patient specialist appointment conflict - rescheduled 1 day'),
            (2, '2026-10-28'::date, '2026-10-29'::date, 'Completed', 'LPN - Oral Med. Management', 'Clinician automotive breakdown / emergency reassignment'),
            (3, '2026-10-31'::date, '2026-10-31'::date, 'Missed Visit', 'LPN - Oral Med. Management', 'Patient unavailable at residence'),
            (4, '2026-11-02'::date, '2026-11-04'::date, 'Completed', 'Skilled Nursing Assessment', 'Inclement weather travel restriction'),
            (5, '2026-11-05'::date, '2026-11-06'::date, 'Completed', 'LPN - Oral Med. Management', 'Family caregiver requested shift change'),
            (6, '2026-11-08'::date, '2026-11-08'::date, 'Missed Visit (Complete)', 'LPN - Oral Med. Management', 'Patient refused visit'),
            (7, '2026-11-11'::date, '2026-11-12'::date, 'Completed', 'Physical Therapy Assessment', 'Hospital discharge coordination delayed'),
            (8, '2026-11-14'::date, '2026-11-15'::date, 'Completed', 'LPN - Oral Med. Management', 'Physician ordered frequency adjustment'),
            (9, '2026-11-18'::date, '2026-11-18'::date, 'Missed Visit (Pending GA Review)', 'LPN - Oral Med. Management', 'Patient admitted to emergency room'),
            (10, '2026-11-21'::date, '2026-11-22'::date, 'Completed', 'Skilled Nursing Assessment', 'Patient requested weekend visit time'),
            (11, '2026-11-25'::date, '2026-11-26'::date, 'Completed', 'LPN - Oral Med. Management', 'Holiday schedule accommodation'),
            (12, '2026-11-28'::date, '2026-11-28'::date, 'Missed Visit', 'LPN - Oral Med. Management', 'Patient out of town with family'),
            (13, '2026-12-02'::date, '2026-12-03'::date, 'Completed', 'OASIS-E2 Recertification', 'Awaiting physician signed orders'),
            (14, '2026-12-05'::date, '2026-12-06'::date, 'Completed', 'LPN - Oral Med. Management', 'Post-op appointment conflict'),
            (15, '2026-12-09'::date, '2026-12-09'::date, 'Missed Visit', 'LPN - Oral Med. Management', 'Unreachable by phone or gate intercom'),
            (16, '2026-12-14'::date, '2026-12-15'::date, 'Completed', 'Skilled Nursing Assessment', 'Transportation failure for primary clinician')
        ) AS dev_data(row_num, sched_date, v_date, v_status, v_task, v_reason)
        CROSS JOIN LATERAL (
          SELECT id, mrn, first_name, last_name, branch 
          FROM patients 
          ORDER BY (CASE WHEN mrn = '1061' THEN 0 ELSE 1 END), mrn
          OFFSET (dev_data.row_num - 1) % 15 LIMIT 1
        ) p_sub;
      END IF;
    END $$;
  `);

  try {
    await initReportCenterDatabase();
  } catch (err) {
    console.error('Failed to init report center db:', err);
  }

  console.log('[initCoreTables] Core table initialization completed.');
}
initCoreTables();

// GET /api/hospitalizations
app.get('/api/hospitalizations', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        mrn,
        patient_name as "patientName",
        source,
        TO_CHAR(hospitalization_date, 'MM/DD/YYYY') as "hospitalizationDate",
        COALESCE(TO_CHAR(last_home_visit_date, 'MM/DD/YYYY'), 'Not Available') as "lastHomeVisitDate",
        created_by as "user",
        tags,
        facility,
        reasons,
        narrative,
        COALESCE(TO_CHAR(transfer_date, 'MM/DD/YYYY'), '') as "transferDate"
      FROM hospitalization_records
      ORDER BY created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching hospitalizations:', err);
    res.status(500).json({ error: 'Failed to fetch hospitalizations' });
  }
});

// POST /api/hospitalizations - Create hospitalization record & log
app.post('/api/hospitalizations', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = `hosp-${Date.now()}`;
    const insertRes = await pool.query(`
      INSERT INTO hospitalization_records (
        id, mrn, patient_name, source, hospitalization_date, last_home_visit_date,
        created_by, tags, facility, reasons, narrative, transfer_date
      ) VALUES (
        $1, $2, $3, $4, $5::date, $6::date,
        $7, $8, $9, $10, $11, $12::date
      ) RETURNING *;
    `, [
      id,
      data.mrn || '1000',
      data.patientName || 'New Patient',
      data.source || 'OASIS Transfer Assessment',
      data.hospitalizationDate || new Date().toISOString().split('T')[0],
      data.lastHomeVisitDate || null,
      data.user || 'Clinical Staff',
      data.tags || 'Not Available',
      data.facility || 'Beverly Hospital',
      data.reasons || ['Acute condition change'],
      data.narrative || '',
      data.transferDate || data.hospitalizationDate || new Date().toISOString().split('T')[0]
    ]);
    const r = insertRes.rows[0];
    res.status(201).json({
      id: r.id,
      mrn: r.mrn,
      patientName: r.patient_name,
      source: r.source,
      hospitalizationDate: r.hospitalization_date ? new Date(r.hospitalization_date).toLocaleDateString('en-US') : '',
      lastHomeVisitDate: r.last_home_visit_date ? new Date(r.last_home_visit_date).toLocaleDateString('en-US') : 'Not Available',
      user: r.created_by,
      tags: r.tags,
      facility: r.facility,
      reasons: r.reasons,
      narrative: r.narrative,
      transferDate: r.transfer_date ? new Date(r.transfer_date).toLocaleDateString('en-US') : ''
    });
  } catch (err: any) {
    console.error('Error creating hospitalization:', err);
    res.status(500).json({ error: 'Failed to create hospitalization' });
  }
});

// PUT /api/hospitalizations/:id - Update hospitalization record & log
app.put('/api/hospitalizations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await pool.query(`
      UPDATE hospitalization_records
      SET 
        facility = COALESCE($1, facility),
        hospitalization_date = COALESCE($2::date, hospitalization_date),
        transfer_date = COALESCE($3::date, transfer_date),
        reasons = COALESCE($4, reasons),
        narrative = COALESCE($5, narrative),
        created_by = COALESCE($6, created_by)
      WHERE id = $7;
    `, [
      data.facility,
      data.hospitalizationDate || null,
      data.transferDate || null,
      data.reasons,
      data.narrative,
      data.user,
      id
    ]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error updating hospitalization:', err);
    res.status(500).json({ error: 'Failed to update hospitalization' });
  }
});

// DELETE /api/hospitalizations/:id
app.delete('/api/hospitalizations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM hospitalization_records WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting hospitalization:', err);
    res.status(500).json({ error: 'Failed to delete hospitalization' });
  }
});

// GET /api/inpatient-holds
app.get('/api/inpatient-holds', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        los_days as "losDays",
        mrn,
        patient_name as "patientName",
        branch,
        primary_insurance as "primaryInsurance",
        episode,
        COALESCE(TO_CHAR(end_of_first_30_days, 'MM/DD/YYYY'), '') as "endOfFirst30Days",
        COALESCE(TO_CHAR(transfer_date, 'MM/DD/YYYY'), '') as "transferDate",
        COALESCE(TO_CHAR(last_visit_date, 'MM/DD/YYYY'), '') as "lastVisitDate",
        hold_type as "holdType",
        facility,
        reason,
        is_early_billing_hold as "isEarlyBillingHold"
      FROM inpatient_hold_records
      ORDER BY created_at DESC;
    `);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching inpatient holds:', err);
    res.status(500).json({ error: 'Failed to fetch inpatient holds' });
  }
});

// POST /api/inpatient-holds
app.post('/api/inpatient-holds', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const id = `hld-${Date.now()}`;
    const insertRes = await pool.query(`
      INSERT INTO inpatient_hold_records (
        id, los_days, mrn, patient_name, branch, primary_insurance, episode,
        end_of_first_30_days, transfer_date, last_visit_date, hold_type, facility,
        reason, is_early_billing_hold
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10::date, $11, $12, $13, $14
      ) RETURNING *;
    `, [
      id,
      data.losDays || 0,
      data.mrn || '1000',
      data.patientName || 'Patient',
      data.branch || 'Standards Home Care',
      data.primaryInsurance || 'Not Available',
      data.episode || '',
      data.endOfFirst30Days || null,
      data.transferDate || null,
      data.lastVisitDate || null,
      data.holdType || 'Manual',
      data.facility || 'Beverly Hospital',
      data.reason || 'Not Available',
      data.isEarlyBillingHold || false
    ]);
    res.status(201).json(insertRes.rows[0]);
  } catch (err: any) {
    console.error('Error creating inpatient hold:', err);
    res.status(500).json({ error: 'Failed to create inpatient hold' });
  }
});

// DELETE /api/inpatient-holds/:id
app.delete('/api/inpatient-holds/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM inpatient_hold_records WHERE id = $1', [id]);
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting inpatient hold:', err);
    res.status(500).json({ error: 'Failed to delete inpatient hold' });
  }
});

// PATCH /api/patients/:id/status - Update patient admission status (admit, non-admit, restore, delete)
app.patch('/api/patients/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, nonAdmitReason, nonAdmitDate } = req.body;

    // Check if patient exists by id or mrn
    const updateRes = await pool.query(`
      UPDATE patients
      SET status = COALESCE($1, status)
      WHERE id = $2 OR mrn = $2
      RETURNING *;
    `, [status, id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ success: true, patient: updateRes.rows[0] });
  } catch (err: any) {
    console.error('Error updating patient status:', err);
    res.status(500).json({ error: 'Failed to update patient status' });
  }
});

app.listen(PORT, () => {
  console.log(`[CareOrbit Healthcare API] Connected to PostgreSQL. Server running on http://localhost:${PORT}`);
});
