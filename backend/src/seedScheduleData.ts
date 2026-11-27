import { pool } from './db';

export async function seedScheduleCenterData() {
  console.log('[seedScheduleCenterData] Checking and ensuring authentic Unassigned Visits & HUV/SFV records...');

  try {
    const orgRes = await pool.query('SELECT id FROM organizations LIMIT 1');
    const orgId = orgRes.rows[0]?.id;
    if (!orgId) return;

    // 1. Ensure Unassigned Visits for CURRENT_DATE and upcoming dates
    const unassignedCount = await pool.query(`
      SELECT COUNT(*) FROM visits 
      WHERE status = 'unassigned' 
        AND scheduled_date >= CURRENT_DATE - INTERVAL '7 days'
    `);

    if (parseInt(unassignedCount.rows[0].count, 10) < 10) {
      await pool.query(`
        INSERT INTO visits (
          organization_id, patient_id, patient_name, branch, task, visit_type,
          scheduled_date, scheduled_start, scheduled_end, time_slot, status, priority,
          service_line, required_credentials, clinical_notes, address
        )
        SELECT 
          $1,
          p.id,
          p.first_name || ' ' || p.last_name,
          COALESCE(p.branch, 'Standards Home Care'),
          u.task,
          u.task,
          CURRENT_DATE + (u.day_offset || ' days')::interval,
          (CURRENT_DATE + (u.day_offset || ' days')::interval + u.start_time::interval),
          (CURRENT_DATE + (u.day_offset || ' days')::interval + u.end_time::interval),
          u.time_slot,
          'unassigned',
          u.priority::priority_level_enum,
          u.service_line::service_line_enum,
          u.creds,
          u.notes,
          COALESCE(p.address_street || ', ' || p.address_city, '1420 Harvard St, Dallas TX')
        FROM (
          VALUES
            (0, 'RN - Skilled Nurse Wound VAC', 'home_health', 'urgent', '09:00:00', '10:30:00', '09:00 AM - 10:30 AM', ARRAY['RN'], 'Critical negative pressure wound therapy dressing replacement.'),
            (1, 'HHA - Routine Personal Care & Bath', 'home_care', 'routine', '10:30:00', '12:00:00', '10:30 AM - 12:00 PM', ARRAY['HHA'], 'Assistance with morning bathing, transfer, and personal grooming.'),
            (1, 'PT - Physical Therapy Gait Training', 'home_health', 'urgent', '13:00:00', '14:00:00', '01:00 PM - 02:00 PM', ARRAY['PT'], 'Gait training with four-point cane and home safety assessment.'),
            (2, 'RN - OASIS 30-Day Recertification', 'home_health', 'urgent', '09:30:00', '11:00:00', '09:30 AM - 11:00 AM', ARRAY['RN'], 'Mandatory CMS recertification assessment window ending.'),
            (2, 'Hospice RN - Palliative Pain Assessment', 'hospice', 'urgent', '11:00:00', '12:30:00', '11:00 AM - 12:30 PM', ARRAY['RN'], 'Symptom management and breakthrough analgesic titration.'),
            (3, 'HHA - Meal Prep & Safety Supervision', 'home_care', 'routine', '14:00:00', '16:00:00', '02:00 PM - 04:00 PM', ARRAY['HHA'], 'Nutritional preparation and diabetic safety supervision.'),
            (4, 'RN - IV Antibiotic Administration', 'home_health', 'urgent', '08:30:00', '10:00:00', '08:30 AM - 10:00 AM', ARRAY['RN'], 'PICC line flushing and Vancomycin IV infusion.'),
            (5, 'OT - Activities of Daily Living Re-eval', 'home_health', 'stat', '10:00:00', '11:00:00', '10:00 AM - 11:00 AM', ARRAY['OT'], 'Adaptive equipment evaluation in bathroom and kitchen.'),
            (6, 'ST - Swallowing & Dysphagia Therapy', 'home_health', 'routine', '13:30:00', '14:30:00', '01:30 PM - 02:30 PM', ARRAY['ST'], 'Dysphagia exercise program and thickened liquid compliance.'),
            (7, 'RN - Diabetic Foot Ulcer Debridement', 'home_health', 'urgent', '11:00:00', '12:30:00', '11:00 AM - 12:30 PM', ARRAY['RN'], 'Sharps wound debridement and non-adherent foam dressing.'),
            (-1, 'PT - Post-Discharge Mobility Rehab', 'home_health', 'stat', '15:00:00', '16:00:00', '03:00 PM - 04:00 PM', ARRAY['PT'], 'Post-discharge mobility and balance exercise protocol.'),
            (3, 'HHA - Companionship & Transfer Assist', 'home_care', 'routine', '12:30:00', '14:30:00', '12:30 PM - 02:30 PM', ARRAY['HHA'], 'Bed-to-chair transfer and cognitive engagement.')
        ) AS u(day_offset, task, service_line, priority, start_time, end_time, time_slot, creds, notes)
        CROSS JOIN LATERAL (
          SELECT id, first_name, last_name, branch, address_street, address_city
          FROM patients
          ORDER BY RANDOM()
          LIMIT 1
        ) p;
      `, [orgId]);
      console.log('[seedScheduleCenterData] Seeded fresh unassigned visits.');
    }

    // 2. Ensure Hospice HUV & SFV records
    const huvCount = await pool.query(`
      SELECT COUNT(*) FROM visits 
      WHERE huv_sfv_type IS NOT NULL
        AND scheduled_date >= CURRENT_DATE - INTERVAL '10 days'
    `);

    if (parseInt(huvCount.rows[0].count, 10) < 10) {
      await pool.query(`
        INSERT INTO visits (
          organization_id, patient_id, patient_name, branch, task, visit_type,
          service_line, huv_sfv_type, task_status, scheduled_date, scheduled_start,
          scheduled_end, admission_date, days_remaining, clinical_notes, status
        )
        SELECT
          $1,
          p.id,
          p.first_name || ' ' || p.last_name,
          COALESCE(p.branch, 'Standards Home Care'),
          h.task,
          h.task,
          'hospice',
          h.huv_sfv_type,
          h.task_status,
          CURRENT_DATE + (h.day_offset || ' days')::interval,
          (CURRENT_DATE + (h.day_offset || ' days')::interval + ' 09:00:00'::interval),
          (CURRENT_DATE + (h.day_offset || ' days')::interval + ' 10:30:00'::interval),
          CURRENT_DATE - (h.admit_offset || ' days')::interval,
          h.days_rem,
          h.notes,
          'scheduled'
        FROM (
          VALUES
            ('HUV', 'Hospice Initial Assessment (HUV1)', 'Scheduled', 0, 12, 1, 'Initial Hospice Update Visit due within 48h of election.'),
            ('HUV', 'Hospice Update Visit (HUV2)', 'Scheduled', 1, 25, 2, 'Bi-weekly Hospice Update Visit for palliative symptom audit.'),
            ('SFV', 'Service Facilitation Visit (SFV)', 'Documented', 0, 30, 1, 'Monthly Service Facilitation supervisory on-site audit.'),
            ('HUV', 'Hospice Recertification Encounter (HUV)', 'Pending Signature', 2, 85, 3, 'Benefit period recertification clinical summary awaiting MD signature.'),
            ('SFV', 'SFV - Bi-Weekly Aide Supervision', 'Scheduled', 3, 40, 4, 'On-site supervisory evaluation of Hospice Aide plan of care.'),
            ('HUV', 'Hospice Interdisciplinary Review (HUV)', 'Completed', -2, 18, 0, 'Interdisciplinary group review completed with Medical Director.'),
            ('HUV', 'Hospice Breakthrough Pain Assessment', 'Overdue', -1, 45, 0, 'Urgent palliative audit required due to pain score escalation.'),
            ('SFV', 'SFV - Comprehensive Environment Safety', 'Scheduled', 5, 22, 6, 'Assessment of home environment, durable medical equipment, and fall hazards.'),
            ('HUV', 'Hospice Nutritional & Comfort Audit', 'Scheduled', 6, 60, 7, 'Dietary comfort measures and hydration protocol verification.'),
            ('SFV', 'SFV - Monthly Caregiver Respite Audit', 'Documented', 4, 35, 5, 'Family caregiver fatigue evaluation and respite coordination.')
        ) AS h(huv_sfv_type, task, task_status, day_offset, admit_offset, days_rem, notes)
        CROSS JOIN LATERAL (
          SELECT id, first_name, last_name, branch
          FROM patients
          ORDER BY RANDOM()
          LIMIT 1
        ) p;
      `, [orgId]);
      console.log('[seedScheduleCenterData] Seeded fresh Hospice HUV & SFV records.');
    }
  } catch (err) {
    console.error('[seedScheduleCenterData] Error seeding schedule data:', err);
  }
}
