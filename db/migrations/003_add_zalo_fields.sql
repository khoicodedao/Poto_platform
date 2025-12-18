-- Migration: Add Zalo integration fields
-- For sending notifications and class group messaging

-- 1) Add zalo_user_id to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS zalo_user_id VARCHAR(255);

-- 2) Add class_id to users table (for quick reference)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL;

-- 3) Add is_active flag to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 4) Add zalo_group_id to classes table
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS zalo_group_id VARCHAR(255);

-- 5) Add is_active flag to classes
ALTER TABLE classes
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 6) Create index for quick user lookup by Zalo ID
CREATE INDEX IF NOT EXISTS idx_users_zalo_user_id ON users(zalo_user_id);

-- 7) Create index for quick class lookup by Zalo group
CREATE INDEX IF NOT EXISTS idx_classes_zalo_group_id ON classes(zalo_group_id);

-- 8) Create index for active users and classes
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_classes_is_active ON classes(is_active);

COMMIT;
