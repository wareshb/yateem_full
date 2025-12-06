-- Enhanced Schema for Comprehensive Orphan Care Management System
-- يريم للحماية والرعاية الاجتماعية

CREATE DATABASE IF NOT EXISTS yateem_pha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yateem_pha;

-- ========================================
-- 1. جدول المستخدمين (Users)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','social_worker','data_entry','accountant','auditor') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 2. جدول الآباء المتوفين (Fathers)
-- ========================================
CREATE TABLE IF NOT EXISTS fathers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  date_of_death DATE,
  cause_of_death VARCHAR(255),
  death_certificate_type ENUM('مدنية','عسكرية','بلاغ وفاة') DEFAULT 'مدنية',
  death_certificate_number VARCHAR(100),
  occupation_before_death VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_uid (uid)
);

-- ========================================
-- 3. جدول الأمهات (Mothers)
-- ========================================
CREATE TABLE IF NOT EXISTS mothers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  id_type VARCHAR(100),
  id_number VARCHAR(100),
  marital_status VARCHAR(100),
  occupation VARCHAR(200),
  can_read_write BOOLEAN DEFAULT FALSE,
  phone_1 VARCHAR(50),
  phone_2 VARCHAR(50),
  is_custodian BOOLEAN DEFAULT TRUE COMMENT 'هل تحتضن الأيتام',
  number_of_orphans_in_custody INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_uid (uid),
  INDEX idx_phone (phone_1)
);

-- ========================================
-- 4. جدول المعيلين (Guardians)
-- ========================================
CREATE TABLE IF NOT EXISTS guardians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  relationship_to_orphan VARCHAR(120) COMMENT 'صلة القرابة باليتيم',
  id_type VARCHAR(100),
  id_number VARCHAR(100),
  phone VARCHAR(50),
  current_occupation VARCHAR(200),
  number_of_orphans_in_custody INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_uid (uid),
  INDEX idx_phone (phone)
);

-- ========================================
-- 5. جدول معلومات السكن (Residence Info)
-- ========================================
CREATE TABLE IF NOT EXISTS residence_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  country VARCHAR(100) DEFAULT 'اليمن',
  province VARCHAR(100),
  district VARCHAR(100) COMMENT 'المديرية',
  neighborhood_or_street VARCHAR(255) COMMENT 'الحي أو الشارع',
  residence_condition ENUM('جيدة','متوسطة','ضعيفة') DEFAULT 'متوسطة',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================================
-- 6. جدول الأيتام (Orphans) - محدث وموسع
-- ========================================
CREATE TABLE IF NOT EXISTS orphans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  orphan_id VARCHAR(50) COMMENT 'معرف اليتيم المخصص',
  
  -- البيانات الشخصية
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  age INT COMMENT 'العمر - يتم حسابه من تاريخ الميلاد في التطبيق',
  gender ENUM('male','female') DEFAULT 'male',
  nationality VARCHAR(100) DEFAULT 'يمني',
  id_type VARCHAR(100) COMMENT 'نوع الهوية',
  id_number VARCHAR(100) COMMENT 'رقم الهوية',
  
  -- بيانات الميلاد
  birth_country VARCHAR(100) DEFAULT 'اليمن',
  birth_province VARCHAR(100),
  birth_district VARCHAR(100) COMMENT 'عزلة الميلاد',
  birth_neighborhood VARCHAR(100) COMMENT 'حي الميلاد',
  
  -- بيانات الأصل
  origin_country VARCHAR(100) DEFAULT 'اليمن',
  origin_province VARCHAR(100),
  origin_district VARCHAR(100) COMMENT 'العزلة الأصل',
  
  -- بيانات الإخوة
  male_siblings_count INT DEFAULT 0,
  female_siblings_count INT DEFAULT 0,
  lives_with_siblings BOOLEAN DEFAULT TRUE,
  
  -- الحالة الصحية
  health_condition ENUM('سليم','مريض') DEFAULT 'سليم',
  illness_type ENUM('إعاقة','مرض مزمن','أخرى') COMMENT 'نوع المرض',
  illness_notes TEXT COMMENT 'ملاحظة حول نوع المرض',
  
  -- الحالة التعليمية
  is_studying BOOLEAN DEFAULT TRUE,
  grade_level VARCHAR(100) COMMENT 'الصف الدراسي',
  school_name VARCHAR(255),
  school_type ENUM('حكومي','أهلي') DEFAULT 'حكومي',
  academic_rating ENUM('ممتاز','جيد جدا','جيد','مقبول','ضعيف') COMMENT 'التقدير الدراسي',
  not_studying_reason TEXT,
  
  -- بيانات حفظ القرآن
  memorizes_quran BOOLEAN DEFAULT FALSE,
  quran_center_name VARCHAR(255),
  quran_parts_memorized DECIMAL(4,1) DEFAULT 0 COMMENT 'من 0.5 إلى 30 جزء',
  not_memorizing_reason TEXT,
  
  -- العلاقات
  father_id INT,
  mother_id INT,
  guardian_id INT COMMENT 'معيل اليتيم إذا لم تكن الأم',
  mother_is_custodian BOOLEAN DEFAULT TRUE,
  residence_id INT,
  
  -- تواريخ النظام
  data_entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (father_id) REFERENCES fathers(id) ON DELETE SET NULL,
  FOREIGN KEY (mother_id) REFERENCES mothers(id) ON DELETE SET NULL,
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE SET NULL,
  FOREIGN KEY (residence_id) REFERENCES residence_info(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_uid (uid),
  INDEX idx_orphan_id (orphan_id),
  INDEX idx_full_name (full_name),
  INDEX idx_father (father_id),
  INDEX idx_mother (mother_id),
  INDEX idx_guardian (guardian_id),
  INDEX idx_age (age)
);

-- ========================================
-- 7. جدول إخوة اليتيم (Orphan Siblings)
-- ========================================
CREATE TABLE IF NOT EXISTS orphan_siblings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  orphan_id INT NOT NULL COMMENT 'اليتيم الأول/الأساسي',
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  gender ENUM('male','female') DEFAULT 'male',
  
  -- التعليم
  grade_level VARCHAR(100),
  school_name VARCHAR(255),
  academic_rating ENUM('ممتاز','جيد جدا','جيد','مقبول','ضعيف'),
  
  -- حفظ القرآن
  memorizes_quran BOOLEAN DEFAULT FALSE,
  quran_center_name VARCHAR(255),
  quran_parts_memorized DECIMAL(4,1) DEFAULT 0,
  not_memorizing_reason TEXT,
  
  -- العلاقات (مشتركة مع اليتيم الأول)
  father_id INT,
  mother_id INT,
  guardian_id INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  FOREIGN KEY (father_id) REFERENCES fathers(id) ON DELETE SET NULL,
  FOREIGN KEY (mother_id) REFERENCES mothers(id) ON DELETE SET NULL,
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE SET NULL,
  
  INDEX idx_orphan (orphan_id),
  INDEX idx_uid (uid)
);

-- ========================================
-- 8. جدول الجهات الكافلة (Sponsor Organizations)
-- ========================================
CREATE TABLE IF NOT EXISTS sponsor_organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  sponsorship_type SET('نقدية','دراسية','صحية') COMMENT 'يمكن أن تكون أكثر من نوع',
  responsible_person VARCHAR(200) COMMENT 'المسؤول عن قطاع الأيتام',
  start_date DATE COMMENT 'تاريخ بدء الكفالة',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_uid (uid),
  INDEX idx_name (name)
);

-- ========================================
-- 9. جدول الجهات المسوق إليها (Marketing Organizations)
-- ========================================
CREATE TABLE IF NOT EXISTS marketing_organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(50),
  responsible_person VARCHAR(200) COMMENT 'المسؤول عن قطاع الأيتام',
  marketing_date DATE COMMENT 'تاريخ التسويق',
  notes TEXT,
  converted_to_sponsor BOOLEAN DEFAULT FALSE COMMENT 'هل تم تحويلها لجهة كافلة',
  sponsor_organization_id INT COMMENT 'ID الجهة الكافلة بعد التحويل',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sponsor_organization_id) REFERENCES sponsor_organizations(id) ON DELETE SET NULL,
  
  INDEX idx_uid (uid),
  INDEX idx_name (name)
);

-- ========================================
-- 10. جدول الكفالات (Sponsorships)
-- ========================================
CREATE TABLE IF NOT EXISTS sponsorships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sponsor_organization_id INT NOT NULL,
  orphan_id INT NOT NULL,
  start_date DATE DEFAULT (CURRENT_DATE),
  end_date DATE,
  status ENUM('active','paused','ended') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sponsor_organization_id) REFERENCES sponsor_organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_active_sponsorship (orphan_id, sponsor_organization_id, status),
  INDEX idx_sponsor (sponsor_organization_id),
  INDEX idx_orphan (orphan_id),
  INDEX idx_status (status)
);

-- ========================================
-- 11. جدول سجلات التسويق (Marketing Records)
-- ========================================
CREATE TABLE IF NOT EXISTS marketing_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marketing_organization_id INT NOT NULL,
  orphan_id INT NOT NULL,
  marketing_date DATE DEFAULT (CURRENT_DATE),
  status ENUM('pending','approved','rejected','converted_to_sponsorship') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (marketing_organization_id) REFERENCES marketing_organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  
  INDEX idx_marketing_org (marketing_organization_id),
  INDEX idx_orphan (orphan_id),
  INDEX idx_status (status)
);

-- ========================================
-- 12. جدول المرفقات (Attachments)
-- ========================================
CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orphan_id INT NOT NULL,
  attachment_type ENUM(
    'photo_4x6',
    'photo_full',
    'birth_certificate',
    'father_death_certificate',
    'mother_or_guardian_id',
    'latest_academic_certificate',
    'inheritance_restriction',
    'appointment_letter',
    'medical_report'
  ) NOT NULL COMMENT 'نوع المرفق',
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120),
  file_size INT COMMENT 'بالبايت',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  
  INDEX idx_orphan (orphan_id),
  INDEX idx_type (attachment_type)
);

-- ========================================
-- Legacy Tables (للتوافق مع النظام القديم)
-- ========================================

-- يمكن الاحتفاظ بالجداول القديمة للتوافق أو حذفها
-- sponsors, orphans_guardians, orphans_sponsors, social_visits, documents

CREATE TABLE IF NOT EXISTS social_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orphan_id INT NOT NULL,
  visitor_user_id INT,
  visit_date DATE NOT NULL,
  score TINYINT,
  notes TEXT,
  recommendations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ========================================
-- Seed: Admin User
-- ========================================
INSERT INTO users (full_name, email, password_hash, role)
VALUES ('Admin', 'admin@example.com', '$2a$10$QjOPxrrQcJ8WDy2eT9erMe0CQE9QczlrgXgpREgxU5TCQZdgtfIS6', 'admin')
ON DUPLICATE KEY UPDATE email = email;
