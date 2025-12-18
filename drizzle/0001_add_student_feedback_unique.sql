-- Add unique index to support ON CONFLICT upserts on student_feedbacks
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_feedback_session_student
ON student_feedbacks (session_id, student_id);
