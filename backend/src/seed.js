import { v4 as uuidv4 } from 'uuid';
import { query } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('Seeding database...');

        // Users
        const passwordHash = await bcrypt.hash('admin123', 10);
        await query(`
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES 
      ('مدير النظام', 'admin@example.com', ?, 'admin'),
      ('أسماء - باحثة', 'asmaa@ngo.org', ?, 'social_worker'),
      ('مريم - مدخلة', 'mariam@ngo.org', ?, 'data_entry')
      ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash)
    `, [passwordHash, passwordHash, passwordHash]);
        console.log('Users seeded');

        // Guardians
        const guardians = [
            { name: 'صالح علي', phone: '777123123', job: 'مدرس', income: 0, rating: 'ممتاز' },
            { name: 'محمد أحمد', phone: '733555222', job: 'تاجر', income: 150, rating: 'جيد' }
        ];

        for (const g of guardians) {
            await query(`
        INSERT INTO guardians (full_name, contact_phone, occupation, monthly_income, notes)
        VALUES (?, ?, ?, ?, ?)
      `, [g.name, g.phone, g.job, g.income, g.rating]);
        }
        console.log('Guardians seeded');

        // Sponsors
        const sponsors = [
            { name: 'مؤسسة الرحمة', type: 'ngo', contact: 'info@rahma.org' },
            { name: 'UNICEF', type: 'international_org', contact: 'unicef@example.org' },
            { name: 'د. رامي', type: 'individual', contact: 'rami@gmail.com' }
        ];

        for (const s of sponsors) {
            await query(`
        INSERT INTO sponsors (name, sponsor_type, email)
        VALUES (?, ?, ?)
      `, [s.name, s.type, s.contact]);
        }
        console.log('Sponsors seeded');

        // Orphans
        const orphans = [
            {
                name: 'أحمد علي',
                age: 9,
                status: 'lost_father',
                location: 'صنعاء - حدة',
                education: 'تعليم أساسي',
                health: 'جيد',
                uid: uuidv4()
            },
            {
                name: 'سارة محمد',
                age: 13,
                status: 'lost_parents',
                location: 'عدن - المعلا',
                education: 'تعليم ثانوي',
                health: 'يعاني من ربو',
                uid: uuidv4()
            },
            {
                name: 'علي حسن',
                age: 7,
                status: 'lost_father',
                location: 'تعز - القاهرة',
                education: 'أمي',
                health: 'إعاقة حركية بسيطة',
                uid: uuidv4()
            }
        ];

        for (const o of orphans) {
            await query(`
        INSERT INTO orphans (uid, full_name, orphan_status, address_details, education_level, health_status, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? YEAR))
      `, [o.uid, o.name, o.status, o.location, o.education, o.health, o.age]);
        }
        console.log('Orphans seeded');

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
