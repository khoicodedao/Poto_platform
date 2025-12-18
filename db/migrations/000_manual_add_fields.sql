-- Manual migration: add fields and enums from db/schema.ts
-- Run this with psql: psql "<DATABASE_URL>" -f db/migrations/000_manual_add_fields.sql

-- 1) Create enums if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_status') THEN
    CREATE TYPE assignment_status AS ENUM ('pending', 'submitted', 'graded');
  END IF;
END$$;

-- 2) users table columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email varchar(255),
  ADD COLUMN IF NOT EXISTS password varchar(255),
  ADD COLUMN IF NOT EXISTS name varchar(255),
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS avatar text,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- ensure email uniqueness
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    BEGIN
      ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
    EXCEPTION WHEN duplicate_object THEN
      -- ignore
    END;
  END IF;
END$$;

-- 3) classes table columns (including new max_students)
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS name varchar(255),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS teacher_id integer,
  ADD COLUMN IF NOT EXISTS schedule varchar(255),
  ADD COLUMN IF NOT EXISTS room_id varchar(255),
  ADD COLUMN IF NOT EXISTS max_students integer DEFAULT 20,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- add foreign key for teacher_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'classes_teacher_id_fkey'
  ) THEN
    ALTER TABLE classes
      ADD CONSTRAINT classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- table missing; ignore
END$$;

-- 4) class_enrollments
ALTER TABLE class_enrollments
  ADD COLUMN IF NOT EXISTS class_id integer,
  ADD COLUMN IF NOT EXISTS student_id integer,
  ADD COLUMN IF NOT EXISTS enrolled_at timestamp DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'class_enrollments_class_id_fkey'
  ) THEN
    ALTER TABLE class_enrollments ADD CONSTRAINT class_enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'class_enrollments_student_id_fkey'
  ) THEN
    ALTER TABLE class_enrollments ADD CONSTRAINT class_enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN
  -- ignore
END$$;

-- 5) assignments
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS title varchar(255),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS class_id integer,
  ADD COLUMN IF NOT EXISTS due_date timestamp,
  ADD COLUMN IF NOT EXISTS max_score integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assignments_class_id_fkey'
  ) THEN
    ALTER TABLE assignments ADD CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN
END$$;

-- 6) assignment_submissions
ALTER TABLE assignment_submissions
  ADD COLUMN IF NOT EXISTS assignment_id integer,
  ADD COLUMN IF NOT EXISTS student_id integer,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS status assignment_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS score integer,
  ADD COLUMN IF NOT EXISTS feedback text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamp,
  ADD COLUMN IF NOT EXISTS graded_at timestamp,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assignment_submissions_assignment_id_fkey'
  ) THEN
    ALTER TABLE assignment_submissions ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assignment_submissions_student_id_fkey'
  ) THEN
    ALTER TABLE assignment_submissions ADD CONSTRAINT assignment_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN
END$$;

-- 7) files
ALTER TABLE files
  ADD COLUMN IF NOT EXISTS name varchar(255),
  ADD COLUMN IF NOT EXISTS url text,
  ADD COLUMN IF NOT EXISTS type varchar(100),
  ADD COLUMN IF NOT EXISTS size integer,
  ADD COLUMN IF NOT EXISTS download_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS class_id integer,
  ADD COLUMN IF NOT EXISTS uploaded_by_id integer,
  ADD COLUMN IF NOT EXISTS uploaded_at timestamp DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'files_class_id_fkey'
  ) THEN
    ALTER TABLE files ADD CONSTRAINT files_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'files_uploaded_by_id_fkey'
  ) THEN
    ALTER TABLE files ADD CONSTRAINT files_uploaded_by_id_fkey FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN
END$$;

-- 8) messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS class_id integer,
  ADD COLUMN IF NOT EXISTS sender_id integer,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_class_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey'
  ) THEN
    ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN
END$$;

-- 9) sessions
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS id varchar(255),
  ADD COLUMN IF NOT EXISTS user_id integer,
  ADD COLUMN IF NOT EXISTS expires_at timestamp,
  ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

-- Make id primary key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'sessions'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
  END IF;
EXCEPTION WHEN undefined_table THEN
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sessions_user_id_fkey'
  ) THEN
    ALTER TABLE sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
EXCEPTION WHEN undefined_table THEN
END$$;

-- End of migration
