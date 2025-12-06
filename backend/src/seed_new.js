import { v4 as uuidv4 } from 'uuid';
import { query } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('🌱 Seeding enhanced database...');

        // Users
        const passwordHash = await bcrypt.hash('admin123', 10);
        await query(`
            INSERT INTO users (full_name, email, password_hash, role)
            VALUES 
            ('مدير النظام', 'admin@example.com', ?, 'admin'),
            ('أسماء - باحثة', 'asmaa@ngo.org', ?, 'social_worker'),
            ('مريم - مدخلة', 'mariam@ngo.org', ?, 'data_entry')
            ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)
        `, [passwordHash, passwordHash, passwordHash]);
        console.log('✓ Users seeded');

        // Fathers
        const father1Uid = uuidv4();
        const father2Uid = uuidv4();
        await query(`
            INSERT INTO fathers (uid, full_name, date_of_birth, date_of_death, cause_of_death, death_certificate_type, death_certificate_number, occupation_before_death)
            VALUES 
            (?, 'علي محمد الحداد', '1975-03-15', '2020-05-20', 'حادث سير', 'مدنية', 'D-2020-1234', 'مدرس'),
            (?, 'أحمد حسن العريقي', '1978-08-10', '2019-12-01', 'مرض مزمن', 'عسكرية', 'M-2019-5678', 'عسكري')
        `, [father1Uid, father2Uid]);
        console.log('✓ Fathers seeded');

        // Mothers
        const mother1Uid = uuidv4();
        const mother2Uid = uuidv4();
        await query(`
            INSERT INTO mothers (uid, full_name, id_type, id_number, marital_status, occupation, can_read_write, phone_1, phone_2, is_custodian, number_of_orphans_in_custody)
            VALUES 
            (?, 'فاطمة عبدالله', 'بطاقة شخصية', '01234567890', 'أرملة', 'ربة منزل', TRUE, '777123456', '733987654', TRUE, 3),
            (?, 'نادية سالم', 'بطاقة شخصية', '09876543210', 'أرملة', 'معلمة', TRUE, '777654321', NULL, TRUE, 2)
        `, [mother1Uid, mother2Uid]);
        console.log('✓ Mothers seeded');

        // Guardians
        const guardian1Uid = uuidv4();
        await query(`
            INSERT INTO guardians (uid, full_name, relationship_to_orphan, id_type, id_number, phone, current_occupation, number_of_orphans_in_custody)
            VALUES 
            (?, 'صالح أحمد - العم', 'عم', 'بطاقة شخصية', '05555555555', '777888999', 'تاجر', 2)
        `, [guardian1Uid]);
        console.log('✓ Guardians seeded');

        // Residence Info
        await query(`
            INSERT INTO residence_info (country, province, district, neighborhood_or_street, residence_condition)
            VALUES 
            ('اليمن', 'صنعاء', 'حدة', 'شارع الستين', 'متوسطة'),
            ('اليمن', 'عدن', 'المعلا', 'حي القاهرة', 'جيدة'),
            ('اليمن', 'تعز', 'صالة', 'شارع جمال', 'ضعيفة')
        `);
        const residences = await query('SELECT id FROM residence_info ORDER BY id');
        console.log('✓ Residence info seeded');

        // Get IDs
        const [father1] = await query('SELECT id FROM fathers WHERE uid = ?', [father1Uid]);
        const [father2] = await query('SELECT id FROM fathers WHERE uid = ?', [father2Uid]);
        const [mother1] = await query('SELECT id FROM mothers WHERE uid = ?', [mother1Uid]);
        const [mother2] = await query('SELECT id FROM mothers WHERE uid = ?', [mother2Uid]);
        const [guardian] = await query('SELECT id FROM guardians WHERE uid = ?', [guardian1Uid]);
        const guardianId = guardian.id;

        // Orphans
        const orphan1Uid = uuidv4();
        const orphan2Uid = uuidv4();
        const orphan3Uid = uuidv4();

        await query(`
            INSERT INTO orphans (
                uid, orphan_id, full_name, date_of_birth, gender, nationality, id_type, id_number,
                birth_country, birth_province, birth_district, birth_neighborhood,
                origin_country, origin_province, origin_district,
                male_siblings_count, female_siblings_count, lives_with_siblings,
                health_condition, illness_type, illness_notes,
                is_studying, grade_level, school_name, school_type, academic_rating,
                memorizes_quran, quran_center_name, quran_parts_memorized,
                father_id, mother_id, guardian_id, mother_is_custodian, residence_id
            )
            VALUES 
            (?, 'YT-2025-001', 'أحمد علي الحداد', '2014-06-15', 'male', 'يمني', 'شهادة ميلاد', 'B-2014-001',
             'اليمن', 'صنعاء', 'بني الحارث', 'حي النصر',
             'اليمن', 'صنعاء', 'بني الحارث',
             2, 1, TRUE,
             'سليم', NULL, NULL,
             TRUE, 'الخامس الابتدائي', 'مدرسة النور', 'حكومي', 'جيد جدا',
             TRUE, 'مركز الإيمان', 2.5,
             ?, ?, NULL, TRUE, ?),
            
            (?, 'YT-2025-002', 'سارة أحمد العريقي', '2012-03-20', 'female', 'يمني', 'شهادة ميلاد', 'B-2012-002',
             'اليمن', 'عدن', 'المنصورة', 'حي السلام',
             'اليمن', 'عدن', 'المنصورة',
             1, 0, TRUE,
             'مريض', 'مرض مزمن', 'ربو خفيف',
             TRUE, 'الثالث الإعدادي', 'مدرسة الأمل', 'حكومي', 'ممتاز',
             TRUE, 'مركز الفرقان', 5.0,
             ?, ?, NULL, TRUE, ?),
            
            (?, 'YT-2025-003', 'علي حسن المقطري', '2015-11-10', 'male', 'يمني', 'شهادة ميلاد', 'B-2015-003',
             'اليمن', 'تعز', 'القاهرة', 'حي الوحدة',
             'اليمن', 'تعز', 'القاهرة',
             0, 1, TRUE,
             'مريض', 'إعاقة', 'إعاقة حركية بسيطة',
             TRUE, 'الثاني الابتدائي', 'مدرسة الحرية', 'أهلي', 'جيد',
             FALSE, NULL, 0,
             NULL, NULL, ?, FALSE, ?)
        `, [
            orphan1Uid, father1.id, mother1.id, residences[0].id,
            orphan2Uid, father2.id, mother2.id, residences[1].id,
            orphan3Uid, guardianId, residences[2].id
        ]);

        console.log('✓ Orphans seeded');

        // Get orphan IDs
        const [orphan1] = await query('SELECT id FROM orphans WHERE uid = ?', [orphan1Uid]);
        const [orphan2] = await query('SELECT id FROM orphans WHERE uid = ?', [orphan2Uid]);
        const [orphan3] = await query('SELECT id FROM orphans WHERE uid = ?', [orphan3Uid]);

        // Siblings
        await query(`
            INSERT INTO orphan_siblings (
                uid, orphan_id, full_name, date_of_birth, gender,
                grade_level, school_name, academic_rating,
                memorizes_quran, quran_center_name, quran_parts_memorized,
                father_id, mother_id
            )
            VALUES 
            (?, ?, 'محمد علي الحداد', '2016-09-01', 'male',
             'الثالث الابتدائي', 'مدرسة النور', 'جيد',
             TRUE, 'مركز الإيمان', 1.0,
             ?, ?),
            (?, ?, 'زينب علي الحداد', '2018-12-20', 'female',
             'الأول الابتدائي', 'مدرسة النور', 'ممتاز',
             FALSE, NULL, 0,
             ?, ?)
        `, [
            uuidv4(), orphan1.id, father1.id, mother1.id,
            uuidv4(), orphan1.id, father1.id, mother1.id
        ]);
        console.log('✓ Siblings seeded');

        // Sponsor Organizations
        const sponsor1Uid = uuidv4();
        const sponsor2Uid = uuidv4();
        await query(`
            INSERT INTO sponsor_organizations (uid, name, email, phone, sponsorship_type, responsible_person, start_date, notes)
            VALUES 
            (?, 'مؤسسة الرحمة للأعمال الخيرية', 'info@rahma.org', '777111222', 'نقدية,دراسية', 'أ. محمد السعيد', '2024-01-01', 'جهة موثوقة'),
            (?, 'جمعية الخير والإحسان', 'contact@khair.org', '733444555', 'نقدية,صحية', 'د. عبدالله حسن', '2024-06-01', NULL)
        `, [sponsor1Uid, sponsor2Uid]);
        console.log('✓ Sponsor organizations seeded');

        // Get sponsor IDs
        const [sponsor1] = await query('SELECT id FROM sponsor_organizations WHERE uid = ?', [sponsor1Uid]);
        const [sponsor2] = await query('SELECT id FROM sponsor_organizations WHERE uid = ?', [sponsor2Uid]);

        // Sponsorships
        await query(`
            INSERT INTO sponsorships (sponsor_organization_id, orphan_id, start_date, status, notes)
            VALUES 
            (?, ?, '2024-01-15', 'active', 'كفالة شهرية 200 دولار'),
            (?, ?, '2024-06-10', 'active', 'كفالة شهرية 150 دولار')
        `, [sponsor1.id, orphan1.id, sponsor2.id, orphan2.id]);
        console.log('✓ Sponsorships seeded');

        // Marketing Organizations
        const marketing1Uid = uuidv4();
        await query(`
            INSERT INTO marketing_organizations (uid, name, email, phone, responsible_person, marketing_date, notes)
            VALUES 
            (?, 'منظمة UNICEF', 'yemen@unicef.org', '777999888', 'السيد جون سميث', '2024-11-01', 'منظمة دولية')
        `, [marketing1Uid]);
        console.log('✓ Marketing organizations seeded');

        // Get marketing org ID
        const [marketing1] = await query('SELECT id FROM marketing_organizations WHERE uid = ?', [marketing1Uid]);

        // Marketing Records
        await query(`
            INSERT INTO marketing_records (marketing_organization_id, orphan_id, marketing_date, status, notes)
            VALUES 
            (?, ?, '2024-11-15', 'pending', 'في انتظار الموافقة')
        `, [marketing1.id, orphan3.id]);
        console.log('✓ Marketing records seeded');

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        console.error(err.stack);
        process.exit(1);
    }
}

seed();
