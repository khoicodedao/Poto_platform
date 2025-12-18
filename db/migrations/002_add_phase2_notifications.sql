-- Migration: Phase 2 - Notifications & Zalo Integration
-- For reminders, reports, and automated messaging

-- 1) Create enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM (
      'reminder', 'report', 'assignment', 'attendance', 'general'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM (
      'pending', 'sent', 'failed', 'delivered'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE notification_channel AS ENUM (
      'app', 'zalo', 'email'
    );
  END IF;
END$$;

-- 2) Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  related_session_id INTEGER REFERENCES class_sessions(id) ON DELETE SET NULL,
  related_assignment_id INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
  
  -- Zalo integration
  zalo_message_id VARCHAR(255),
  sent_via notification_channel DEFAULT 'app',
  sent_at TIMESTAMP,
  
  -- Auto-send scheduling
  scheduled_send_at TIMESTAMP,
  status notification_status DEFAULT 'pending',
  error_message TEXT,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_class_id ON notifications(class_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_send_at ON notifications(scheduled_send_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 3) Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id SERIAL PRIMARY KEY,
  type notification_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  title_template VARCHAR(255) NOT NULL,
  message_template TEXT NOT NULL,
  channel notification_channel NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(type, channel)
);

-- 4) Insert default notification templates
INSERT INTO notification_templates (type, name, title_template, message_template, channel, is_active)
VALUES
  -- Reminder templates
  (
    'reminder',
    '4 hours before class',
    '🎓 Nhắc lịch học',
    'Buổi học "{sessionTitle}" sẽ bắt đầu lúc {scheduledTime}. Các em hãy chuẩn bị kỹ!',
    'zalo',
    TRUE
  ),
  (
    'reminder',
    '10 minutes before class',
    '⏰ Chuẩn bị vào lớp',
    'Buổi học sắp bắt đầu (10 phút nữa). Vào app EduPlatform ngay!',
    'zalo',
    TRUE
  ),
  
  -- Report templates
  (
    'report',
    'Class session report',
    '📊 Báo cáo buổi học',
    'Báo cáo buổi học {sessionTitle}:\n- Học sinh có mặt: {attendanceCount}/{totalStudents}\n- Nội dung: {summary}\n\nChi tiết: {reportLink}',
    'zalo',
    TRUE
  ),
  
  -- Assignment templates
  (
    'assignment',
    'Assignment released',
    '📝 Bài tập tuần này',
    'Bài tập "{assignmentTitle}" đã được giao.\nHạn nộp: {dueDate}\nChi tiết: {assignmentLink}',
    'zalo',
    TRUE
  ),
  (
    'assignment',
    'Assignment reminder 1 day',
    '⏰ Nhắc nộp bài tập',
    'Nhắc nhở: Còn 1 ngày để nộp bài "{assignmentTitle}".\nHạn nộp: {dueDate}\nNộp ngay: {assignmentLink}',
    'zalo',
    TRUE
  ),
  (
    'assignment',
    'Assignment final reminder',
    '⏰ Cuối cùng - nộp bài ngay',
    'Cuối cùng: Bài tập "{assignmentTitle}" hạn nộp TODAY!\nNộp ngay: {assignmentLink}',
    'zalo',
    TRUE
  ),
  
  -- Attendance templates
  (
    'attendance',
    'Attendance reminder',
    '📋 Nhắc điểm danh',
    'Học sinh chưa vào lớp. Liên hệ ngay với phụ huynh để hỗ trợ.',
    'app',
    TRUE
  );

-- Verify all tables created
SELECT 
  table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'notification_templates')
GROUP BY table_name;
