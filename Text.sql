--ScorePoint

CREATE TABLE score_points (
  id SERIAL PRIMARY KEY,
  score_name VARCHAR(255) NOT NULL,
  score_point INTEGER DEFAULT 0,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);



--User 

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  role TEXT,
  profile TEXT
);


--Residents

CREATE TABLE residents (
  id SERIAL PRIMARY KEY,
  fullname_en TEXT,
  fullname_kh TEXT,
  dob DATE,
  type_of_disability TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  profile TEXT,
  gender TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- Assessment

CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  google_form_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- Resident Medical

CREATE TABLE resident_medicals (
  id SERIAL PRIMARY KEY,
  medical_treatment TEXT NOT NULL,
  doctor TEXT NOT NULL,
  treatment_date DATE NOT NULL,
  specialist_doctor_comment TEXT,
  next_appointment TIMESTAMPTZ,
  next_appointment_remark TEXT,
  require_to_use BOOLEAN DEFAULT FALSE,
  resident_id INTEGER NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- Create table: medical_comments
CREATE TABLE medical_comments (
  id SERIAL PRIMARY KEY,
  resident_medical_id INTEGER NOT NULL REFERENCES resident_medicals(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table: medical_url_drive
CREATE TABLE medical_url_drives (
  id SERIAL PRIMARY KEY,
  resident_medical_id INTEGER NOT NULL REFERENCES resident_medicals(id) ON DELETE CASCADE,
  drive_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Program Level 

CREATE TABLE program_levels (
  id SERIAL PRIMARY KEY,
  program_level_name VARCHAR(100) NOT NULL,
  program_level_order INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Program Activity

CREATE TABLE program_activities (
  id SERIAL PRIMARY KEY,
  program_activity_name TEXT NOT NULL,
  gender TEXT DEFAULT 'All',
  img_url TEXT,
  description TEXT,
  program_type INTEGER REFERENCES program_types(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- Program Type 
CREATE TABLE program_types (
  id SERIAL PRIMARY KEY,
  program_type_name TEXT NOT NULL,
  description TEXT,
  img_url TEXT,  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


-- Resident Checklist

CREATE TABLE resident_checklists (
  id SERIAL PRIMARY KEY,
  resident INTEGER REFERENCES residents(id),
  program_activity INTEGER REFERENCES program_activities(id),
  score_point INTEGER REFERENCES score_points(id),
  checklist_date DATE NOT NULL,
  checklist_time TIME,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
