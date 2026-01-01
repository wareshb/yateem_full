import { query } from './src/db.js';

async function applySchema() {
    try {
        console.log('🔄 Applying new schema changes...');

        // System Settings
        await query(`
            CREATE TABLE IF NOT EXISTS system_settings (
              id INT AUTO_INCREMENT PRIMARY KEY,
              org_name VARCHAR(255) DEFAULT 'نظام رعاية الأيتام',
              org_logo VARCHAR(500),
              org_description TEXT,
              address_country VARCHAR(100),
              address_city VARCHAR(100),
              address_street VARCHAR(255),
              phone_1 VARCHAR(50),
              phone_2 VARCHAR(50),
              email VARCHAR(200),
              website VARCHAR(255),
              smtp_host VARCHAR(255),
              smtp_user VARCHAR(255),
              smtp_pass VARCHAR(255),
              smtp_port INT DEFAULT 587,
              default_currency VARCHAR(20) DEFAULT 'USD',
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created system_settings table');

        // Initial Settings Seed
        await query(`
            INSERT INTO system_settings (org_name) 
            SELECT 'نظام رعاية الأيتام' WHERE NOT EXISTS (SELECT * FROM system_settings)
        `);

        // Bank Accounts
        await query(`
            CREATE TABLE IF NOT EXISTS organization_bank_accounts (
              id INT AUTO_INCREMENT PRIMARY KEY,
              bank_name VARCHAR(255) NOT NULL,
              account_number VARCHAR(100) NOT NULL,
              iban VARCHAR(100),
              currency VARCHAR(20) DEFAULT 'USD',
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created organization_bank_accounts table');

        process.exit(0);
    } catch (err) {
        console.error('❌ Error applying schema:', err);
        process.exit(1);
    }
}

applySchema();
