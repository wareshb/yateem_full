-- Schema for Orphan Care Management System
CREATE DATABASE IF NOT EXISTS yateem_pha CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yateem_pha;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','social_worker','data_entry','accountant','auditor') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orphans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid CHAR(36) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  gender ENUM('male','female','unknown') DEFAULT 'unknown',
  date_of_birth DATE,
  orphan_file_number VARCHAR(64),
  registration_date DATE,
  orphan_status ENUM('lost_mother','lost_father','lost_parents','missing_guardian','abandoned') DEFAULT 'lost_father',
  marital_status VARCHAR(50),
  country VARCHAR(100),
  province VARCHAR(100),
  district VARCHAR(100),
  city VARCHAR(100),
  address_details VARCHAR(255),
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  health_status TEXT,
  disabilities TEXT,
  chronic_diseases TEXT,
  education_level VARCHAR(120),
  school_name VARCHAR(255),
  student_grade VARCHAR(100),
  special_education_needs TEXT,
  living_status VARCHAR(120),
  siblings_count INT DEFAULT 0,
  social_worker_assessment TEXT,
  intervention_recommendations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guardians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE,
  national_id VARCHAR(100),
  relationship_to_child VARCHAR(120),
  contact_phone VARCHAR(50),
  address VARCHAR(255),
  occupation VARCHAR(120),
  monthly_income DECIMAL(12,2),
  health_status TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sponsor_type ENUM('individual','ngo','foundation','international_org') DEFAULT 'individual',
  name VARCHAR(200) NOT NULL,
  address VARCHAR(255),
  phone VARCHAR(80),
  email VARCHAR(120),
  sponsorship_terms TEXT,
  sponsorship_type ENUM('financial','education','food','health','other') DEFAULT 'financial',
  payment_method ENUM('transfer','cash','voucher','other') DEFAULT 'transfer',
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orphans_guardians (
  orphan_id INT NOT NULL,
  guardian_id INT NOT NULL,
  relationship VARCHAR(120),
  is_primary TINYINT(1) DEFAULT 0,
  PRIMARY KEY (orphan_id, guardian_id),
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orphans_sponsors (
  orphan_id INT NOT NULL,
  sponsor_id INT NOT NULL,
  is_primary TINYINT(1) DEFAULT 0,
  PRIMARY KEY (orphan_id, sponsor_id),
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sponsorships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orphan_id INT NOT NULL,
  sponsor_id INT NOT NULL,
  guardian_id INT,
  sponsorship_type ENUM('financial','education','food','health','other') DEFAULT 'financial',
  amount DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'USD',
  frequency ENUM('monthly','quarterly','yearly','one_time') DEFAULT 'monthly',
  payment_method ENUM('transfer','cash','voucher','other') DEFAULT 'transfer',
  start_date DATE,
  end_date DATE,
  status ENUM('active','paused','ended','pending') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orphan_id) REFERENCES orphans(id) ON DELETE CASCADE,
  FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE,
  FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sponsorship_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sponsorship_id INT NOT NULL,
  due_date DATE,
  paid_date DATE,
  amount DECIMAL(12,2),
  status ENUM('scheduled','paid','late','cancelled') DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sponsorship_id) REFERENCES sponsorships(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_type ENUM('orphan','guardian','sponsor','sponsorship','social_visit','other') NOT NULL,
  owner_id INT NOT NULL,
  category VARCHAR(120),
  label VARCHAR(255),
  file_path VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Basic seed: admin user with password 'admin123' (change in production)
INSERT INTO users (full_name, email, password_hash, role)
VALUES ('Admin', 'admin@example.com', '$2a$10$QjOPxrrQcJ8WDy2eT9erMe0CQE9QczlrgXgpREgxU5TCQZdgtfIS6', 'admin')
ON DUPLICATE KEY UPDATE email = email;
