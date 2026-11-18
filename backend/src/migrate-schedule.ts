import { pool } from './db';

async function migrateSchedule() {
  console.log('[Migration] Starting Schedule Center schema update & seeding...');
  try {
    // 1. Alter clinicians table
    await pool.query(`
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS name VARCHAR(150);
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS title VARCHAR(100) DEFAULT 'Registered Nurse';
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS credentials VARCHAR(50) DEFAULT 'RN';
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS service_lines TEXT[] DEFAULT ARRAY['home_health']::TEXT[];
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS current_address VARCHAR(255);
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS work_status VARCHAR(50) DEFAULT 'Available';
      ALTER TABLE clinicians ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
    `);

    // 2. Alter visits table
    await pool.query(`
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS patient_name VARCHAR(200);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS employee_name VARCHAR(200);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS time_slot VARCHAR(50);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS scheduled_date DATE;
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS day_of_week INT;
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS address VARCHAR(255);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS location_type VARCHAR(50) DEFAULT 'home';
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS evv_status VARCHAR(50) DEFAULT 'pending';
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS required_credentials TEXT[] DEFAULT ARRAY['RN']::TEXT[];
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS task VARCHAR(255);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS huv_sfv_type VARCHAR(20);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS task_status VARCHAR(50);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS days_remaining INT;
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS admission_date DATE;
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
      ALTER TABLE visits ADD COLUMN IF NOT EXISTS branch VARCHAR(150) DEFAULT 'Standards Home Care';
    `);

    // Also alter patients to ensure latitude / longitude are populated
    await pool.query(`
      ALTER TABLE patients ADD COLUMN IF NOT EXISTS branch VARCHAR(150) DEFAULT 'Standards Home Care';
    `);

    const orgRes = await pool.query(`SELECT id FROM organizations LIMIT 1`);
    const orgId = orgRes.rows[0]?.id || 'e2a44bb4-3e9a-4c91-9e23-7fa38b456211';

    // 3. Populate or update clinicians
    console.log('[Migration] Seeding clinicians with real territory & GPS coordinates...');
    
    // Check if we need to insert or update clinicians
    const clinCheck = await pool.query(`SELECT COUNT(*)::int as count FROM clinicians WHERE name IS NOT NULL`);
    if (clinCheck.rows[0].count < 5) {
      // Ensure users exist for clinicians
      const usersToInsert = [
        { id: 'b4444444-4444-4444-4444-444444444444', name: 'Sarah Jenkins', email: 'sarah.jenkins@standardshomecare.com', role: 'field_nurse' },
        { id: 'b5555555-5555-5555-5555-555555555555', name: 'Carolyn Akukwe', email: 'carolyn.akukwe@standardshomecare.com', role: 'clinical_supervisor' },
        { id: 'b6666666-6666-6666-6666-666666666666', name: 'Andre Bellevue', email: 'andre.bellevue@standardshomecare.com', role: 'field_nurse' },
        { id: 'b7777777-7777-7777-7777-777777777777', name: 'Prince Akukwe', email: 'prince.akukwe@standardshomecare.com', role: 'field_nurse' },
        { id: 'b8888888-8888-8888-8888-888844444444', name: 'Megan Armstrong', email: 'megan.armstrong@standardshomecare.com', role: 'field_nurse' },
      ];

      for (const u of usersToInsert) {
        await pool.query(`
          INSERT INTO users (id, organization_id, email, password_hash, full_name, role)
          VALUES ($1, $2, $3, '$2a$12$eX4mpleH4sh...', $4, $5)
          ON CONFLICT (id) DO NOTHING;
        `, [u.id, orgId, u.email, u.name, u.role]);
      }

      // Update existing 2 clinicians
      await pool.query(`
        UPDATE clinicians 
        SET name = 'Alexandria Nelson, RN', title = 'Clinical Supervisor', credentials = 'RN',
            service_lines = ARRAY['home_health', 'home_care'], territory = 'Dallas Metro',
            latitude = 32.7767, longitude = -96.7970, current_address = '1420 Harvard St, Dallas TX',
            status = 'active', work_status = 'On Visit', phone = '(214) 555-0144'
        WHERE license_number = 'RN-883491';

        UPDATE clinicians 
        SET name = 'Susanna Welch, BSN', title = 'Registered Nurse', credentials = 'BSN',
            service_lines = ARRAY['home_health'], territory = 'North Suburbs',
            latitude = 33.0198, longitude = -96.6989, current_address = '221 Mass Ave, Plano TX',
            status = 'active', work_status = 'In Transit', phone = '(214) 555-0188'
        WHERE license_number = 'RN-992144';
      `);

      // Insert extra rich clinicians
      const cliniciansToInsert = [
        {
          id: 'c3333333-3333-3333-3333-333333333333',
          userId: 'b4444444-4444-4444-4444-444444444444',
          name: 'Sarah Jenkins, RN',
          title: 'Registered Nurse',
          credentials: 'RN',
          licenseNumber: 'RN-774910',
          specialty: 'Skilled Nursing & Wound VAC',
          maxVisits: 6,
          territory: 'Dallas Downtown & Oak Lawn',
          serviceLines: ['home_health', 'home_care'],
          lat: 32.8023,
          lng: -96.8122,
          address: 'Beacon Hill / Oak Lawn, Dallas TX',
          status: 'active',
          workStatus: 'On Visit',
          phone: '(214) 555-0482'
        },
        {
          id: 'c4444444-4444-4444-4444-444444444444',
          userId: 'b5555555-5555-5555-5555-555555555555',
          name: 'Carolyn Akukwe, RN',
          title: 'Case Manager',
          credentials: 'RN',
          licenseNumber: 'RN-662891',
          specialty: 'Geriatric & Palliative Care',
          maxVisits: 5,
          territory: 'Plano & Richardson',
          serviceLines: ['home_health', 'hospice'],
          lat: 32.9483,
          lng: -96.7299,
          address: 'Richardson Medical Hub, Richardson TX',
          status: 'active',
          workStatus: 'Available',
          phone: '(214) 555-0711'
        },
        {
          id: 'c5555555-5555-5555-5555-555555555555',
          userId: 'b6666666-6666-6666-6666-666666666666',
          name: 'Andre Bellevue, PT',
          title: 'Physical Therapist',
          credentials: 'PT',
          licenseNumber: 'PT-993214',
          specialty: 'Orthopedic Rehab & Gait Training',
          maxVisits: 6,
          territory: 'Fort Worth & Arlington',
          serviceLines: ['home_health'],
          lat: 32.7555,
          lng: -97.3308,
          address: 'Fort Worth Cultural District, TX',
          status: 'active',
          workStatus: 'On Visit',
          phone: '(817) 555-0922'
        },
        {
          id: 'c6666666-6666-6666-6666-666666666666',
          userId: 'b7777777-7777-7777-7777-777777777777',
          name: 'Prince Akukwe, HHA',
          title: 'Home Health Aide',
          credentials: 'HHA',
          licenseNumber: 'HHA-331902',
          specialty: 'Activities of Daily Living & Hygiene',
          maxVisits: 6,
          territory: 'Irving & Las Colinas',
          serviceLines: ['home_care'],
          lat: 32.8140,
          lng: -96.9489,
          address: 'MacArthur Blvd, Irving TX',
          status: 'active',
          workStatus: 'In Transit',
          phone: '(972) 555-0341'
        },
        {
          id: 'c7777777-7777-7777-7777-777777777777',
          userId: 'b8888888-8888-8888-8888-888844444444',
          name: 'Megan Armstrong, OT',
          title: 'Occupational Therapist',
          credentials: 'OT',
          licenseNumber: 'OT-441092',
          specialty: 'Adaptive Equipment & Fall Prevention',
          maxVisits: 5,
          territory: 'Garland & Mesquite',
          serviceLines: ['home_health'],
          lat: 32.9126,
          lng: -96.6389,
          address: 'Broadway Blvd, Garland TX',
          status: 'active',
          workStatus: 'Scheduled',
          phone: '(214) 555-0899'
        }
      ];

      for (const c of cliniciansToInsert) {
        await pool.query(`
          INSERT INTO clinicians (
            id, user_id, organization_id, license_number, specialty, max_daily_visits,
            territory, name, title, credentials, service_lines, latitude, longitude,
            current_address, status, work_status, phone
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
          ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            title = EXCLUDED.title,
            credentials = EXCLUDED.credentials,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            current_address = EXCLUDED.current_address,
            phone = EXCLUDED.phone;
        `, [
          c.id, c.userId, orgId, c.licenseNumber, c.specialty, c.maxVisits,
          c.territory, c.name, c.title, c.credentials, c.serviceLines, c.lat, c.lng,
          c.address, c.status, c.workStatus, c.phone
        ]);
      }
    }

    // 4. Update patients with GPS coordinates
    await pool.query(`
      UPDATE patients SET latitude = 32.7767, longitude = -96.7970, address_street = '1420 Harvard St', address_city = 'Dallas', address_state = 'TX' WHERE first_name = 'Eleanor';
      UPDATE patients SET latitude = 33.0198, longitude = -96.6989, address_street = '88 Tremont St', address_city = 'Plano', address_state = 'TX' WHERE first_name = 'Marcus';
      UPDATE patients SET latitude = 32.9483, longitude = -96.7299, address_street = '500 Commonwealth Ave', address_city = 'Richardson', address_state = 'TX' WHERE first_name = 'Beatrice';
      UPDATE patients SET latitude = 32.8140, longitude = -96.9489, address_street = '42 Forest St', address_city = 'Irving', address_state = 'TX' WHERE first_name = 'David';
      UPDATE patients SET latitude = 32.8023, longitude = -96.8122, address_street = '77 Elm St', address_city = 'Dallas', address_state = 'TX' WHERE first_name = 'Clara';
      UPDATE patients SET latitude = 32.7555, longitude = -97.3308, address_street = '19 Walnut St', address_city = 'Fort Worth', address_state = 'TX' WHERE first_name = 'Arthur';
    `);

    // 5. Check visits count and seed rich Schedule Center visits (Assigned, Unassigned, HUV/SFV)
    const visitCountRes = await pool.query(`SELECT COUNT(*)::int as count FROM visits WHERE time_slot IS NOT NULL`);
    if (visitCountRes.rows[0].count < 10) {
      console.log('[Migration] Seeding Schedule Center visits directly into PostgreSQL...');

      const patRes = await pool.query(`SELECT id, first_name, last_name, service_line, address_street, address_city, address_state, latitude, longitude FROM patients LIMIT 6`);
      const patients = patRes.rows;

      const clinRes = await pool.query(`SELECT id, name FROM clinicians ORDER BY name LIMIT 6`);
      const cliniciansList = clinRes.rows;

      const p1 = patients[0];
      const p2 = patients[1] || p1;
      const p3 = patients[2] || p1;
      const p4 = patients[3] || p1;
      const p5 = patients[4] || p1;

      const c1 = cliniciansList[0];
      const c2 = cliniciansList[1] || c1;
      const c3 = cliniciansList[2] || c1;
      const c4 = cliniciansList[3] || c1;
      const c5 = cliniciansList[4] || c1;

      // Seed assigned visits across the current week
      const assignedVisitsData = [
        {
          patId: p1.id,
          patName: `${p1.first_name} ${p1.last_name}`,
          clinId: c1.id,
          clinName: c1.name,
          sLine: 'home_health',
          vType: 'Skilled Nursing Assessment',
          status: 'completed',
          evv: true,
          evvStatus: 'verified',
          slot: '09:00 AM',
          date: '2026-11-03',
          day: 2,
          addr: `${p1.address_street || '1420 Harvard St'}, ${p1.address_city || 'Dallas TX'}`,
          lat: 32.7767,
          lng: -96.7970,
          notes: 'Full cardiac evaluation, vital signs within baseline limits. Medication reconciliation performed.'
        },
        {
          patId: p2.id,
          patName: `${p2.first_name} ${p2.last_name}`,
          clinId: c1.id,
          clinName: c1.name,
          sLine: 'home_health',
          vType: 'Wound Dressing Change',
          status: 'in_progress',
          evv: false,
          evvStatus: 'pending',
          slot: '01:30 PM',
          date: '2026-11-03',
          day: 2,
          addr: `${p2.address_street || '88 Tremont St'}, ${p2.address_city || 'Plano TX'}`,
          lat: 33.0198,
          lng: -96.6989,
          notes: 'Right lower extremity dressing change with silver alginate. No signs of maceration.'
        },
        {
          patId: p3.id,
          patName: `${p3.first_name} ${p3.last_name}`,
          clinId: c2.id,
          clinName: c2.name,
          sLine: 'home_care',
          vType: 'Personal Care & Hygiene Aide',
          status: 'scheduled',
          evv: false,
          evvStatus: 'pending',
          slot: '10:00 AM',
          date: '2026-11-04',
          day: 3,
          addr: `${p3.address_street || '500 Commonwealth Ave'}, ${p3.address_city || 'Richardson TX'}`,
          lat: 32.9483,
          lng: -96.7299,
          notes: 'Assist with bed bath, transfer support, and light meal prep.'
        },
        {
          patId: p4.id,
          patName: `${p4.first_name} ${p4.last_name}`,
          clinId: c3.id,
          clinName: c3.name,
          sLine: 'home_health',
          vType: 'Physical Therapy Assessment',
          status: 'completed',
          evv: true,
          evvStatus: 'verified',
          slot: '11:15 AM',
          date: '2026-11-02',
          day: 1,
          addr: `${p4.address_street || '42 Forest St'}, ${p4.address_city || 'Irving TX'}`,
          lat: 32.8140,
          lng: -96.9489,
          notes: 'Gait evaluation with four-point cane, functional reach test completed.'
        },
        {
          patId: p5.id,
          patName: `${p5.first_name} ${p5.last_name}`,
          clinId: c4.id,
          clinName: c4.name,
          sLine: 'home_health',
          vType: 'Oxygen Protocol Check',
          status: 'scheduled',
          evv: false,
          evvStatus: 'pending',
          slot: '03:00 PM',
          date: '2026-11-05',
          day: 4,
          addr: `${p5.address_street || '77 Elm St'}, ${p5.address_city || 'Dallas TX'}`,
          lat: 32.8023,
          lng: -96.8122,
          notes: 'SpO2 titration review and concentrator filter inspection.'
        }
      ];

      for (const av of assignedVisitsData) {
        await pool.query(`
          INSERT INTO visits (
            organization_id, patient_id, clinician_id, patient_name, employee_name,
            service_line, visit_type, task, status, priority, time_slot, scheduled_date,
            day_of_week, scheduled_start, scheduled_end, evv_verified, evv_status,
            address, latitude, longitude, clinical_notes
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $7, $8, 'routine', $9, $10::date,
            $11, ($10 || ' 09:00:00')::timestamp with time zone,
            ($10 || ' 10:00:00')::timestamp with time zone,
            $12, $13, $14, $15, $16, $17
          );
        `, [
          orgId, av.patId, av.clinId, av.patName, av.clinName,
          av.sLine, av.vType, av.status, av.slot, av.date,
          av.day, av.evv, av.evvStatus, av.addr, av.lat, av.lng, av.notes
        ]);
      }

      // Seed unassigned visits
      const unassignedData = [
        {
          patId: p1.id,
          patName: `${p1.first_name} ${p1.last_name}`,
          sLine: 'home_health',
          task: 'RN - Skilled Nurse Wound VAC',
          priority: 'urgent',
          slot: '10:00 AM - 11:30 AM',
          date: '2026-11-04',
          day: 3,
          addr: '1420 Harvard St, Dallas TX',
          creds: ['RN'],
          notes: 'VAC dressing change due every 48 hours. Urgent coverage required.'
        },
        {
          patId: p3.id,
          patName: `${p3.first_name} ${p3.last_name}`,
          sLine: 'home_care',
          task: 'HHA - Routine Personal Care & Bath',
          priority: 'routine',
          slot: '08:30 AM - 10:30 AM',
          date: '2026-11-05',
          day: 4,
          addr: '500 Commonwealth Ave, Richardson TX',
          creds: ['HHA'],
          notes: 'Attendant needed for morning transfer and hygiene routine.'
        },
        {
          patId: p4.id,
          patName: `${p4.first_name} ${p4.last_name}`,
          sLine: 'home_health',
          task: 'PT - Physical Therapy Gait Training',
          priority: 'urgent',
          slot: '02:00 PM - 03:00 PM',
          date: '2026-11-06',
          day: 5,
          addr: '42 Forest St, Irving TX',
          creds: ['PT'],
          notes: 'Fall risk assessment and assistive device evaluation.'
        },
        {
          patId: p2.id,
          patName: `${p2.first_name} ${p2.last_name}`,
          sLine: 'home_health',
          task: 'RN - OASIS 30-Day Recertification',
          priority: 'stat',
          slot: '01:00 PM - 03:00 PM',
          date: '2026-11-04',
          day: 3,
          addr: '88 Tremont St, Plano TX',
          creds: ['RN'],
          notes: 'Compliance deadline window expires in 48 hours.'
        }
      ];

      for (const uv of unassignedData) {
        await pool.query(`
          INSERT INTO visits (
            organization_id, patient_id, clinician_id, patient_name, employee_name,
            service_line, visit_type, task, status, priority, time_slot, scheduled_date,
            day_of_week, scheduled_start, scheduled_end, evv_verified, evv_status,
            address, required_credentials, clinical_notes
          ) VALUES (
            $1, $2, NULL, $3, 'Unassigned',
            $4, $5, $5, 'unassigned', $6, $7, $8::date,
            $9, ($8 || ' 09:00:00')::timestamp with time zone,
            ($8 || ' 10:00:00')::timestamp with time zone,
            false, 'pending', $10, $11, $12
          );
        `, [
          orgId, uv.patId, uv.patName, uv.sLine, uv.task, uv.priority,
          uv.slot, uv.date, uv.day, uv.addr, uv.creds, uv.notes
        ]);
      }

      // Seed HUV & SFV report compliance records
      const huvSfvData = [
        {
          patId: p1.id,
          patName: `${p1.first_name} ${p1.last_name}`,
          sLine: 'hospice',
          task: 'Hospice Initial Assessment (HUV1)',
          type: 'HUV',
          taskStatus: 'Completed',
          days: 0,
          date: '2026-11-01',
          admDate: '2026-10-28',
          notes: 'Comprehensive palliative assessment completed on day 4 post-admission.'
        },
        {
          patId: p2.id,
          patName: `${p2.first_name} ${p2.last_name}`,
          sLine: 'hospice',
          task: 'Hospice Update Visit (HUV2)',
          type: 'HUV',
          taskStatus: 'Scheduled',
          days: 2,
          date: '2026-11-04',
          admDate: '2026-10-25',
          notes: 'Second hospice update window approaching day 10 compliance benchmark.'
        },
        {
          patId: p3.id,
          patName: `${p3.first_name} ${p3.last_name}`,
          sLine: 'hospice',
          task: 'Service Facilitation Visit (SFV)',
          type: 'SFV',
          taskStatus: 'Documented',
          days: 5,
          date: '2026-11-02',
          admDate: '2026-10-15',
          notes: 'Interdisciplinary team care plan review finalized.'
        },
        {
          patId: p4.id,
          patName: `${p4.first_name} ${p4.last_name}`,
          sLine: 'hospice',
          task: 'Service Facilitation Visit (SFV)',
          type: 'SFV',
          taskStatus: 'Pending Signature',
          days: 1,
          date: '2026-11-03',
          admDate: '2026-10-20',
          notes: 'Supervisor co-signature pending for continuous home care authorization.'
        }
      ];

      for (const hs of huvSfvData) {
        await pool.query(`
          INSERT INTO visits (
            organization_id, patient_id, clinician_id, patient_name, employee_name,
            service_line, visit_type, task, status, priority, time_slot, scheduled_date,
            day_of_week, scheduled_start, scheduled_end, evv_verified, evv_status,
            huv_sfv_type, task_status, days_remaining, admission_date, clinical_notes
          ) VALUES (
            $1, $2, NULL, $3, 'Compliance Officer',
            'hospice', $4, $4, 'scheduled', 'routine', '10:00 AM', $5::date,
            2, ($5 || ' 10:00:00')::timestamp with time zone,
            ($5 || ' 11:00:00')::timestamp with time zone,
            false, 'pending', $6, $7, $8, $9::date, $10
          );
        `, [
          orgId, hs.patId, hs.patName, hs.task, hs.date,
          hs.type, hs.taskStatus, hs.days, hs.admDate, hs.notes
        ]);
      }
    }

    console.log('[Migration] Schedule Center database migration completed successfully!');
  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    await pool.end();
  }
}

migrateSchedule();
