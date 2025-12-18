-- Migration: Add Phase 1 - ClassSession, Attendance, Feedback, Report
-- Created for Phase 1 implementation

-- 1) Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
    CREATE TYPE session_status AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'early-leave');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participation_level') THEN
    CREATE TYPE participation_level AS ENUM ('high', 'medium', 'low');
  END IF;
END$$;

-- 2) Create class_sessions table
CREATE TABLE IF NOT EXISTS class_sessions (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_number INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  room_id VARCHAR(255),
  platform_url TEXT,
  status session_status NOT NULL DEFAULT 'scheduled',
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_class_sessions_class_id ON class_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_scheduled_at ON class_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_class_sessions_status ON class_sessions(status);

-- 3) Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status attendance_status NOT NULL DEFAULT 'absent',
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  notes TEXT,
  marked_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_session_id ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- 4) Create student_feedbacks table
CREATE TABLE IF NOT EXISTS student_feedbacks (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  feedback_text TEXT NOT NULL,
  attitude_score INTEGER,
  participation_level participation_level DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_feedbacks_session_id ON student_feedbacks(session_id);
CREATE INDEX IF NOT EXISTS idx_student_feedbacks_student_id ON student_feedbacks(student_id);

-- 5) Create class_reports table
CREATE TABLE IF NOT EXISTS class_reports (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  summary TEXT NOT NULL,
  total_students INTEGER,
  attendance_count INTEGER,
  key_points TEXT,
  next_session_preview TEXT,
  zalo_message_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_class_reports_session_id ON class_reports(session_id);
CREATE INDEX IF NOT EXISTS idx_class_reports_created_by ON class_reports(created_by);

-- Add constraints for attitude_score validation if not exists
DO $$
BEGIN
  -- Note: Check constraints must be added with ALTER TABLE if they don't exist
  -- PostgreSQL doesn't have "IF NOT EXISTS" for check constraints in standard syntax
  -- This is a manual step - you may need to add it separately if needed
END$$;

-- Verify all tables created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('class_sessions', 'attendance', 'student_feedbacks', 'class_reports')
ORDER BY table_name, ordinal_position;
