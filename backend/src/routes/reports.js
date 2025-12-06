import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET /api/reports/all-orphans - Comprehensive orphans report with filters
router.get('/all-orphans', async (req, res, next) => {
  try {
    const {
      sponsor_id,        // Filter by sponsor organization
      marketing_id,      // Filter by marketing organization
      age_min,           // Minimum age
      age_max,           // Maximum age
      is_sponsored,      // true/false - only sponsored or unsponsored
      is_marketed,       // true/false - only marketed or not marketed
      province,          // Filter by province
      search,            // Search in name
      sort_by = 'full_name',  // Column to sort by
      sort_order = 'ASC'      // ASC or DESC
    } = req.query;

    let sql = `
      SELECT 
        o.*,
        f.full_name as father_name, f.date_of_death, f.cause_of_death,
        m.full_name as mother_name, m.phone_1 as mother_phone, m.is_custodian,
        g.full_name as guardian_name, g.phone as guardian_phone,
        r.province, r.district, r.neighborhood_or_street, r.residence_condition,
        so.name as sponsor_name, so.sponsorship_type,
        mo.name as marketing_org_name,
        s.start_date as sponsorship_start_date, s.status as sponsorship_status
      FROM orphans o
      LEFT JOIN fathers f ON f.id = o.father_id
      LEFT JOIN mothers m ON m.id = o.mother_id
      LEFT JOIN guardians g ON g.id = o.guardian_id
      LEFT JOIN residence_info r ON r.id = o.residence_id
      LEFT JOIN sponsorships s ON s.orphan_id = o.id AND s.status = 'active'
      LEFT JOIN sponsor_organizations so ON so.id = s.sponsor_organization_id
      LEFT JOIN marketing_records mr ON mr.orphan_id = o.id AND mr.status != 'converted_to_sponsorship'
      LEFT JOIN marketing_organizations mo ON mo.id = mr.marketing_organization_id
      WHERE 1=1
    `;

    const params = {};

    // Apply filters
    if (sponsor_id) {
      sql += ' AND s.sponsor_organization_id = :sponsor_id';
      params.sponsor_id = sponsor_id;
    }

    if (marketing_id) {
      sql += ' AND mr.marketing_organization_id = :marketing_id';
      params.marketing_id = marketing_id;
    }

    if (age_min) {
      sql += ' AND TIMESTAMPDIFF(YEAR, o.date_of_birth, CURDATE()) >= :age_min';
      params.age_min = age_min;
    }

    if (age_max) {
      sql += ' AND TIMESTAMPDIFF(YEAR, o.date_of_birth, CURDATE()) <= :age_max';
      params.age_max = age_max;
    }

    if (is_sponsored === 'true') {
      sql += ' AND s.id IS NOT NULL';
    } else if (is_sponsored === 'false') {
      sql += ' AND s.id IS NULL';
    }

    if (is_marketed === 'true') {
      sql += ' AND mr.id IS NOT NULL';
    } else if (is_marketed === 'false') {
      sql += ' AND mr.id IS NULL';
    }

    if (province) {
      sql += ' AND r.province = :province';
      params.province = province;
    }

    if (search) {
      sql += ' AND o.full_name LIKE :search';
      params.search = `%${search}%`;
    }

    // Sorting
    const allowedSortColumns = [
      'full_name', 'age', 'gender', 'province', 'health_condition',
      'is_studying', 'sponsorship_status', 'father_name', 'mother_name'
    ];

    const sortColumn = allowedSortColumns.includes(sort_by) ? sort_by : 'full_name';
    const order = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    if (sortColumn === 'province') {
      sql += ` ORDER BY r.province ${order}`;
    } else if (sortColumn === 'father_name') {
      sql += ` ORDER BY f.full_name ${order}`;
    } else if (sortColumn === 'mother_name') {
      sql += ` ORDER BY m.full_name ${order}`;
    } else {
      sql += ` ORDER BY o.${sortColumn} ${order}`;
    }

    const orphans = await query(sql, params);
    res.json(orphans);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/mothers - Report of all mothers and their orphans
router.get('/mothers', async (req, res, next) => {
  try {
    const mothers = await query(`
      SELECT 
        m.*,
        COUNT(o.id) as orphans_count,
        GROUP_CONCAT(o.full_name SEPARATOR ', ') as orphans_names
      FROM mothers m
      LEFT JOIN orphans o ON o.mother_id = m.id
      GROUP BY m.id
      ORDER BY m.full_name
    `);

    res.json(mothers);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/by-sponsor - Report by sponsor organization
router.get('/by-sponsor', async (req, res, next) => {
  try {
    const { sponsor_id } = req.query;

    let sql = `
      SELECT 
        so.id, so.name, so.email, so.phone, so.sponsorship_type, so.responsible_person,
        COUNT(s.id) as total_sponsorships,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_sponsorships,
        GROUP_CONCAT(DISTINCT o.full_name SEPARATOR ', ') as orphans_names
      FROM sponsor_organizations so
      LEFT JOIN sponsorships s ON s.sponsor_organization_id = so.id
      LEFT JOIN orphans o ON o.id = s.orphan_id
    `;

    const params = {};

    if (sponsor_id) {
      sql += ' WHERE so.id = :sponsor_id';
      params.sponsor_id = sponsor_id;
    }

    sql += ' GROUP BY so.id ORDER BY so.name';

    const sponsors = await query(sql, params);
    res.json(sponsors);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/by-age-group - Report by age groups
router.get('/by-age-group', async (req, res, next) => {
  try {
    const ageGroups = await query(`
      SELECT
        SUM(CASE WHEN age < 6 THEN 1 ELSE 0 END) AS under_6,
        SUM(CASE WHEN age BETWEEN 6 AND 11 THEN 1 ELSE 0 END) AS age_6_11,
        SUM(CASE WHEN age BETWEEN 12 AND 17 THEN 1 ELSE 0 END) AS age_12_17,
        SUM(CASE WHEN age >= 18 THEN 1 ELSE 0 END) AS adults,
        COUNT(*) AS total
      FROM orphans
    `);

    // Get detailed list for each group if requested
    const { detailed } = req.query;

    if (detailed === 'true') {
      const under6 = await query('SELECT * FROM orphans WHERE age < 6 ORDER BY full_name');
      const age6to11 = await query('SELECT * FROM orphans WHERE age BETWEEN 6 AND 11 ORDER BY full_name');
      const age12to17 = await query('SELECT * FROM orphans WHERE age BETWEEN 12 AND 17 ORDER BY full_name');
      const adults = await query('SELECT * FROM orphans WHERE age >= 18 ORDER BY full_name');

      res.json({
        summary: ageGroups[0],
        details: {
          under_6: under6,
          age_6_11: age6to11,
          age_12_17: age12to17,
          adults: adults
        }
      });
    } else {
      res.json(ageGroups[0]);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/unsponsored - Report of unsponsored orphans
router.get('/unsponsored', async (req, res, next) => {
  try {
    const unsponsored = await query(`
      SELECT 
        o.*,
        m.full_name as mother_name, m.phone_1 as mother_phone,
        r.province, r.district
      FROM orphans o
      LEFT JOIN sponsorships s ON s.orphan_id = o.id AND s.status = 'active'
      LEFT JOIN mothers m ON m.id = o.mother_id
      LEFT JOIN residence_info r ON r.id = o.residence_id
      WHERE s.id IS NULL
      ORDER BY o.date_of_birth
    `);

    res.json(unsponsored);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/unmarked - Report of orphans not marketed
router.get('/unmarked', async (req, res, next) => {
  try {
    const unmarked = await query(`
      SELECT 
        o.*,
        m.full_name as mother_name, m.phone_1 as mother_phone,
        r.province, r.district,
        s.status as sponsorship_status
      FROM orphans o
      LEFT JOIN marketing_records mr ON mr.orphan_id = o.id
      LEFT JOIN mothers m ON m.id = o.mother_id
      LEFT JOIN residence_info r ON r.id = o.residence_id
      LEFT JOIN sponsorships s ON s.orphan_id = o.id AND s.status = 'active'
      WHERE mr.id IS NULL
      ORDER BY o.date_of_birth
    `);

    res.json(unmarked);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/summary - Dashboard summary (keep for backward compatibility)
router.get('/summary', async (req, res, next) => {
  try {
    const [totals] = await query('SELECT COUNT(*) AS total_orphans FROM orphans');
    const [sponsored] = await query(`
      SELECT COUNT(DISTINCT orphan_id) AS sponsored
      FROM sponsorships WHERE status = 'active'
    `);
    const [unsponsored] = await query(`
      SELECT COUNT(*) AS unsponsored
      FROM orphans o
      LEFT JOIN sponsorships s ON s.orphan_id = o.id AND s.status = 'active'
      WHERE s.id IS NULL
    `);
    const [marketed] = await query(`
      SELECT COUNT(DISTINCT orphan_id) AS marketed
      FROM marketing_records
    `);
    const ageGroups = await query(`
      SELECT
        SUM(CASE WHEN age < 6 THEN 1 ELSE 0 END) AS under_6,
        SUM(CASE WHEN age BETWEEN 6 AND 11 THEN 1 ELSE 0 END) AS age_6_11,
        SUM(CASE WHEN age BETWEEN 12 AND 17 THEN 1 ELSE 0 END) AS age_12_17,
        SUM(CASE WHEN age >= 18 THEN 1 ELSE 0 END) AS adults
      FROM orphans
    `);

    res.json({
      total_orphans: totals.total_orphans,
      sponsored: sponsored.sponsored || 0,
      unsponsored: unsponsored.unsponsored || 0,
      marketed: marketed.marketed || 0,
      age_groups: ageGroups[0]
    });
  } catch (err) {
    next(err);
  }
});

export default router;