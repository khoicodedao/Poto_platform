-- Add unique index to support ON CONFLICT upserts on attendance
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_session_student
ON attendance (session_id, student_id);
