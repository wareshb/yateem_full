
import { query } from './db.js';

async function checkColumns() {
    try {
        console.log('--- Mothers Table ---');
        const mothers = await query('DESCRIBE mothers');
        console.log(mothers.map(c => c.Field).join(', '));

        console.log('\n--- Guardians Table ---');
        const guardians = await query('DESCRIBE guardians');
        console.log(guardians.map(c => c.Field).join(', '));

        console.log('\n--- Residence Info Table ---');
        try {
            const resInfo = await query('DESCRIBE residence_info');
            console.log(resInfo.map(c => c.Field).join(', '));
        } catch (e) {
            console.log('Table residence_info does not exist');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkColumns();
