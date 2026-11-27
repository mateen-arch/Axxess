import { Router, Request, Response } from 'express';
import { pool } from './db';

export const adminRouter = Router();

// Helper to log administrative actions
async function recordAuditLog(
  adminName: string,
  adminEmail: string,
  action: string,
  module: string,
  entityType: string,
  entityId: string,
  details: Record<string, any> = {}
) {
  try {
    await pool.query(`
      INSERT INTO admin_audit_logs (
        admin_name, admin_email, action, module, entity_type, entity_id, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [adminName, adminEmail, action, module, entityType, entityId, JSON.stringify(details)]);
  } catch (err) {
    console.error('[recordAuditLog Error]', err);
  }
}

// =====================================================================
// 1. DASHBOARD OVERVIEW & METRICS
// =====================================================================
adminRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    // 1. User metrics
    const userStatsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN status = 'active' OR is_active = true THEN 1 END) as active_users,
        COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_users,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_users,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspended_users,
        COUNT(CASE WHEN 'central' = ANY(module_access) THEN 1 END) as central_users,
        COUNT(CASE WHEN 'home_health' = ANY(module_access) THEN 1 END) as home_health_users,
        COUNT(CASE WHEN 'connect' = ANY(module_access) THEN 1 END) as connect_users
      FROM users;
    `);

    // 2. Moderation stats
    const modStatsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
        COUNT(CASE WHEN severity = 'critical' AND status = 'pending' THEN 1 END) as critical_pending,
        COUNT(CASE WHEN action_taken = 'user_blocked' THEN 1 END) as users_blocked_count
      FROM moderation_reports;
    `);

    // 3. Approvals queue stats per module
    const appStatsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_approvals,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_approvals,
        COUNT(CASE WHEN module = 'central' AND status = 'pending' THEN 1 END) as central_pending,
        COUNT(CASE WHEN module = 'home_health' AND status = 'pending' THEN 1 END) as home_health_pending,
        COUNT(CASE WHEN module = 'connect' AND status = 'pending' THEN 1 END) as connect_pending
      FROM admin_approvals;
    `);

    // 4. Module configurations
    const modulesRes = await pool.query(`
      SELECT id, name, status, description, version, settings, updated_at
      FROM module_configs
      ORDER BY id ASC;
    `);

    // 5. Urgent action required items (Pending reports & pending approvals)
    const urgentReports = await pool.query(`
      SELECT id, report_type, reporter_name, reported_user_name, reason, severity, status, created_at
      FROM moderation_reports
      WHERE status IN ('pending', 'under_review')
      ORDER BY 
        CASE WHEN severity = 'critical' THEN 1 WHEN severity = 'high' THEN 2 ELSE 3 END,
        created_at DESC
      LIMIT 5;
    `);

    const urgentApprovals = await pool.query(`
      SELECT id, approval_type, module, title, priority, status, requested_by, created_at
      FROM admin_approvals
      WHERE status = 'pending'
      ORDER BY 
        CASE WHEN priority = 'critical' THEN 1 WHEN priority = 'urgent' THEN 2 ELSE 3 END,
        created_at DESC
      LIMIT 5;
    `);

    // 6. Recent audit activities
    const recentAudit = await pool.query(`
      SELECT id, admin_name, action, module, entity_type, entity_id, details, created_at
      FROM admin_audit_logs
      ORDER BY created_at DESC
      LIMIT 8;
    `);

    res.json({
      success: true,
      data: {
        users: userStatsRes.rows[0],
        moderation: modStatsRes.rows[0],
        approvals: appStatsRes.rows[0],
        modules: modulesRes.rows,
        urgentActionItems: {
          reports: urgentReports.rows,
          approvals: urgentApprovals.rows
        },
        recentAuditLogs: recentAudit.rows
      }
    });
  } catch (err: any) {
    console.error('Error fetching admin dashboard:', err);
    res.status(500).json({ success: false, error: 'Failed to load admin dashboard data' });
  }
});

// =====================================================================
// 2. USER MANAGEMENT ENDPOINTS
// =====================================================================

// List all users with filtering
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const { search, role, status, module } = req.query;

    let query = `
      SELECT 
        id, email, full_name, role, status, is_active, is_super_admin,
        department, title, module_access, license_number, license_state, license_status,
        blocked_reason, blocked_at, blocked_by, created_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR license_number ILIKE $${params.length})`;
    }

    if (role && role !== 'all') {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (module && module !== 'all') {
      params.push(module);
      query += ` AND $${params.length} = ANY(module_access)`;
    }

    query += ` ORDER BY created_at DESC NULLS LAST, full_name ASC;`;

    const result = await pool.query(query, params);
    res.json({ success: true, users: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error listing admin users:', err);
    res.status(500).json({ success: false, error: 'Failed to list users' });
  }
});

// Create / Invite new user
adminRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      role = 'clinician',
      department = 'Clinical Operations',
      title = 'Staff Member',
      moduleAccess = ['central', 'home_health', 'connect'],
      licenseNumber,
      licenseState = 'TX',
      licenseStatus = 'verified',
      status = 'active',
      phone,
      isSuperAdmin = false
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ success: false, error: 'Full name and email are required' });
    }

    // Check if user already exists
    const check = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (check.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'A user with this email address already exists' });
    }

    const orgCheck = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgCheck.rows[0]?.id || null;

    const insertRes = await pool.query(`
      INSERT INTO users (
        organization_id, email, password_hash, full_name, role, is_active, is_super_admin, status,
        department, module_access, title, license_number, license_state, license_status, mobile_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, email, full_name, role, status, module_access, created_at;
    `, [
      orgId,
      email.toLowerCase().trim(),
      'pbkdf2:defaultgeneratedhash2026',
      fullName.trim(),
      role,
      status === 'active',
      isSuperAdmin,
      status,
      department,
      moduleAccess,
      title,
      licenseNumber || null,
      licenseState,
      licenseStatus,
      phone || null
    ]);

    const createdUser = insertRes.rows[0];

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'USER_CREATED',
      'global',
      'user',
      createdUser.id,
      { email, fullName, role, moduleAccess, status }
    );

    res.status(201).json({ success: true, user: createdUser });
  } catch (err: any) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create user' });
  }
});

// Update user details & module access
adminRouter.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      role,
      department,
      title,
      moduleAccess,
      licenseNumber,
      licenseStatus,
      status
    } = req.body;

    const updateRes = await pool.query(`
      UPDATE users SET
        full_name = COALESCE($1, full_name),
        role = COALESCE($2, role),
        department = COALESCE($3, department),
        title = COALESCE($4, title),
        module_access = COALESCE($5, module_access),
        license_number = COALESCE($6, license_number),
        license_status = COALESCE($7, license_status),
        status = COALESCE($8, status),
        is_active = CASE WHEN COALESCE($8, status) = 'active' THEN true ELSE false END
      WHERE id::text = $9
      RETURNING id, full_name, email, role, status, department, module_access, license_status;
    `, [
      fullName || null,
      role || null,
      department || null,
      title || null,
      moduleAccess || null,
      licenseNumber || null,
      licenseStatus || null,
      status || null,
      id
    ]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updated = updateRes.rows[0];

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'USER_UPDATED',
      'global',
      'user',
      id,
      { changes: req.body }
    );

    res.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Approve pending user
adminRouter.post('/users/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const updateRes = await pool.query(`
      UPDATE users SET
        status = 'active',
        is_active = true,
        license_status = 'verified'
      WHERE id::text = $1
      RETURNING id, full_name, email, role, status;
    `, [id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const approvedUser = updateRes.rows[0];

    // Automatically resolve any pending approval queue item for this user
    await pool.query(`
      UPDATE admin_approvals SET
        status = 'approved',
        reviewed_by = 'Super Admin',
        review_notes = $1,
        updated_at = NOW()
      WHERE target_id = $2 AND status = 'pending';
    `, [adminNotes || 'Approved by Super Admin credential review', id]);

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'USER_APPROVED',
      'home_health',
      'user',
      id,
      { user: approvedUser, notes: adminNotes }
    );

    res.json({ success: true, message: `User ${approvedUser.full_name} approved and activated.`, user: approvedUser });
  } catch (err: any) {
    console.error('Error approving user:', err);
    res.status(500).json({ success: false, error: 'Failed to approve user' });
  }
});

// Block user with policy violation reason
adminRouter.post('/users/:id/block', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = 'Policy violation' } = req.body;

    const updateRes = await pool.query(`
      UPDATE users SET
        status = 'blocked',
        is_active = false,
        blocked_reason = $1,
        blocked_at = NOW(),
        blocked_by = 'Super Admin'
      WHERE id::text = $2
      RETURNING id, full_name, email, role, status, blocked_reason, blocked_at;
    `, [reason, id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const blockedUser = updateRes.rows[0];

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'USER_BLOCKED',
      'connect',
      'user',
      id,
      { user: blockedUser, reason }
    );

    res.json({ success: true, message: `User ${blockedUser.full_name} has been blocked.`, user: blockedUser });
  } catch (err: any) {
    console.error('Error blocking user:', err);
    res.status(500).json({ success: false, error: 'Failed to block user' });
  }
});

// Unblock user
adminRouter.post('/users/:id/unblock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const updateRes = await pool.query(`
      UPDATE users SET
        status = 'active',
        is_active = true,
        blocked_reason = NULL,
        blocked_at = NULL,
        blocked_by = NULL
      WHERE id::text = $1
      RETURNING id, full_name, email, role, status;
    `, [id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const unblockedUser = updateRes.rows[0];

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'USER_UNBLOCKED',
      'connect',
      'user',
      id,
      { user: unblockedUser }
    );

    res.json({ success: true, message: `User ${unblockedUser.full_name} unblocked successfully.`, user: unblockedUser });
  } catch (err: any) {
    console.error('Error unblocking user:', err);
    res.status(500).json({ success: false, error: 'Failed to unblock user' });
  }
});

// Toggle status (active / suspended)
adminRouter.post('/users/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['active', 'suspended', 'pending_approval', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updateRes = await pool.query(`
      UPDATE users SET
        status = $1,
        is_active = CASE WHEN $1 = 'active' THEN true ELSE false END,
        blocked_reason = CASE WHEN $1 IN ('blocked', 'suspended') THEN COALESCE($2, blocked_reason) ELSE NULL END,
        blocked_at = CASE WHEN $1 IN ('blocked', 'suspended') THEN NOW() ELSE NULL END
      WHERE id::text = $3
      RETURNING id, full_name, email, role, status;
    `, [status, reason || null, id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'USER_STATUS_CHANGE',
      'global',
      'user',
      id,
      { status, reason }
    );

    res.json({ success: true, user: updateRes.rows[0] });
  } catch (err: any) {
    console.error('Error updating user status:', err);
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

// Delete user
adminRouter.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleteRes = await pool.query('DELETE FROM users WHERE id::text = $1 RETURNING full_name, email', [id]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'USER_DELETED',
      'global',
      'user',
      id,
      { deletedUser: deleteRes.rows[0] }
    );

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// =====================================================================
// 3. MODERATION & SAFETY (MESSAGES & USERS)
// =====================================================================

// List moderation reports
adminRouter.get('/moderation/reports', async (req: Request, res: Response) => {
  try {
    const { status, type, severity } = req.query;

    let query = `
      SELECT 
        id, report_type, reporter_id, reporter_name, reported_user_id, reported_user_name,
        reported_message_id, message_content, reason, severity, status, action_taken,
        admin_notes, reviewed_by, created_at, resolved_at
      FROM moderation_reports
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (type && type !== 'all') {
      params.push(type);
      query += ` AND report_type = $${params.length}`;
    }

    if (severity && severity !== 'all') {
      params.push(severity);
      query += ` AND severity = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC;`;

    const result = await pool.query(query, params);
    res.json({ success: true, reports: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error listing moderation reports:', err);
    res.status(500).json({ success: false, error: 'Failed to list reports' });
  }
});

// File a new report (e.g. from user flag or test)
adminRouter.post('/moderation/reports', async (req: Request, res: Response) => {
  try {
    const {
      reportType = 'message',
      reporterId,
      reporterName = 'Staff Clinician',
      reportedUserId,
      reportedUserName,
      reportedMessageId,
      messageContent,
      reason,
      severity = 'medium'
    } = req.body;

    if (!reportedUserName || !reason) {
      return res.status(400).json({ success: false, error: 'Reported user name and reason are required' });
    }

    const insertRes = await pool.query(`
      INSERT INTO moderation_reports (
        report_type, reporter_id, reporter_name, reported_user_id, reported_user_name,
        reported_message_id, message_content, reason, severity, status, action_taken
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', 'none')
      RETURNING *;
    `, [
      reportType,
      reporterId || null,
      reporterName,
      reportedUserId || null,
      reportedUserName,
      reportedMessageId || null,
      messageContent || null,
      reason,
      severity
    ]);

    res.status(201).json({ success: true, report: insertRes.rows[0] });
  } catch (err: any) {
    console.error('Error filing moderation report:', err);
    res.status(500).json({ success: false, error: 'Failed to file report' });
  }
});

// Resolve a moderation report
adminRouter.post('/moderation/reports/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      actionTaken = 'none', // 'none' | 'message_deleted' | 'user_warned' | 'user_suspended' | 'user_blocked'
      adminNotes = 'Reviewed and resolved by Super Admin',
      status = 'resolved'
    } = req.body;

    const reportRes = await pool.query('SELECT * FROM moderation_reports WHERE id = $1', [id]);
    if (reportRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }

    const report = reportRes.rows[0];

    // If action is user_blocked, block the reported user
    if (actionTaken === 'user_blocked' && (report.reported_user_id || report.reported_user_name)) {
      await pool.query(`
        UPDATE users SET
          status = 'blocked',
          is_active = false,
          blocked_reason = $1,
          blocked_at = NOW(),
          blocked_by = 'Super Admin'
        WHERE id::text = $2 OR full_name ILIKE $3;
      `, [report.reason, report.reported_user_id || '', report.reported_user_name]);
    }

    // If action is message_deleted and message ID is present, delete or scrub it
    if (actionTaken === 'message_deleted' && report.reported_message_id) {
      await pool.query(`
        UPDATE chat_messages 
        SET content = '[Message removed by CareOrbit Super Admin for conduct/HIPAA violation]'
        WHERE id = $1;
      `, [report.reported_message_id]);
    }

    const updateRes = await pool.query(`
      UPDATE moderation_reports SET
        status = $1,
        action_taken = $2,
        admin_notes = $3,
        reviewed_by = 'Super Admin',
        resolved_at = NOW()
      WHERE id = $4
      RETURNING *;
    `, [status, actionTaken, adminNotes, id]);

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'MODERATION_RESOLVED',
      'connect',
      'moderation_report',
      id,
      { actionTaken, adminNotes, reportType: report.report_type, reportedUser: report.reported_user_name }
    );

    res.json({ success: true, report: updateRes.rows[0] });
  } catch (err: any) {
    console.error('Error resolving report:', err);
    res.status(500).json({ success: false, error: 'Failed to resolve report' });
  }
});

// List blocked users registry
adminRouter.get('/moderation/blocked', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, full_name, email, role, department, title, blocked_reason, blocked_at, blocked_by
      FROM users
      WHERE status = 'blocked'
      ORDER BY blocked_at DESC NULLS LAST;
    `);
    res.json({ success: true, blockedUsers: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching blocked users:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch blocked users' });
  }
});

// Live message audit browser
adminRouter.get('/moderation/messages', async (req: Request, res: Response) => {
  try {
    const { search, limit = 50 } = req.query;

    let query = `
      SELECT 
        m.id, m.conversation_id, m.sender_name, m.sender_role, m.content, m.created_at,
        c.title as conversation_title, c.type as conversation_type
      FROM chat_messages m
      LEFT JOIN conversations c ON m.conversation_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (m.content ILIKE $${params.length} OR m.sender_name ILIKE $${params.length})`;
    }

    params.push(Number(limit) || 50);
    query += ` ORDER BY m.created_at DESC LIMIT $${params.length};`;

    const result = await pool.query(query, params);
    res.json({ success: true, messages: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error auditing messages:', err);
    res.status(500).json({ success: false, error: 'Failed to audit messages' });
  }
});

// Delete message permanently
adminRouter.delete('/moderation/messages/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const delRes = await pool.query('DELETE FROM chat_messages WHERE id = $1 RETURNING content, sender_name', [id]);
    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'MESSAGE_DELETED',
      'connect',
      'chat_message',
      id,
      { deletedMessage: delRes.rows[0] }
    );

    res.json({ success: true, message: 'Message permanently deleted from database' });
  } catch (err: any) {
    console.error('Error deleting message:', err);
    res.status(500).json({ success: false, error: 'Failed to delete message' });
  }
});

// =====================================================================
// 4. APPROVALS & VERIFICATION HUB
// =====================================================================

// List approvals
adminRouter.get('/approvals', async (req: Request, res: Response) => {
  try {
    const { module, status, type } = req.query;

    let query = `
      SELECT 
        id, approval_type, module, title, description, priority, status,
        requested_by, target_id, target_type, details, reviewed_by, review_notes,
        created_at, updated_at
      FROM admin_approvals
      WHERE 1=1
    `;
    const params: any[] = [];

    if (module && module !== 'all') {
      params.push(module);
      query += ` AND module = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (type && type !== 'all') {
      params.push(type);
      query += ` AND approval_type = $${params.length}`;
    }

    query += ` ORDER BY 
      CASE WHEN status = 'pending' THEN 0 ELSE 1 END,
      CASE WHEN priority = 'critical' THEN 1 WHEN priority = 'urgent' THEN 2 ELSE 3 END,
      created_at DESC;`;

    const result = await pool.query(query, params);
    res.json({ success: true, approvals: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching approvals:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch approvals' });
  }
});

// Approve or reject verification request
adminRouter.post('/approvals/:id/decision', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, reviewNotes } = req.body; // decision: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Decision must be approved or rejected' });
    }

    const checkRes = await pool.query('SELECT * FROM admin_approvals WHERE id = $1', [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Approval request not found' });
    }

    const item = checkRes.rows[0];

    // Synchronize decision to the underlying target entity
    if (item.target_id) {
      if (item.target_type === 'patient' || item.approval_type.includes('patient')) {
        await pool.query(`UPDATE patients SET approval_status = $1, status = (CASE WHEN $1 = 'approved' THEN 'active' ELSE 'inactive' END) WHERE id::text = $2 OR mrn = $2`, [decision, item.target_id]);
      } else if (item.target_type === 'pharmacy' || item.approval_type.includes('pharmacy')) {
        await pool.query(`UPDATE pharmacies SET approval_status = $1, status = (CASE WHEN $1 = 'approved' THEN 'Active' ELSE 'Inactive' END) WHERE id::text = $2`, [decision, item.target_id]);
      } else if (item.target_type === 'facility' || item.approval_type.includes('facility')) {
        await pool.query(`UPDATE facilities SET approval_status = $1, status = (CASE WHEN $1 = 'approved' THEN 'Active' ELSE 'Inactive' END) WHERE id::text = $2`, [decision, item.target_id]);
      } else if (item.target_type === 'physician' || item.approval_type.includes('physician')) {
        await pool.query(`UPDATE physicians SET approval_status = $1, status = (CASE WHEN $1 = 'approved' THEN 'Active' ELSE 'Inactive' END) WHERE id::text = $2`, [decision, item.target_id]);
      } else if (item.target_type === 'order' || item.approval_type.includes('order')) {
        await pool.query(`UPDATE orders SET approval_status = $1 WHERE id::text = $2`, [decision, item.target_id]);
      } else if (item.target_type === 'episode' || item.approval_type.includes('episode')) {
        await pool.query(`UPDATE episodes SET approval_status = $1 WHERE id::text = $2`, [decision, item.target_id]);
      } else if (item.target_type === 'report' || item.approval_type.includes('report')) {
        await pool.query(`UPDATE generated_reports SET approval_status = $1 WHERE id::text = $2`, [decision, item.target_id]);
      } else if (item.target_type === 'user' || item.approval_type.includes('clinician') || item.approval_type.includes('user')) {
        await pool.query(`
          UPDATE users SET
            status = (CASE WHEN $1 = 'approved' THEN 'active' ELSE 'suspended' END),
            is_active = (CASE WHEN $1 = 'approved' THEN true ELSE false END),
            license_status = (CASE WHEN $1 = 'approved' THEN 'verified' ELSE 'pending_verification' END)
          WHERE id::text = $2 OR email = $2;
        `, [decision, item.target_id]);
      }
    }

    const updateRes = await pool.query(`
      UPDATE admin_approvals SET
        status = $1,
        reviewed_by = 'Super Admin',
        review_notes = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `, [decision, reviewNotes || `Decision: ${decision}`, id]);

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'APPROVAL_DECISION',
      item.module,
      'admin_approval',
      id,
      { decision, reviewNotes, title: item.title, module: item.module }
    );

    res.json({ success: true, approval: updateRes.rows[0] });
  } catch (err: any) {
    console.error('Error submitting approval decision:', err);
    res.status(500).json({ success: false, error: 'Failed to process decision' });
  }
});

// =====================================================================
// 5. MODULES MANAGEMENT (CENTRAL, HOME HEALTH, CONNECT)
// =====================================================================

// List all 3 modules with live operational statistics
adminRouter.get('/modules', async (_req: Request, res: Response) => {
  try {
    const configsRes = await pool.query('SELECT * FROM module_configs ORDER BY id ASC');

    // Compute live per-module statistics
    // 1. Central stats
    const centralPatients = await pool.query('SELECT COUNT(*) FROM patients');
    const centralInquiries = await pool.query('SELECT COUNT(*) FROM intake_referrals');
    const centralBranches = await pool.query("SELECT COUNT(DISTINCT branch) FROM patients WHERE branch IS NOT NULL");

    // 2. Home Health stats
    const hhVisits = await pool.query('SELECT COUNT(*) FROM visits');
    const hhEpisodes = await pool.query('SELECT COUNT(*) FROM episodes');
    const hhOrders = await pool.query('SELECT COUNT(*) FROM orders');
    const hhQaPending = await pool.query("SELECT COUNT(*) FROM qa_tasks WHERE status = 'Pending Review'");

    // 3. Connect stats
    const connConversations = await pool.query('SELECT COUNT(*) FROM conversations');
    const connMessages = await pool.query('SELECT COUNT(*) FROM chat_messages');
    const connBlockedUsers = await pool.query("SELECT COUNT(*) FROM users WHERE status = 'blocked'");

    const modulesWithStats = configsRes.rows.map((mod: any) => {
      let stats: Record<string, any> = {};
      if (mod.id === 'central') {
        stats = {
          totalPatients: parseInt(centralPatients.rows[0].count, 10),
          intakeReferralsCount: parseInt(centralInquiries.rows[0].count, 10),
          activeBranchesCount: parseInt(centralBranches.rows[0].count, 10) || 1
        };
      } else if (mod.id === 'home_health') {
        stats = {
          totalVisits: parseInt(hhVisits.rows[0].count, 10),
          activeEpisodes: parseInt(hhEpisodes.rows[0].count, 10),
          totalOrders: parseInt(hhOrders.rows[0].count, 10),
          qaTasksPending: parseInt(hhQaPending.rows[0].count, 10)
        };
      } else if (mod.id === 'connect') {
        stats = {
          activeChannels: parseInt(connConversations.rows[0].count, 10),
          totalMessages: parseInt(connMessages.rows[0].count, 10),
          blockedUsers: parseInt(connBlockedUsers.rows[0].count, 10)
        };
      }
      return { ...mod, stats };
    });

    res.json({ success: true, modules: modulesWithStats });
  } catch (err: any) {
    console.error('Error fetching modules:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch modules' });
  }
});

// Update module status (operational / maintenance) or settings
adminRouter.put('/modules/:moduleKey', async (req: Request, res: Response) => {
  try {
    const { moduleKey } = req.params;
    const { status, settings } = req.body;

    const check = await pool.query('SELECT * FROM module_configs WHERE id = $1', [moduleKey]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Module not found' });
    }

    const current = check.rows[0];
    const newSettings = settings ? { ...current.settings, ...settings } : current.settings;

    const updateRes = await pool.query(`
      UPDATE module_configs SET
        status = COALESCE($1, status),
        settings = $2,
        updated_by = 'Super Admin',
        updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `, [status || null, JSON.stringify(newSettings), moduleKey]);

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'MODULE_CONFIG_UPDATE',
      moduleKey,
      'module_config',
      moduleKey,
      { status, updatedSettings: settings }
    );

    res.json({ success: true, module: updateRes.rows[0] });
  } catch (err: any) {
    console.error('Error updating module configuration:', err);
    res.status(500).json({ success: false, error: 'Failed to update module configuration' });
  }
});

// =====================================================================
// 6. AUDIT LOGS ENDPOINTS
// =====================================================================
adminRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { search, module, action, limit = 50 } = req.query;

    let query = `
      SELECT id, admin_name, admin_email, action, module, entity_type, entity_id, details, ip_address, created_at
      FROM admin_audit_logs
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (action ILIKE $${params.length} OR admin_name ILIKE $${params.length} OR entity_type ILIKE $${params.length})`;
    }

    if (module && module !== 'all') {
      params.push(module);
      query += ` AND module = $${params.length}`;
    }

    if (action && action !== 'all') {
      params.push(action);
      query += ` AND action = $${params.length}`;
    }

    params.push(Number(limit) || 50);
    query += ` ORDER BY created_at DESC LIMIT $${params.length};`;

    const result = await pool.query(query, params);
    res.json({ success: true, logs: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

// =====================================================================
// 6. PATIENTS GOVERNANCE (MASTER PATIENT DIRECTORY & APPROVALS)
// =====================================================================

// List all patients across Central and Home Health with approval status
adminRouter.get('/patients', async (req: Request, res: Response) => {
  try {
    const { search, serviceLine, approvalStatus, branch } = req.query;

    let query = `
      SELECT 
        p.id,
        p.mrn,
        p.first_name,
        p.last_name,
        p.gender,
        TO_CHAR(p.dob, 'YYYY-MM-DD') as dob,
        DATE_PART('year', AGE(p.dob))::int as age,
        p.service_line,
        p.status,
        COALESCE(p.approval_status, 'approved') as approval_status,
        p.primary_diagnosis,
        p.phone,
        p.email,
        p.branch,
        p.address_street,
        p.address_city,
        p.address_state,
        p.address_zip,
        TO_CHAR(p.start_of_care_date, 'YYYY-MM-DD') as start_of_care_date,
        TO_CHAR(p.episode_start, 'YYYY-MM-DD') as episode_start,
        TO_CHAR(p.episode_end, 'YYYY-MM-DD') as episode_end,
        p.attending_physician,
        p.insurance_name,
        p.fall_risk,
        p.hospitalization_risk,
        p.infection_risk,
        p.full_code,
        p.created_at
      FROM patients p
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (p.first_name ILIKE $${params.length} OR p.last_name ILIKE $${params.length} OR p.mrn ILIKE $${params.length} OR p.attending_physician ILIKE $${params.length})`;
    }

    if (serviceLine && serviceLine !== 'all') {
      params.push(serviceLine);
      query += ` AND p.service_line = $${params.length}`;
    }

    if (approvalStatus && approvalStatus !== 'all') {
      params.push(approvalStatus);
      query += ` AND COALESCE(p.approval_status, 'approved') = $${params.length}`;
    }

    if (branch && branch !== 'all') {
      params.push(branch);
      query += ` AND p.branch ILIKE $${params.length}`;
    }

    query += ` ORDER BY 
      CASE WHEN p.approval_status = 'pending_approval' THEN 0 ELSE 1 END,
      p.created_at DESC NULLS LAST,
      p.last_name ASC;`;

    const result = await pool.query(query, params);
    res.json({ success: true, patients: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching admin patients:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch patients' });
  }
});

// 1-Click Approve Patient
adminRouter.post('/patients/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateRes = await pool.query(`
      UPDATE patients
      SET approval_status = 'approved', status = 'active'
      WHERE id::text = $1 OR mrn = $1
      RETURNING id, mrn, first_name, last_name, approval_status;
    `, [id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const patient = updateRes.rows[0];

    // Resolve any corresponding item in admin_approvals
    await pool.query(`
      UPDATE admin_approvals
      SET status = 'approved', reviewed_by = 'Super Admin', review_notes = 'Patient approved and published to client portal'
      WHERE target_id = $1 OR target_id = $2;
    `, [patient.id, patient.mrn]);

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'PATIENT_APPROVED',
      'central',
      'patient',
      patient.id,
      { mrn: patient.mrn, name: `${patient.first_name} ${patient.last_name}` }
    );

    res.json({ success: true, patient });
  } catch (err: any) {
    console.error('Error approving patient:', err);
    res.status(500).json({ success: false, error: 'Failed to approve patient' });
  }
});

// 1-Click Reject Patient
adminRouter.post('/patients/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const updateRes = await pool.query(`
      UPDATE patients
      SET approval_status = 'rejected', status = 'inactive'
      WHERE id::text = $1 OR mrn = $1
      RETURNING id, mrn, first_name, last_name, approval_status;
    `, [id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const patient = updateRes.rows[0];

    await pool.query(`
      UPDATE admin_approvals
      SET status = 'rejected', reviewed_by = 'Super Admin', review_notes = $1
      WHERE target_id = $2 OR target_id = $3;
    `, [reason || 'Admission rejected by compliance audit', patient.id, patient.mrn]);

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'PATIENT_REJECTED',
      'central',
      'patient',
      patient.id,
      { mrn: patient.mrn, name: `${patient.first_name} ${patient.last_name}`, reason }
    );

    res.json({ success: true, patient });
  } catch (err: any) {
    console.error('Error rejecting patient:', err);
    res.status(500).json({ success: false, error: 'Failed to reject patient' });
  }
});

// Delete Patient
adminRouter.delete('/patients/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM patient_tasks WHERE patient_id::text = $1', [id]);
    await pool.query('DELETE FROM visits WHERE patient_id::text = $1', [id]);
    await pool.query('DELETE FROM episodes WHERE patient_id::text = $1', [id]);
    const delRes = await pool.query('DELETE FROM patients WHERE id::text = $1 OR mrn = $1 RETURNING id, mrn, first_name, last_name', [id]);

    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'PATIENT_DELETED',
      'central',
      'patient',
      id,
      { patient: delRes.rows[0] }
    );

    res.json({ success: true, message: 'Patient removed from system' });
  } catch (err: any) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ success: false, error: 'Failed to delete patient' });
  }
});

// =====================================================================
// 7. CLINICIANS & ROSTER GOVERNANCE
// =====================================================================

adminRouter.get('/clinicians', async (req: Request, res: Response) => {
  try {
    const { search, discipline, branch } = req.query;

    let query = `
      SELECT 
        c.id, c.name, c.title, c.credentials, c.discipline, c.branch, c.phone,
        c.status, c.work_status, c.service_lines, c.latitude, c.longitude, c.current_address,
        u.email, u.status as user_status, u.license_number, u.license_status
      FROM clinicians c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (c.name ILIKE $${params.length} OR c.title ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    if (discipline && discipline !== 'all') {
      params.push(discipline);
      query += ` AND c.discipline ILIKE $${params.length}`;
    }

    if (branch && branch !== 'all') {
      params.push(branch);
      query += ` AND c.branch ILIKE $${params.length}`;
    }

    query += ` ORDER BY c.name ASC;`;

    const result = await pool.query(query, params);
    res.json({ success: true, clinicians: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching admin clinicians:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch clinicians' });
  }
});

// Create and enroll a new clinician
adminRouter.post('/clinicians', async (req: Request, res: Response) => {
  try {
    const {
      name,
      title = 'Registered Nurse',
      credentials = 'RN',
      discipline = 'Nursing',
      branch = 'Standards Home Care',
      phone,
      email,
      licenseNumber,
      licenseState = 'MA',
      licenseStatus = 'verified',
      workStatus = 'Available',
      serviceLines = ['home_health'],
      currentAddress
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Clinician name is required' });
    }

    const orgCheck = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgCheck.rows[0]?.id || null;

    let userId = null;

    // If email is provided, find or create associated user
    if (email && email.trim()) {
      const emailNorm = email.trim().toLowerCase();
      const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 LIMIT 1', [emailNorm]);
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
      } else {
        const newUserRes = await pool.query(`
          INSERT INTO users (
            organization_id, email, password_hash, full_name, role, is_active, is_super_admin, status,
            department, module_access, title, license_number, license_state, license_status, mobile_phone
          ) VALUES ($1, $2, $3, $4, 'clinician', true, false, 'active', $5, ARRAY['home_health', 'central']::TEXT[], $6, $7, $8, $9, $10)
          RETURNING id;
        `, [
          orgId,
          emailNorm,
          'pbkdf2:defaultgeneratedhash2026',
          name.trim(),
          discipline,
          title,
          licenseNumber || null,
          licenseState,
          licenseStatus,
          phone || null
        ]);
        userId = newUserRes.rows[0].id;
      }
    }

    const sLines = Array.isArray(serviceLines) && serviceLines.length > 0 ? serviceLines : ['home_health'];

    const insertRes = await pool.query(`
      INSERT INTO clinicians (
        organization_id, user_id, name, title, credentials, discipline,
        branch, phone, status, work_status, service_lines, current_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10, $11)
      RETURNING *;
    `, [
      orgId,
      userId,
      name.trim(),
      title.trim(),
      credentials.trim(),
      discipline.trim(),
      branch.trim(),
      phone || null,
      workStatus,
      sLines,
      currentAddress || null
    ]);

    const createdClinician = insertRes.rows[0];

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'CLINICIAN_ENROLLED',
      'home_health',
      'clinician',
      createdClinician.id,
      { name, title, credentials, discipline, branch, email, phone, licenseNumber }
    );

    res.status(201).json({ success: true, clinician: createdClinician });
  } catch (err: any) {
    console.error('Error creating clinician:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to create clinician' });
  }
});

// Delete clinician from roster
adminRouter.delete('/clinicians/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const delRes = await pool.query('DELETE FROM clinicians WHERE id::text = $1 RETURNING id, name, user_id', [id]);
    if (delRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Clinician not found' });
    }

    const deleted = delRes.rows[0];

    await recordAuditLog(
      'Super Admin',
      'admin@careorbit.health',
      'CLINICIAN_DELETED',
      'home_health',
      'clinician',
      id,
      { clinician: deleted }
    );

    res.json({ success: true, message: `Clinician ${deleted.name} removed from roster` });
  } catch (err: any) {
    console.error('Error deleting clinician:', err);
    res.status(500).json({ success: false, error: 'Failed to delete clinician' });
  }
});

// =====================================================================
// 8. VISITS & EVV SCHEDULING GOVERNANCE
// =====================================================================

adminRouter.get('/visits', async (req: Request, res: Response) => {
  try {
    const { search, status, evvStatus, branch } = req.query;

    let query = `
      SELECT 
        v.id,
        v.patient_id,
        COALESCE(v.patient_name, p.first_name || ' ' || p.last_name, 'Patient') as patient_name,
        COALESCE(p.mrn, 'N/A') as mrn,
        v.employee_name,
        v.task,
        TO_CHAR(v.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
        v.time_slot,
        v.status,
        v.evv_status,
        v.address,
        v.is_deviation,
        v.deviation_reason,
        v.notes,
        COALESCE(p.branch, 'Standards Home Care') as branch
      FROM visits v
      LEFT JOIN patients p ON v.patient_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (v.patient_name ILIKE $${params.length} OR v.employee_name ILIKE $${params.length} OR v.task ILIKE $${params.length})`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND v.status = $${params.length}`;
    }

    if (evvStatus && evvStatus !== 'all') {
      params.push(evvStatus);
      query += ` AND v.evv_status = $${params.length}`;
    }

    query += ` ORDER BY v.scheduled_date DESC, v.time_slot ASC LIMIT 100;`;

    const result = await pool.query(query, params);
    res.json({ success: true, visits: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching admin visits:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch visits' });
  }
});

// =====================================================================
// 9. CLINICAL EMR (EPISODES, ORDERS, DIRECTORY)
// =====================================================================

// Episodes
adminRouter.get('/episodes', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.id, e.patient_id, p.mrn, p.first_name || ' ' || p.last_name as patient_name,
        TO_CHAR(e.start_date, 'YYYY-MM-DD') as start_date,
        TO_CHAR(e.end_date, 'YYYY-MM-DD') as end_date,
        e.episode_number, e.status, COALESCE(e.approval_status, 'approved') as approval_status,
        e.primary_diagnosis, e.attending_physician, e.created_at
      FROM episodes e
      LEFT JOIN patients p ON e.patient_id = p.id
      ORDER BY 
        CASE WHEN e.approval_status = 'pending_approval' THEN 0 ELSE 1 END,
        e.created_at DESC;
    `);
    res.json({ success: true, episodes: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching episodes:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch episodes' });
  }
});

adminRouter.post('/episodes/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE episodes SET approval_status = 'approved', status = 'active' WHERE id::text = $1`, [id]);
    await pool.query(`UPDATE admin_approvals SET status = 'approved' WHERE target_id = $1`, [id]);
    res.json({ success: true, message: 'Episode approved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Orders
adminRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id, o.patient_id, p.first_name || ' ' || p.last_name as patient_name,
        o.attending_physician, o.summary_title, o.order_type, o.order_content,
        TO_CHAR(o.order_date, 'YYYY-MM-DD') as order_date,
        o.status, COALESCE(o.approval_status, 'approved') as approval_status,
        o.clinician_signature, o.created_at
      FROM orders o
      LEFT JOIN patients p ON o.patient_id = p.id
      ORDER BY 
        CASE WHEN o.approval_status = 'pending_approval' THEN 0 ELSE 1 END,
        o.created_at DESC;
    `);
    res.json({ success: true, orders: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

adminRouter.post('/orders/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE orders SET approval_status = 'approved' WHERE id::text = $1`, [id]);
    await pool.query(`UPDATE admin_approvals SET status = 'approved' WHERE target_id = $1`, [id]);
    res.json({ success: true, message: 'Order approved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Directory items: pharmacies, facilities, physicians
adminRouter.get('/directory/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    let table = 'pharmacies';
    if (type === 'facilities') table = 'facilities';
    else if (type === 'physicians') table = 'physicians';
    else if (type === 'payers') table = 'insurance_payers';

    const result = await pool.query(`
      SELECT *, COALESCE(approval_status, 'approved') as approval_status 
      FROM ${table} 
      ORDER BY 
        CASE WHEN approval_status = 'pending_approval' THEN 0 ELSE 1 END,
        created_at DESC NULLS LAST;
    `);
    res.json({ success: true, items: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching directory items:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch directory items' });
  }
});

adminRouter.post('/directory/:type/:id/approve', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    let table = 'pharmacies';
    if (type === 'facilities') table = 'facilities';
    else if (type === 'physicians') table = 'physicians';
    else if (type === 'payers') table = 'insurance_payers';

    await pool.query(`UPDATE ${table} SET approval_status = 'approved', status = 'Active' WHERE id::text = $1`, [id]);
    await pool.query(`UPDATE admin_approvals SET status = 'approved' WHERE target_id = $1`, [id]);
    res.json({ success: true, message: `${type} item approved and published` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =====================================================================
// 10. REPORTS & CENSUS GOVERNANCE
// =====================================================================

adminRouter.get('/reports', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        report_name, 
        category_name as category, 
        file_format as format, 
        status,
        COALESCE(approval_status, 'approved') as approval_status,
        requested_by, 
        file_size_bytes, 
        ('/api/reports/completed/' || id || '/download') as download_url, 
        TO_CHAR(COALESCE(completed_at, created_at), 'YYYY-MM-DD HH12:MI AM') as generated_at
      FROM generated_reports
      ORDER BY 
        CASE WHEN approval_status = 'pending_approval' THEN 0 ELSE 1 END,
        COALESCE(completed_at, created_at) DESC;
    `);
    res.json({ success: true, reports: result.rows, total: result.rows.length });
  } catch (err: any) {
    console.error('Error fetching admin reports:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch reports' });
  }
});

adminRouter.post('/reports/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE generated_reports SET approval_status = 'approved' WHERE id::text = $1`, [id]);
    await pool.query(`UPDATE admin_approvals SET status = 'approved' WHERE target_id = $1`, [id]);
    res.json({ success: true, message: 'Report approved' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

adminRouter.delete('/reports/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM generated_reports WHERE id::text = $1`, [id]);
    res.json({ success: true, message: 'Report deleted from records' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Census Metrics
adminRouter.get('/census', async (_req: Request, res: Response) => {
  try {
    const totalCensusRes = await pool.query(`SELECT COUNT(*) as count FROM patients WHERE status = 'active' AND (approval_status IS NULL OR approval_status = 'approved')`);
    const byServiceLine = await pool.query(`SELECT service_line, COUNT(*) as count FROM patients WHERE (approval_status IS NULL OR approval_status = 'approved') GROUP BY service_line`);
    const byBranch = await pool.query(`SELECT COALESCE(branch, 'Main Branch') as branch, COUNT(*) as count FROM patients WHERE (approval_status IS NULL OR approval_status = 'approved') GROUP BY branch`);
    const pendingApprovalCount = await pool.query(`SELECT COUNT(*) as count FROM patients WHERE approval_status = 'pending_approval'`);

    res.json({
      success: true,
      activeCensus: parseInt(totalCensusRes.rows[0].count, 10),
      pendingPatients: parseInt(pendingApprovalCount.rows[0].count, 10),
      byServiceLine: byServiceLine.rows,
      byBranch: byBranch.rows
    });
  } catch (err: any) {
    console.error('Error fetching census:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch census' });
  }
});

export default adminRouter;
