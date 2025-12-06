import { query } from './db.js';

async function fixPassword() {
    try {
        // Password hash for 'admin123'
        const correctHash = '$2b$10$Lbe1/taDrQvb2DqqafaOg.khP9mZtWckxCFp8Pg5CGum.3hnsCBTS';

        await query(`
            UPDATE users 
            SET password_hash = ? 
            WHERE email = 'admin@example.com'
        `, [correctHash]);

        console.log('✅ Password updated successfully!');
        console.log('You can now login with:');
        console.log('  Email: admin@example.com');
        console.log('  Password: admin123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

fixPassword();
