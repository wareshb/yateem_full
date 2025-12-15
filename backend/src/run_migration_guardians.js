
import { query } from './db.js';

async function runMigration() {
    try {
        console.log('Starting migration to add missing columns (Syntax Fix)...');

        // Helper to add column safely
        const addColumn = async (table, columnDef) => {
            try {
                await query(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
                console.log(`Executed: ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
            } catch (e) {
                // Check for specific error codes for "Duplicate column name"
                // MySQL: 1060, MariaDB might be similar
                if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes('Duplicate column name')) {
                    console.log(`Skipped (Exists): ${table} -> ${columnDef.split(' ')[0]}`);
                } else {
                    console.log(`Error adding to ${table}: ${columnDef} - ${e.message}`);
                }
            }
        };

        const columns = [
            "date_of_birth DATE",
            "nationality VARCHAR(100)",
            "address VARCHAR(255)",
            "monthly_income DECIMAL(12,2)",
            "health_status TEXT",
            "marital_status VARCHAR(100)",
            "educational_level VARCHAR(150)",
            "education_level VARCHAR(150)",
            "work_place VARCHAR(200)",
            "province VARCHAR(100)",
            "district VARCHAR(100)",
            "notes TEXT" // Ensure notes is added where missing
        ];

        console.log('--- Updating Guardians Table ---');
        for (const col of columns) {
            await addColumn('guardians', col);
        }

        console.log('--- Updating Mothers Table ---');
        for (const col of columns) {
            // Some columns like 'notes' might differ or technically not be needed if they exist
            // But adding them for consistency if missing is fine.
            await addColumn('mothers', col);
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
