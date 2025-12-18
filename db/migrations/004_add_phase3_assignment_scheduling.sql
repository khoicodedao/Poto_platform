-- Migration: Phase 3 - Assignment Auto-Release & Scheduling
-- For auto-releasing, auto-closing, and auto-reminding about assignments

-- 1) Add scheduling fields to assignments table
ALTER TABLE assignments
ADD COLUMN IF NOT EXISTS created_by_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS released_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS scheduled_release_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS scheduled_close_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS scheduled_grade_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS auto_release_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_close_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_partial_submission BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT FALSE;

-- 2) Create indexes for scheduled queries
CREATE INDEX IF NOT EXISTS idx_assignments_scheduled_release_at 
  ON assignments(scheduled_release_at) 
  WHERE auto_release_enabled = TRUE AND is_visible = FALSE;

CREATE INDEX IF NOT EXISTS idx_assignments_scheduled_close_at 
  ON assignments(scheduled_close_at) 
  WHERE auto_close_enabled = TRUE AND closed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_due_date 
  ON assignments(due_date) 
  WHERE closed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_assignments_is_visible 
  ON assignments(is_visible);

-- 3) Backfill data: Mark existing assignments as released and visible
UPDATE assignments 
SET is_visible = TRUE, 
    released_at = created_at,
    auto_release_enabled = FALSE,
    auto_close_enabled = FALSE
WHERE is_visible IS NULL;

-- 4) Create trigger to auto-update created_by_id from first teacher reference
-- (This would be better handled in application code)

-- 5) Verify migration
SELECT 
  'assignments' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_visible = TRUE THEN 1 END) as visible_count,
  COUNT(CASE WHEN auto_release_enabled = TRUE THEN 1 END) as auto_release_count,
  COUNT(CASE WHEN released_at IS NOT NULL THEN 1 END) as released_count
FROM assignments
GROUP BY 'assignments';

COMMIT;
