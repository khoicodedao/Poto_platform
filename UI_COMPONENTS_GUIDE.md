# 📱 EduPlatform UI/Components Guide

## Tổng Quan Giao Diện

Dự án EduPlatform đã được cung cấp đầy đủ UI components và pages cho tất cả 4 phases của hệ thống.

---

## Phase 1: Quản Lý Buổi Học & Điểm Danh

### Components

#### 1. **ClassSessionForm** (`components/class-sessions-form.tsx`)

- **Mục đích:** Form tạo buổi học mới
- **Props:**
  - `classId: number` - ID lớp học
  - `onSuccess?: () => void` - Callback sau khi tạo thành công
- **Fields:**
  - Tiêu đề buổi học
  - Mô tả
  - Thời gian (datetime-local)
  - Thời lượng (phút)
  - Phòng học
  - Link Platform (LiveKit)

#### 2. **SessionsList** (`components/sessions-list.tsx`)

- **Mục đích:** Hiển thị danh sách buổi học
- **Props:** `classId: number`
- **Hiển thị:**
  - Danh sách buổi học với trạng thái (Scheduled, In Progress, Completed, Cancelled)
  - Thông tin thời gian, phòng học, thời lượng
  - Button "Chi Tiết" cho mỗi buổi

#### 3. **AttendanceChecklist** (`components/attendance-checklist.tsx`)

- **Mục đích:** Điểm danh học sinh
- **Props:** `sessionId: number`
- **Chức năng:**
  - Hiển thị danh sách học sinh
  - Chọn trạng thái: Có Mặt, Vắng Mặt, Muộn, Về Sớm
  - Cập nhật trực tiếp qua dropdown

#### 4. **StudentFeedbackForm** (`components/student-feedback-form.tsx`)

- **Mục đích:** Nhận xét từng học sinh trong buổi học
- **Props:**
  - `sessionId: number`
  - `studentId: number`
  - `studentName: string`
  - `onSuccess?: () => void`
- **Fields:**
  - Nhận xét (Textarea)
  - Điểm Thái Độ (1-10 slider)
  - Mức Độ Tham Gia (High/Medium/Low)

#### 5. **ClassReportForm** (`components/class-report-form.tsx`)

- **Mục đích:** Tạo báo cáo buổi học
- **Props:**
  - `sessionId: number`
  - `totalStudents: number`
  - `attendanceCount: number`
  - `onSuccess?: () => void`
- **Hiển thị:** KPI cards (tổng HS, HS có mặt, tỷ lệ điểm danh)
- **Fields:**
  - Tóm tắt buổi học
  - Điểm chính
  - Nội dung buổi tiếp theo

### Pages

- **`app/classes/[id]/sessions/page.tsx`** - Quản lý buổi học (create & list)
  - Route: `/classes/:id/sessions`
  - Tabs: "Danh Sách Buổi Học" | "Tạo Buổi Học Mới"

---

## Phase 2: Thông Báo & Zalo Integration

### Components

#### **NotificationCenter** (`components/notification-center.tsx`)

- **Mục đích:** Trung tâm quản lý thông báo
- **Hiển thị:**
  - Bell icon với badge số thông báo chưa đọc
  - Sheet popup với danh sách thông báo
  - Timestamp, loại, kênh gửi
  - Options: Đánh dấu đã đọc, Xóa
- **Tính năng:**
  - Auto-refresh mỗi 30 giây
  - Poll notifications từ API

### Pages

- **`app/classes/[id]/notifications/page.tsx`** - Gửi thông báo
  - Route: `/classes/:id/notifications`
  - Form gửi thông báo đến lớp
  - Types: Reminder, Assignment, Report, Attendance, General
  - Channels: App, Zalo, Email
  - Option: Gửi qua nhóm Zalo

---

## Phase 3: Bài Tập & Scheduling

### Components

#### 1. **AssignmentScheduleForm** (`components/assignment-schedule-form.tsx`)

- **Mục đích:** Tạo bài tập với lên lịch tự động
- **Props:**
  - `classId: number`
  - `onSuccess?: () => void`
- **Fields:**
  - Tiêu đề, mô tả
  - Điểm tối đa
  - Hạn nộp
  - Auto-release: checkbox + datetime
  - Auto-close: checkbox + datetime
  - Cho phép nộp từng phần (checkbox)

#### 2. **AssignmentList** (`components/assignment-list.tsx`)

- **Mục đích:** Danh sách bài tập
- **Props:**
  - `classId: number`
  - `isTeacher?: boolean` - Hiển thị scheduling info nếu là teacher
- **Hiển thị:**
  - Status badge (Chưa Phát Hành, Đang Thực Hiện, Sắp Hết Hạn, Quá Hạn)
  - Hạn nộp, điểm tối đa
  - Auto-release/close schedule (cho teacher)
  - Button "Chi Tiết"

### Pages

- **`app/classes/[id]/assignments/page.tsx`** - Quản lý bài tập
  - Route: `/classes/:id/assignments`
  - Tabs: "Danh Sách Bài Tập" | "Tạo Bài Tập Mới"

---

## Phase 4: Phân Tích & Thống Kê

### Components

#### 1. **ClassAnalyticsDashboard** (`components/class-analytics-dashboard.tsx`)

- **Mục đích:** Dashboard analytics cho cả lớp
- **Props:** `classId: number`
- **KPI Cards:**
  - Điểm Trung Bình
  - Tỷ Lệ Nộp Bài
  - Tỷ Lệ Điểm Danh
  - Tỷ Lệ Nộp Trễ
- **Charts:**
  - Line chart: Xu hướng nộp bài (30 ngày)
  - Bar chart: Trendline điểm danh (Có/Vắng/Muộn)

#### 2. **AtRiskStudentsAlert** (`components/at-risk-students-alert.tsx`)

- **Mục đích:** Cảnh báo học sinh cần chú ý
- **Props:** `classId: number`
- **Hiển thị:**
  - Danh sách học sinh at-risk
  - Điểm TB, tỷ lệ điểm danh, tỷ lệ nộp bài
  - Risk factors: Low Score, Low Attendance, Low Submission

### Pages

- **`app/classes/[id]/analytics/page.tsx`** - Analytics cho teacher

  - Route: `/classes/:id/analytics`
  - Hiển thị: AtRiskStudentsAlert + ClassAnalyticsDashboard

- **`app/classes/[id]/my-performance/page.tsx`** - Performance cho student
  - Route: `/classes/:id/my-performance`
  - KPI cards cá nhân: Điểm TB, Điểm Danh %, Nộp Bài %, Bài Tập Nộp
  - Bar chart: Điểm theo bài tập

---

## ClassDashboard - Trang Chính Lớp Học

### Component (`components/class-dashboard.tsx`)

Hiển thị 6 cards với các tính năng chính:

1. **🗓️ Quản Lý Buổi Học** → `/classes/[id]/sessions`

   - Lên lịch, điểm danh, feedback học sinh

2. **📝 Bài Tập & Bài Kiểm Tra** → `/classes/[id]/assignments`

   - Tạo, phân công, chấm bài tập

3. **📊 Phân Tích & Thống Kê** → `/classes/[id]/analytics`

   - Xem hiệu suất lớp và học sinh

4. **👥 Quản Lý Học Sinh** → `/classes/[id]/students`

   - Danh sách, tham gia, rời lớp

5. **🔔 Thông Báo** → `/classes/[id]/notifications`

   - Gửi thông báo qua Zalo & App

6. **📚 Tài Liệu & Tài Nguyên** → `/classes/[id]/files`
   - Chia sẻ, tải lên file học tập

---

## Tích Hợp với TopNav

`NotificationCenter` component đã được thêm vào TopNav header:

```tsx
// components/user-menu.tsx (hoặc app/layout.tsx)
import { NotificationCenter } from "@/components/notification-center";

// Thêm vào header navigation:
<NotificationCenter />;
```

---

## API Endpoints Sử Dụng

### Phase 1

- `POST/GET /api/class-sessions` - Tạo/lấy buổi học
- `GET/PATCH/DELETE /api/class-sessions/[id]` - Chi tiết buổi học
- `POST/GET /api/attendance` - Điểm danh
- `PATCH /api/attendance/[id]` - Cập nhật điểm danh
- `POST/GET /api/student-feedback` - Nhận xét
- `POST/GET /api/class-reports` - Báo cáo

### Phase 2

- `POST/GET /api/notifications` - Tạo/lấy thông báo
- `GET/PATCH /api/notifications/[id]` - Chi tiết/cập nhật
- `POST /api/webhooks/zalo` - Webhook Zalo

### Phase 3

- `POST/GET /api/assignments` - Tạo/lấy bài tập
- `GET/PATCH /api/assignments/[id]` - Chi tiết bài tập

### Phase 4

- `GET /api/analytics` - Lấy dữ liệu phân tích (query param: `type`)

---

## Authentication & Guards

Tất cả components đều kiểm tra session thông qua:

- `getCurrentSession()` - Server action
- `useToast()` - Hiển thị error/success messages
- Protected routes đã có auth guard

---

## Styling

Tất cả components sử dụng:

- **Tailwind CSS** - Utility classes
- **Shadcn UI** - Pre-built components (Button, Card, Input, Select, etc.)
- **Recharts** - Charts & data visualization
- **Lucide Icons** - SVG icons

---

## Các Trang Chủ Yếu

| Route                          | Component                                     | Mô Tả                   |
| ------------------------------ | --------------------------------------------- | ----------------------- |
| `/classes/[id]`                | ClassDashboard                                | Dashboard chính của lớp |
| `/classes/[id]/sessions`       | SessionsList + ClassSessionForm               | Quản lý buổi học        |
| `/classes/[id]/assignments`    | AssignmentList + AssignmentScheduleForm       | Quản lý bài tập         |
| `/classes/[id]/analytics`      | AtRiskStudentsAlert + ClassAnalyticsDashboard | Phân tích lớp           |
| `/classes/[id]/my-performance` | StudentPerformanceView                        | Hiệu suất cá nhân       |
| `/classes/[id]/notifications`  | NotificationForm                              | Gửi thông báo           |

---

## Hướng Dẫn Sử Dụng

### 1. Tạo Buổi Học

1. Truy cập `/classes/[id]/sessions`
2. Tab "Tạo Buổi Học Mới"
3. Điền form → Submit

### 2. Điểm Danh

1. Truy cập chi tiết buổi học
2. Mở tab "Điểm Danh"
3. Chọn trạng thái từng học sinh
4. Thay đổi tự động cập nhật

### 3. Tạo Bài Tập

1. Truy cập `/classes/[id]/assignments`
2. Tab "Tạo Bài Tập Mới"
3. Điền form, chọn scheduling options
4. Submit

### 4. Xem Analytics

1. Teacher: `/classes/[id]/analytics` - Xem stats cả lớp + at-risk students
2. Student: `/classes/[id]/my-performance` - Xem hiệu suất cá nhân

### 5. Gửi Thông Báo

1. Truy cập `/classes/[id]/notifications`
2. Điền tiêu đề, nội dung
3. Chọn loại & kênh gửi
4. Optional: Gửi qua nhóm Zalo
5. Submit

---

## Next Steps

1. **Test tất cả components** với dữ liệu thực
2. **Cấu hình Zalo credentials** trong `.env.local`
3. **Set up cron scheduler** (Vercel/GitHub Actions)
4. **Deploy** đến production

---

## File Summary

**Components Created:**

- ✅ class-sessions-form.tsx
- ✅ sessions-list.tsx
- ✅ student-feedback-form.tsx
- ✅ class-report-form.tsx
- ✅ notification-center.tsx
- ✅ assignment-list.tsx
- ✅ assignment-schedule-form.tsx
- ✅ class-analytics-dashboard.tsx
- ✅ at-risk-students-alert.tsx
- ✅ class-dashboard.tsx

**Pages Created/Updated:**

- ✅ app/classes/[id]/assignments/page.tsx
- ✅ app/classes/[id]/notifications/page.tsx

**All 4 Phases Now Have Complete UI Implementation!** 🎉
