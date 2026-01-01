import { query } from './src/db.js';

async function migrate() {
    console.log('Starting migration: Unifying Organizations...');

    try {
        // 1. Create new organizations table
        console.log('Creating `organizations` table...');
        await query(`
            CREATE TABLE IF NOT EXISTS organizations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                uid CHAR(36) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(200),
                phone VARCHAR(50),
                responsible_person VARCHAR(200),
                start_date DATE,
                notes TEXT,
                is_sponsor BOOLEAN DEFAULT FALSE,
                is_marketing BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_uid (uid),
                INDEX idx_name (name)
            )
        `);

        // 2. Fetch existing data
        const sponsors = await query('SELECT * FROM sponsor_organizations');
        const marketers = await query('SELECT * FROM marketing_organizations');

        console.log(`Found ${sponsors.length} sponsors and ${marketers.length} marketing orgs.`);

        // 3. Migrate Sponsors
        const sponsorMap = new Map(); // old_id -> new_id
        for (const org of sponsors) {
            const result = await query(`
                INSERT INTO organizations (uid, name, email, phone, responsible_person, start_date, notes, is_sponsor, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
            `, [org.uid, org.name, org.email, org.phone, org.responsible_person, org.start_date, org.notes, org.created_at, org.updated_at]);
            sponsorMap.set(org.id, result.insertId);
        }

        // 4. Migrate Marketers
        // Note: Some marketers might have already been converted to sponsors. 
        // If they are converted, they might effectively be duplicates or linked.
        // For simplicity in this script, we'll migrate them as well, but check if they were converted to a sponsor we just migrated.
        const marketingMap = new Map(); // old_id -> new_id
        for (const org of marketers) {
            let existingId = null;
            if (org.converted_to_sponsor && org.sponsor_organization_id) {
                // If it was converted, the sponsor partner should already be in the map
                existingId = sponsorMap.get(org.sponsor_organization_id);
                if (existingId) {
                    // Update the existing entry to be marketing as well
                    await query('UPDATE organizations SET is_marketing = TRUE WHERE id = ?', [existingId]);
                    marketingMap.set(org.id, existingId);
                    continue; // Skip inserting new
                }
            }

            const result = await query(`
                INSERT INTO organizations (uid, name, email, phone, responsible_person, start_date, notes, is_marketing, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
            `, [org.uid, org.name, org.email, org.phone, org.responsible_person, org.marketing_date, org.notes, org.created_at, org.updated_at]);
            marketingMap.set(org.id, result.insertId);
        }

        // 5. Update References in `sponsorships`
        console.log('Updating `sponsorships` references...');
        // We first need to drop the FK to update values without constraint errors if types differ or to point to new table
        // Actually, we'll just add a new column `organization_id` to sponsorships, populate it, then drop old one.

        // Check if column exists
        try {
            await query('ALTER TABLE sponsorships ADD COLUMN organization_id INT');
            await query('ALTER TABLE sponsorships ADD FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE');
        } catch (e) {
            // Ignore if exists
            console.log('Column organization_id likely exists in sponsorships, skipping add.');
        }

        for (const [oldId, newId] of sponsorMap) {
            await query('UPDATE sponsorships SET organization_id = ? WHERE sponsor_organization_id = ?', [newId, oldId]);
        }

        // 6. Update References in `marketing_records`
        console.log('Updating `marketing_records` references...');
        try {
            await query('ALTER TABLE marketing_records ADD COLUMN organization_id INT');
            await query('ALTER TABLE marketing_records ADD FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE');
        } catch (e) {
            console.log('Column organization_id likely exists in marketing_records, skipping add.');
        }

        for (const [oldId, newId] of marketingMap) {
            await query('UPDATE marketing_records SET organization_id = ? WHERE marketing_organization_id = ?', [newId, oldId]);
        }

        // 7. (Optional) Cleanup - Drop old tables or columns
        // For safety, we will NOT drop old tables yet, but we can drop the FK constraints on old tables to avoid issues?
        // Let's just leave them for now. The new logic will use `organization_id`.

        console.log('Migration completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
