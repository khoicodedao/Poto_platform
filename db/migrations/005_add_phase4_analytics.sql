-- Migration: Phase 4 - Analytics Dashboard
-- Creates database views and indexes to optimize analytics queries

-- ============= PERFORMANCE OPTIMIZATION INDEXES =============

-- Index for efficient assignment performance queries
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_composite
  ON assignment_submissions(assignment_id, student_id, score, submitted_at);

-- Index for attendance queries
CREATE INDEX IF NOT EXISTS idx_attendance_composite
  ON attendance(session_id, student_id, status);

-- Index for class session queries
CREATE INDEX IF NOT EXISTS idx_class_sessions_class_composite
  ON class_sessions(class_id, scheduled_at, status);

-- Index for user class relationship
CREATE INDEX IF NOT EXISTS idx_users_class_id
  ON users(class_id);

-- Index for submissions date range queries
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_submitted_at
  ON assignment_submissions(submitted_at DESC);

-- ============= MATERIALIZED VIEWS FOR FASTER ANALYTICS =============

-- Student Performance View (updated periodically)
CREATE OR REPLACE VIEW student_performance_summary AS
SELECT 
  u.id as student_id,
  u.name as student_name,
  a.class_id,
  COUNT(DISTINCT a.id) as total_assignments,
  COUNT(DISTINCT CASE WHEN asub.status != 'pending' THEN asub.id END) as submitted_count,
  COUNT(DISTINCT CASE WHEN asub.status = 'graded' THEN asub.id END) as graded_count,
  AVG(asub.score) as average_score,
  MAX(asub.score) as highest_score,
  MIN(asub.score) as lowest_score,
  SUM(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) as present_count,
  SUM(CASE WHEN att.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
  SUM(CASE WHEN att.status = 'late' THEN 1 ELSE 0 END) as late_count,
  COUNT(DISTINCT cs.id) as total_sessions
FROM users u
LEFT JOIN assignment_submissions asub ON asub.student_id = u.id
LEFT JOIN assignments a ON a.id = asub.assignment_id
LEFT JOIN attendance att ON att.student_id = u.id
LEFT JOIN class_sessions cs ON cs.id = att.session_id AND cs.class_id = a.class_id
GROUP BY u.id, u.name, a.class_id;

-- Class Performance Summary
CREATE OR REPLACE VIEW class_performance_summary AS
SELECT
  c.id as class_id,
  c.name as class_name,
  COUNT(DISTINCT u.id) as total_students,
  COUNT(DISTINCT a.id) as total_assignments,
  COUNT(DISTINCT asub.id) as total_submissions,
  AVG(asub.score) as average_score,
  (COUNT(DISTINCT CASE WHEN asub.submitted_at IS NOT NULL THEN asub.id END) * 100.0 
   / NULLIF(COUNT(DISTINCT asub.id), 0)) as submission_rate,
  AVG(CASE WHEN att.status = 'present' THEN 1 ELSE 0 END) * 100 as average_attendance
FROM classes c
LEFT JOIN class_enrollments ce ON ce.class_id = c.id
LEFT JOIN users u ON u.id = ce.student_id
LEFT JOIN assignments a ON a.class_id = c.id
LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id
LEFT JOIN class_sessions cs ON cs.class_id = c.id
LEFT JOIN attendance att ON att.session_id = cs.id
GROUP BY c.id, c.name;

-- Assignment Performance View
CREATE OR REPLACE VIEW assignment_performance_summary AS
SELECT
  a.id as assignment_id,
  a.title,
  a.class_id,
  a.due_date,
  a.max_score,
  COUNT(DISTINCT asub.student_id) as total_students,
  COUNT(DISTINCT CASE WHEN asub.submitted_at IS NOT NULL THEN asub.id END) as submitted_count,
  COUNT(DISTINCT CASE WHEN asub.status = 'graded' THEN asub.id END) as graded_count,
  AVG(asub.score) as average_score,
  MAX(asub.score) as highest_score,
  MIN(asub.score) as lowest_score,
  (COUNT(DISTINCT CASE WHEN asub.submitted_at IS NOT NULL THEN asub.id END) * 100.0
   / NULLIF(COUNT(DISTINCT asub.student_id), 0)) as submission_rate
FROM assignments a
LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id
GROUP BY a.id, a.title, a.class_id, a.due_date, a.max_score;

-- Attendance Summary View
CREATE OR REPLACE VIEW attendance_summary AS
SELECT
  cs.class_id,
  cs.id as session_id,
  cs.title as session_title,
  cs.scheduled_at,
  COUNT(*) as total_expected,
  COUNT(CASE WHEN att.status = 'present' THEN 1 END) as present_count,
  COUNT(CASE WHEN att.status = 'late' THEN 1 END) as late_count,
  COUNT(CASE WHEN att.status = 'absent' THEN 1 END) as absent_count,
  (COUNT(CASE WHEN att.status = 'present' THEN 1 END) * 100.0 
   / NULLIF(COUNT(*), 0)) as attendance_rate
FROM class_sessions cs
LEFT JOIN attendance att ON att.session_id = cs.id
GROUP BY cs.class_id, cs.id, cs.title, cs.scheduled_at;

-- ============= GRANT PERMISSIONS =============

-- If using role-based access, uncomment:
-- GRANT SELECT ON student_performance_summary TO student_role;
-- GRANT SELECT ON class_performance_summary TO teacher_role;
-- GRANT SELECT ON assignment_performance_summary TO teacher_role;
-- GRANT SELECT ON attendance_summary TO teacher_role;

-- ============= VERIFY VIEWS CREATED =============

SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'VIEW'
AND table_name LIKE '%summary%'
ORDER BY table_name;

COMMIT;
