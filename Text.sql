CREATE TABLE score_points (
  id SERIAL PRIMARY KEY,
  score_name VARCHAR(255) NOT NULL,
  score_point INTEGER DEFAULT 0,
  description TEXT,
  image TEXT, 
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
