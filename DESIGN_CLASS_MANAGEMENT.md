# EduPlatform - Tính năng hỗ trợ Quy trình Quản lý Lớp Học

## 1. Phân tích Yêu cầu

### Giai đoạn 1: Nhận lớp & Thiết lập

- ✅ Tạo lớp học (đã có)
- ✅ Cấp tài khoản cho học sinh (đã có)
- 📌 **CẦN THÊM**: Tạo "Class Group" (nhóm lớp) để quản lý Zalo integration
- 📌 **CẦN THÊM**: Tạo "Study Group" (nhóm luyện tập bổ trợ)

### Giai đoạn 2-3: Trước & Trong Buổi Học

- 📌 **CẦN THÊM**: `ClassSession` (buổi học cụ thể với lịch & địa chỉ/link)
- 📌 **CẦN THÊM**: `Attendance` (điểm danh: có/vắng/muộn/sớm)
- 📌 **CẦN THÊM**: Reminder system (nhắc 4h, 10p trước)
- 📌 **CẦN THÊM**: `Notification` table (lưu lịch sử gửi thông báo & Zalo)

### Giai đoạn 4: Sau Buổi Học

- 📌 **CẦN THÊM**: `ClassReport` (báo cáo buổi học)
- 📌 **CẦN THÊM**: Teacher feedback cho từng học sinh

### Giai đoạn 5-6: Quy trình Bài Tập

- ✅ Assignments (đã có)
- 📌 **CẦN THÊM**: Auto-reminder cho bài tập (Thứ 2 giao, Thứ 6-7 nhắc)
- 📌 **CẦN THÊM**: Assignment deadline tracking & late submission handling

## 2. Schema Database Mở Rộng

### 2.1 ClassGroup (Nhóm lớp)

```sql
CREATE TABLE class_groups (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  group_name VARCHAR(255) NOT NULL,
  group_type ENUM('main', 'study') DEFAULT 'main', -- lớp chính / luyện tập
  zalo_group_url TEXT, -- link nhóm Zalo
  zalo_webhook_url TEXT, -- để gửi thông báo tự động
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membership
CREATE TABLE class_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES class_groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
  zalo_id VARCHAR(255), -- Zalo ID của user (nếu có)
  joined_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 ClassSession (Buổi học cụ thể)

```sql
CREATE TABLE class_sessions (
  id SERIAL PRIMARY KEY,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  session_number INTEGER, -- buổi thứ mấy
  title VARCHAR(255) NOT NULL, -- "Buổi 1: Luyện đọc cơ bản"
  description TEXT,
  scheduled_at TIMESTAMP NOT NULL, -- thời gian dự kiến
  duration_minutes INTEGER DEFAULT 60,
  room_id VARCHAR(255), -- LiveKit room ID (nếu dùng video)
  platform_url TEXT, -- URL để vào lớp (nếu cần)
  status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.3 Attendance (Điểm danh)

```sql
CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('present', 'absent', 'late', 'early-leave') DEFAULT 'absent',
  check_in_time TIMESTAMP, -- khi nào vào lớp
  check_out_time TIMESTAMP, -- khi nào rời lớp
  notes TEXT, -- ghi chú (vắng vì bệnh, muộn vì tắc đường, v.v.)
  marked_by INTEGER REFERENCES users(id), -- trợ giảng chấm điểm danh
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, student_id) -- không trùng lặp cho cùng buổi + học sinh
);
```

### 2.4 ClassReport (Báo cáo buổi học)

```sql
CREATE TABLE class_reports (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  created_by INTEGER NOT NULL REFERENCES users(id), -- trợ giảng
  summary TEXT NOT NULL, -- tóm tắt buổi học
  total_students INTEGER, -- tổng học sinh dự kiến
  attendance_count INTEGER, -- số học sinh có mặt
  key_points TEXT, -- những điểm chính đã dạy
  next_session_preview TEXT, -- gợi ý cho buổi tiếp theo
  zalo_message_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.5 StudentFeedback (Nhận xét học sinh)

```sql
CREATE TABLE student_feedbacks (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by INTEGER NOT NULL REFERENCES users(id), -- trợ giảng / giáo viên
  feedback_text TEXT NOT NULL,
  attitude_score INTEGER CHECK (attitude_score >= 1 AND attitude_score <= 5), -- 1-5 sao
  participation_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);
```

### 2.6 Notification (Lịch sử thông báo)

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type ENUM('reminder', 'report', 'assignment', 'general') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
  related_session_id INTEGER REFERENCES class_sessions(id) ON DELETE CASCADE,
  related_assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,

  -- Zalo integration
  zalo_message_id VARCHAR(255), -- Zalo API message ID
  sent_via ENUM('app', 'zalo', 'email') DEFAULT 'app',
  sent_at TIMESTAMP,

  -- Auto-send scheduling
  scheduled_send_at TIMESTAMP, -- thời gian sẽ gửi (nếu chưa gửi)
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  error_message TEXT, -- nếu failed

  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.7 AssignmentSchedule (Lịch giao bài tự động)

```sql
CREATE TABLE assignment_schedules (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  day_of_week SMALLINT CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=CN, 1=T2, ...6=T7
  action ENUM('release', 'remind', 'close', 'grade') NOT NULL,
  action_time TIME NOT NULL, -- giờ thực hiện (VD: 08:00 = 8 sáng)
  reminder_message TEXT, -- nội dung nhắc nhở tùy chỉnh
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ví dụ:
-- assignment_id=1, day_of_week=1, action='release', action_time='08:00'
--   => Thứ 2 lúc 8 sáng, giao bài
-- assignment_id=1, day_of_week=5, action='remind', action_time='17:00'
--   => Thứ 6 lúc 5 chiều, nhắc nộp
```

## 3. Các Chức năng Cần Thêm

### 3.1 Classroom Management

- [ ] CRUD ClassSession
- [ ] Attendance management (check-in/check-out, mark attendance)
- [ ] Generate attendance report (%)

### 3.2 Reporting

- [ ] Generate ClassReport từ attendance & feedback
- [ ] Send report to Zalo group (via webhook)
- [ ] Student progress report (tóm tắt từ attendance, assignments, feedback)

### 3.3 Notification & Reminder

- [ ] Auto-reminder system (scheduled job)
  - 4 giờ trước: nhắc lịch học
  - 10 phút trước: nhắc chuẩn bị vào lớp
  - Sau buổi: gửi báo cáo
- [ ] Zalo integration (webhook để gửi tin nhắn)
- [ ] Email fallback (nếu Zalo không khả dụng)

### 3.4 Assignment Workflow

- [ ] Auto-release assignment (Thứ 2)
- [ ] Auto-remind submission (Thứ 6, 7)
- [ ] Assignment deadline enforcement
- [ ] Late submission tracking

### 3.5 Dashboard & Reports

- [ ] Teacher: Class attendance dashboard
- [ ] Teacher: Student performance overview
- [ ] TA: Attendance checklist per session
- [ ] Parent: Student progress report (if enabled)

## 4. Luồng Công Việc Chi Tiết

### Buổi học (Class Session)

```
Tạo ClassSession (admin/teacher)
  ↓
T-4h: Auto-send reminder "Chuẩn bị buổi học"
  ↓
T-10m: Auto-send "Vào lớp ngay"
  ↓
Buổi bắt đầu: TA chấm điểm danh (check-in)
  ↓
Trong buổi: Ghi nhận feedback, ghi chú
  ↓
Buổi kết thúc: TA check-out học sinh
  ↓
Auto-generate ClassReport từ attendance
  ↓
Send report to Zalo group
```

### Bài tập (Assignment)

```
Thứ 2 - 08:00: Release assignment
  ↓
Thứ 6 - 17:00: Remind "Nộp bài trước T7"
  ↓
Thứ 7 - 09:00: Final reminder "Nộp bài ngay"
  ↓
Thứ 7 - 23:59: Close submission
  ↓
Chủ nhật: TA grade & send feedback
  ↓
Send graded notification to Zalo
```

## 5. API Endpoints Cần Thêm

```
POST   /api/class-sessions              - Tạo buổi học
GET    /api/class-sessions?classId=X    - Danh sách buổi học
PATCH  /api/class-sessions/[id]         - Cập nhật buổi học
DELETE /api/class-sessions/[id]         - Hủy buổi học

POST   /api/attendance                   - Mark attendance
PATCH  /api/attendance/[id]              - Update attendance
GET    /api/attendance?sessionId=X       - Danh sách điểm danh

POST   /api/class-reports                - Tạo báo cáo
GET    /api/class-reports?classId=X      - Danh sách báo cáo
POST   /api/class-reports/[id]/send-zalo - Gửi báo cáo qua Zalo

POST   /api/student-feedback             - Thêm nhận xét
GET    /api/student-feedback?sessionId=X - Nhận xét buổi học

POST   /api/notifications                - Tạo thông báo
GET    /api/notifications                - Danh sách thông báo
POST   /api/notifications/[id]/resend    - Gửi lại thông báo

POST   /api/assignment-schedules         - Tạo lịch giao bài
GET    /api/assignment-schedules         - Danh sách lịch giao bài
PATCH  /api/assignment-schedules/[id]    - Cập nhật lịch giao bài

// Cron jobs / Background tasks
POST   /api/cron/send-reminders          - Gửi nhắc nhở tự động
POST   /api/cron/process-assignments     - Xử lý lịch giao bài
```

## 6. Zalo Integration

### 6.1 Webhook Zalo (để gửi tin nhắn)

```typescript
// POST /api/integrations/zalo
// Gửi tin nhắn đến nhóm Zalo

interface ZaloMessage {
  groupId: string; // Zalo group ID
  message: string;
  messageType: "text" | "image" | "file"; // loại tin nhắn
  recipientIds?: string[]; // Zalo user IDs (nếu tin nhắn cá nhân)
}
```

### 6.2 Notification Templates

```
4h trước:
  "🎓 Nhắc lịch: Buổi học '[Session Title]' sẽ bắt đầu lúc [TIME] hôm nay.
   Các em hãy chuẩn bị kỹ và kiểm tra kết nối internet nhé! 📱"

10p trước:
  "⏰ Chuẩn bị vào lớp ngay! Buổi học sắp bắt đầu (10 phút nữa).
   Các em hãy vào link/app EduPlatform để tham gia."

Báo cáo buổi học:
  "📊 Báo cáo buổi học ngày [DATE]:
   - Học sinh có mặt: [COUNT]/[TOTAL]
   - Nội dung: [SUMMARY]
   - Lưu ý: [NOTES]

   Chi tiết xem tại: [LINK]"

Giao bài Thứ 2:
  "📝 Bài tập tuần này:
   [Assignment Title]

   Hạn nộp: Thứ 7 lúc 23:59.
   Chi tiết: [LINK]"

Nhắc nộp Thứ 6:
  "⏰ Nhắc nhở: Còn 1 ngày để nộp bài.
   Bài '[Assignment Title]' hạn nộp T7 23:59.
   Nộp ngay: [LINK]"
```

## 7. UI Components Cần Thêm

### ClassSession Management

- [ ] `ClassSessionForm` - tạo/sửa buổi học
- [ ] `ClassSessionList` - danh sách buổi học
- [ ] `ClassSessionDetail` - chi tiết buổi học + attendance checklist

### Attendance

- [ ] `AttendanceChecklist` - check-in/check-out học sinh
- [ ] `AttendanceReport` - báo cáo điểm danh (%)

### Reporting

- [ ] `ClassReportForm` - tạo báo cáo buổi học
- [ ] `StudentProgressCard` - thẻ tiến độ học sinh
- [ ] `StudentFeedbackForm` - ghi nhận nhận xét

### Notifications

- [ ] `NotificationCenter` - trung tâm thông báo
- [ ] `ReminderScheduler` - quản lý lịch nhắc nhở

## 8. Priority & Implementation Order

### Phase 1 (CORE - 2-3 tuần)

- [ ] ClassSession CRUD
- [ ] Attendance tracking
- [ ] ClassReport generation

### Phase 2 (NOTIFICATIONS - 1-2 tuần)

- [ ] Notification system
- [ ] Basic reminder scheduling
- [ ] Zalo webhook integration (gửi tin)

### Phase 3 (AUTO - 1 tuần)

- [ ] Assignment auto-release
- [ ] Cron jobs setup
- [ ] Template system cho messages

### Phase 4 (ANALYTICS - 1 tuần)

- [ ] Dashboard & reports
- [ ] Student progress tracking
- [ ] Parent portal (nếu cần)

---

**Tiếp theo:** Bạn muốn mình bắt đầu implement từ Phase 1 (ClassSession + Attendance) không?
