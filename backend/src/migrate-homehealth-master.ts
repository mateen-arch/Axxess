import { pool } from './db';

async function migrateHomeHealthMaster() {
  console.log('[Migration] Creating Home Health master tables...');
  try {
    // 1. Orders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        patient_name VARCHAR(255) NOT NULL,
        mrn VARCHAR(50),
        episode_associated VARCHAR(255),
        attending_physician VARCHAR(255),
        send_to VARCHAR(255),
        copy_to VARCHAR(255),
        order_date DATE NOT NULL DEFAULT CURRENT_DATE,
        order_time VARCHAR(50),
        effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
        order_is_for_next_episode BOOLEAN DEFAULT FALSE,
        summary_title VARCHAR(255) NOT NULL,
        order_type VARCHAR(100) NOT NULL DEFAULT 'Medication Orders',
        order_content TEXT,
        order_read_back_and_verified BOOLEAN DEFAULT TRUE,
        clinician_signature VARCHAR(255) NOT NULL,
        signature_date DATE NOT NULL DEFAULT CURRENT_DATE,
        signature_time VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'Created',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Face-to-Face Encounters
    await pool.query(`
      CREATE TABLE IF NOT EXISTS face_to_face_encounters (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        patient_name VARCHAR(255) NOT NULL,
        mrn VARCHAR(50),
        patient_status VARCHAR(50) DEFAULT 'Active',
        episode_associated VARCHAR(255),
        physician VARCHAR(255) NOT NULL,
        request_date DATE NOT NULL DEFAULT CURRENT_DATE,
        certifying_type VARCHAR(100) DEFAULT 'POC Certifying Physician',
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Facilities
    await pool.query(`
      CREATE TABLE IF NOT EXISTS facilities (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        facility_type VARCHAR(100) NOT NULL DEFAULT 'Hospital',
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL DEFAULT 'MA',
        zip VARCHAR(20) NOT NULL,
        phone VARCHAR(50),
        fax VARCHAR(50),
        contact_person VARCHAR(150),
        email VARCHAR(150),
        comments TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Physicians
    await pool.query(`
      CREATE TABLE IF NOT EXISTS physicians (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        credentials VARCHAR(50) DEFAULT 'MD',
        npi VARCHAR(20) NOT NULL,
        taxonomy_code VARCHAR(50),
        medicaid_provider_id VARCHAR(50),
        pecos_status VARCHAR(50) DEFAULT 'Verified',
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL DEFAULT 'MA',
        zip VARCHAR(20) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        fax VARCHAR(50),
        email VARCHAR(150),
        order_delivery_method VARCHAR(100) DEFAULT 'Fax Transmission',
        comments TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Insurance / Payers
    await pool.query(`
      CREATE TABLE IF NOT EXISTS insurance_payers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        payer_name VARCHAR(255) NOT NULL,
        payer_type VARCHAR(100) NOT NULL DEFAULT 'Commercial / Private insurance',
        source_of_payment VARCHAR(100),
        clearinghouse VARCHAR(100) DEFAULT 'Availity',
        billing_provider_id VARCHAR(100),
        address_line1 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50) DEFAULT 'MA',
        zip VARCHAR(20),
        phone VARCHAR(50),
        fax VARCHAR(50),
        email VARCHAR(150),
        contact_person VARCHAR(150),
        requires_authorization BOOLEAN DEFAULT FALSE,
        notes TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Pharmacies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pharmacies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL DEFAULT 'MA',
        zip VARCHAR(20) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        fax VARCHAR(50),
        contact_person VARCHAR(150),
        email VARCHAR(150),
        comments TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Infection Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS infection_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        patient_name VARCHAR(255) NOT NULL,
        mrn VARCHAR(50),
        date_of_infection DATE NOT NULL DEFAULT CURRENT_DATE,
        episode_period VARCHAR(255),
        infection_site VARCHAR(150) NOT NULL,
        infection_type VARCHAR(150) NOT NULL,
        pathogen VARCHAR(150),
        treatment TEXT,
        precautions VARCHAR(150) DEFAULT 'Standard Precautions',
        physician_notified BOOLEAN DEFAULT TRUE,
        physician_name VARCHAR(150),
        resolved BOOLEAN DEFAULT FALSE,
        resolution_date DATE,
        surveillance_notes TEXT,
        created_by VARCHAR(150) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Incident Logs
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
        patient_name VARCHAR(255) NOT NULL,
        mrn VARCHAR(50),
        incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
        incident_time VARCHAR(50),
        incident_type VARCHAR(150) NOT NULL,
        location VARCHAR(150),
        injury_sustained BOOLEAN DEFAULT FALSE,
        injury_description TEXT,
        narrative TEXT NOT NULL,
        action_taken TEXT,
        physician_notified BOOLEAN DEFAULT TRUE,
        supervisor_notified BOOLEAN DEFAULT TRUE,
        reporter_name VARCHAR(150) NOT NULL,
        reporter_role VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Under Review',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[Migration] All tables created. Now checking initial seeds...');
    const orgRes = await pool.query(`SELECT id FROM organizations LIMIT 1`);
    const orgId = orgRes.rows[0]?.id;

    if (orgId) {
      // Seed initial facility if none exists
      const facCount = await pool.query(`SELECT COUNT(*) FROM facilities`);
      if (parseInt(facCount.rows[0].count, 10) === 0) {
        await pool.query(`
          INSERT INTO facilities (organization_id, name, facility_type, address_line1, city, state, zip, phone, fax, status)
          VALUES 
            ($1, 'Beverly Hospital', 'Hospital', '85 Herrick St', 'Beverly', 'MA', '01915', '(978) 922-3000', '(978) 922-3010', 'Active'),
            ($1, 'Salem Hospital', 'Hospital', '81 Highland Ave', 'Salem', 'MA', '01970', '(978) 741-1200', '(978) 741-1215', 'Active'),
            ($1, 'Brigham and Women’s Hospital', 'Hospital', '75 Francis St', 'Boston', 'MA', '02115', '(617) 732-5500', '(617) 732-5510', 'Active');
        `, [orgId]);
      }

      // Seed initial physicians if none exists
      const phyCount = await pool.query(`SELECT COUNT(*) FROM physicians`);
      if (parseInt(phyCount.rows[0].count, 10) === 0) {
        await pool.query(`
          INSERT INTO physicians (organization_id, first_name, last_name, credentials, npi, address_line1, city, state, zip, phone, fax, status)
          VALUES 
            ($1, 'Anita', 'Gupta', 'MD', '1487920194', '100 Cummings Center Suite 120', 'Beverly', 'MA', '01915', '(978) 555-0182', '(978) 555-0199', 'Active'),
            ($1, 'Michael', 'Chen', 'MD', '1928374651', '450 Essex St', 'Salem', 'MA', '01970', '(978) 555-0144', '(978) 555-0149', 'Active'),
            ($1, 'Sarah', 'Patel', 'DO', '1192837462', '85 Constitution Way', 'Danvers', 'MA', '01923', '(978) 555-0165', '(978) 555-0169', 'Active'),
            ($1, 'John', 'Adams', 'MD', '1728394012', '200 Highland Ave', 'Peabody', 'MA', '01960', '(978) 555-0111', '(978) 555-0119', 'Active'),
            ($1, 'Leslie', 'Rigali', 'MD', '1839201948', '77 Sohier RD', 'Beverly', 'MA', '01915', '(351) 201-4985', '(351) 201-4990', 'Active');
        `, [orgId]);
      }

      // Seed initial pharmacies if none exists
      const pharmCount = await pool.query(`SELECT COUNT(*) FROM pharmacies`);
      if (parseInt(pharmCount.rows[0].count, 10) === 0) {
        await pool.query(`
          INSERT INTO pharmacies (organization_id, name, address_line1, city, state, zip, phone, fax, status)
          VALUES 
            ($1, 'Walgreens Pharmacy #1456', '54 Elliot St', 'Beverly', 'MA', '01915', '(978) 921-0506', '(978) 921-0510', 'Active'),
            ($1, 'CVS Pharmacy #0028', '19 Dodge St', 'Beverly', 'MA', '01915', '(978) 927-0060', '(978) 927-0065', 'Active'),
            ($1, 'Eaton Apothecary', '290 Highland Ave', 'Salem', 'MA', '01970', '(978) 744-0300', '(978) 744-0310', 'Active');
        `, [orgId]);
      }

      // Seed initial insurance payers if none exists
      const payCount = await pool.query(`SELECT COUNT(*) FROM insurance_payers`);
      if (parseInt(payCount.rows[0].count, 10) === 0) {
        await pool.query(`
          INSERT INTO insurance_payers (organization_id, payer_name, payer_type, source_of_payment, clearinghouse, address_line1, city, state, zip, phone, status)
          VALUES 
            ($1, 'Traditional Medicare (Part A)', 'Traditional Medicare (Part A)', 'MA - Medicare Part A', 'Availity', '7500 Security Blvd', 'Baltimore', 'MD', '21244', '(800) 633-4227', 'Active'),
            ($1, 'Commonwealth Care Alliance', 'Medicaid (HMO/managed care)', 'MC - Medicaid Managed Care', 'Availity', '30 Winter St', 'Boston', 'MA', '02108', '(866) 610-2273', 'Active'),
            ($1, 'Blue Cross Blue Shield of MA', 'Commercial / Private insurance', 'CI - Commercial Insurance', 'Availity', 'Landmark Center, 401 Park Dr', 'Boston', 'MA', '02215', '(800) 262-2583', 'Active'),
            ($1, 'MassHealth (Medicaid Traditional)', 'Medicaid (traditional fee-for-service)', 'MD - Medicaid Fee-for-Service', 'Availity', '100 Hancock St', 'Quincy', 'MA', '02171', '(800) 841-2900', 'Active');
        `, [orgId]);
      }
    }

    console.log('[Migration] Home Health master migration completed successfully!');
  } catch (err) {
    console.error('[Migration Error]', err);
  } finally {
    await pool.end();
  }
}

migrateHomeHealthMaster();
