# 📡 DANH SÁCH API ENDPOINTS - POTO PLATFORM

## 🔐 AUTHENTICATION

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/signin` | Đăng nhập |
| POST | `/api/auth/signup` | Đăng ký tài khoản |
| POST | `/api/auth/signout` | Đăng xuất |
| GET | `/api/auth/me` | Lấy thông tin người dùng hiện tại |

---

## 👥 QUẢN LÝ NGƯỜI DÙNG

### Admin - Users
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | Danh sách tất cả users |
| POST | `/api/admin/users` | Tạo user mới |
| GET | `/api/admin/users/[id]` | Chi tiết user |
| PUT | `/api/admin/users/[id]` | Cập nhật user |
| DELETE | `/api/admin/users/[id]` | Xóa user |

### Admin - Teachers
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/teachers` | Danh sách giảng viên |

### Admin - Teaching Assistants
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/teaching-assistants` | Danh sách TA |
| POST | `/api/admin/ta-assignments` | Gán TA cho lớp |
| DELETE | `/api/admin/ta-assignments` | Hủy gán TA |

### Students
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/students` | Danh sách học sinh |

---

## 📚 QUẢN LÝ LỚP HỌC

### Classes
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/classes` | Danh sách lớp học |
| POST | `/api/classes` | Tạo lớp mới |
| GET | `/api/classes/[id]` | Chi tiết lớp |
| PUT | `/api/classes/[id]` | Cập nhật lớp |
| DELETE | `/api/classes/[id]` | Xóa lớp |
| GET | `/api/classes/[id]/students` | Danh sách học sinh trong lớp |
| GET | `/api/classes/[id]/units` | Danh sách Learning Units |

### Admin - Classes
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/classes` | Danh sách lớp (Admin) |
| GET | `/api/admin/classes/[id]` | Chi tiết lớp (Admin) |
| GET | `/api/admin/classes/[id]/students` | Học sinh trong lớp |
| GET | `/api/admin/classes/[id]/available-students` | Học sinh có thể đăng ký |
| POST | `/api/admin/classes/[id]/enroll` | Đăng ký học sinh vào lớp |

### Class Sessions
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/class-sessions` | Danh sách buổi học |
| POST | `/api/class-sessions` | Tạo buổi học mới |
| GET | `/api/class-sessions/[id]` | Chi tiết buổi học |
| PUT | `/api/class-sessions/[id]` | Cập nhật buổi học |
| DELETE | `/api/class-sessions/[id]` | Xóa buổi học |
| POST | `/api/class-sessions/[id]/send-reminder` | Gửi reminder qua Zalo |

---

## ✅ ĐIỂM DANH

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/attendance` | Danh sách điểm danh |
| POST | `/api/attendance` | Tạo/Cập nhật điểm danh |
| GET | `/api/attendance/[id]` | Chi tiết điểm danh |
| PUT | `/api/attendance/[id]` | Cập nhật điểm danh |
| DELETE | `/api/attendance/[id]` | Xóa điểm danh |
| POST | `/api/classroom/[id]/auto-attendance` | Tự động điểm danh |

---

## 📝 QUẢN LÝ BÀI TẬP

### Assignments
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/assignments` | Danh sách bài tập |
| POST | `/api/assignments` | Tạo bài tập mới |
| GET | `/api/assignments/[id]` | Chi tiết bài tập |
| PUT | `/api/assignments/[id]` | Cập nhật bài tập |
| DELETE | `/api/assignments/[id]` | Xóa bài tập |
| POST | `/api/assignments/[id]/submit` | Nộp bài |
| POST | `/api/assignments/grade` | Chấm điểm bài tập |

### Cron Jobs (Auto-scheduling)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/cron/auto-release-assignments` | Tự động phát hành bài tập |
| POST | `/api/cron/auto-close-assignments` | Tự động đóng nhận bài |
| POST | `/api/cron/assignment-reminders` | Gửi reminder bài tập |
| POST | `/api/cron/create-reminders` | Tạo reminders |
| POST | `/api/cron/send-reminders` | Gửi reminders |

---

## 📖 QUẢN LÝ TÀI LIỆU

### Files
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/files` | Danh sách file |
| POST | `/api/files` | Upload file |
| GET | `/api/files/[id]` | Chi tiết file |
| DELETE | `/api/files/[id]` | Xóa file |
| GET | `/api/files/[id]/download` | Download file |
| GET | `/api/classes/[id]/files` | File của lớp |
| POST | `/api/classes/[id]/files` | Upload file vào lớp |
| DELETE | `/api/classes/[id]/files/[fileId]` | Xóa file của lớp |

### Learning Units & Materials
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/units/[id]` | Chi tiết unit |
| PUT | `/api/units/[id]` | Cập nhật unit |
| DELETE | `/api/units/[id]` | Xóa unit |
| GET | `/api/materials/[id]` | Chi tiết material |
| DELETE | `/api/materials/[id]` | Xóa material |

### Upload
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/upload` | Upload file chung |
| POST | `/api/upload/video` | Upload video |
| POST | `/api/upload/document` | Upload document |

---

## 🎥 VIDEO TRỰC TIẾP

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/livekit-token` | Tạo LiveKit token |

---

## 🔔 THÔNG BÁO

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notifications` | Danh sách thông báo |
| POST | `/api/notifications` | Tạo thông báo mới |
| GET | `/api/notifications/[id]` | Chi tiết thông báo |
| PUT | `/api/notifications/[id]` | Cập nhật thông báo |
| DELETE | `/api/notifications/[id]` | Xóa thông báo |

---

## 💬 ZALO INTEGRATION ⭐

### Zalo - Smart Messaging
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/zalo/smart-send` | **Smart send** (auto-fallback) |
| POST | `/api/zalo/send-message` | Gửi tin nhắn Zalo |
| POST | `/api/zalo/send-image` | Gửi hình ảnh qua Zalo |

### Zalo - Followers
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/zalo/followers` | Danh sách follower (phân trang) |
| GET | `/api/zalo/all-followers` | Tất cả follower |
| GET | `/api/zalo/follower-detail` | Chi tiết follower |

### Zalo - Token & Webhooks
| Method | Endpoint | Mô tá |
|--------|----------|-------|
| POST | `/api/zalo/refresh-token` | Refresh Zalo access token |
| POST | `/api/webhooks/zalo` | Webhook từ Zalo OA |

---

## 🤖 AI CHATBOT

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/ai-chat/topics` | Danh sách AI topics |
| POST | `/api/ai-chat/topics` | Tạo AI topic mới |
| GET | `/api/ai-chat/messages` | Lịch sử chat |
| POST | `/api/ai-chat/messages` | Gửi tin nhắn AI |
| POST | `/api/ai-chat/tts` | Text-to-speech |
| GET | `/api/ai-chat/debug` | Debug AI chat |

---

## 📊 BÁO CÁO & PHẢN HỒI

### Class Reports
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/class-reports` | Danh sách báo cáo |
| POST | `/api/class-reports` | Tạo báo cáo buổi học |

### Student Feedback
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/student-feedback` | Danh sách feedback |
| POST | `/api/student-feedback` | Tạo feedback mới |

### Analytics
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/analytics` | Dữ liệu phân tích |
| GET | `/api/admin/stats` | Thống kê tổng quan (Admin) |

---

## 👨‍🏫 TEACHING ASSISTANT (TA)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/ta/classes` | Lớp được gán cho TA |
| GET | `/api/ta/sessions` | Buổi học của TA |
| GET | `/api/ta/permissions` | Quyền của TA trong lớp |

---

## 💬 CHAT

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/chat/[classId]` | Tin nhắn trong lớp |
| POST | `/api/chat/[classId]` | Gửi tin nhắn trong lớp |

---

## 🔧 KHÁC

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/session` | Kiểm tra session |
| POST | `/api/token` | Token operations |

---

## 📊 TỔNG KẾT

- **Tổng số API endpoints**: **60+**
- **Phương thức HTTP**: GET, POST, PUT, DELETE
- **Format**: RESTful API
- **Authentication**: Session-based
- **Response format**: JSON

### Phân loại theo module:
- Authentication: 4 endpoints
- Users & Admin: 15+ endpoints
- Classes: 15+ endpoints
- Assignments: 10+ endpoints
- Files & Materials: 10+ endpoints
- Zalo Integration: 8 endpoints
- AI Chatbot: 5 endpoints
- Attendance: 6 endpoints
- Notifications: 5 endpoints
- Analytics: 3 endpoints
- TA System: 3 endpoints
- Others: 5+ endpoints

---

## 🔒 BẢO MẬT

Tất cả các endpoints đều có:
- ✅ **Authentication check**: Yêu cầu đăng nhập
- ✅ **Role-based access**: Kiểm tra quyền theo vai trò
- ✅ **Input validation**: Validate dữ liệu đầu vào
- ✅ **Error handling**: Xử lý lỗi chuẩn

---

## 📝 LƯU Ý

1. **Rate Limiting**: Nên thêm rate limiting cho production
2. **API Documentation**: Có thể tích hợp Swagger/OpenAPI
3. **Versioning**: Cân nhắc versioning (`/api/v1/...`) cho tương lai
4. **Logging**: Tất cả API calls nên được log
5. **Monitoring**: Thiết lập monitoring cho performance

---

📅 **Ngày:** 2026-01-09  
📌 **Version:** 1.0
