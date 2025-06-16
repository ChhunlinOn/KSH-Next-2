//Resident 

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


//User

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  role TEXT,
  profile TEXT
);


//Assessment

CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  google_form_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
