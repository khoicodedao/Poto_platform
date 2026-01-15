# 📊 BÁO CÁO TỔNG QUAN CÁC CHỨC NĂNG DỰ ÁN
## Nền tảng Quản lý Học tập Trực tuyến (POTO Platform)

---

## 🎯 TỔNG QUAN DỰ ÁN

**Tên dự án:** Online Learning Platform  
**Công nghệ:** Next.js 14 (App Router), TypeScript, PostgreSQL, Drizzle ORM, Tailwind CSS  
**Mục đích:** Nền tảng quản lý học tập tích hợp đầy đủ với video trực tiếp, AI chatbot và tích hợp Zalo OA  

---

## 📋 CÁC MODULE CHÍNH

### 1️⃣ **QUẢN LÝ NGƯỜI DÙNG VÀ PHÂN QUYỀN**

#### 1.1 Hệ thống người dùng
- ✅ **Đăng ký/Đăng nhập**: Xác thực với session-based authentication
- ✅ **Quên mật khẩu**: Khôi phục tài khoản
- ✅ **Quản lý hồ sơ**: Cập nhật thông tin cá nhân, avatar
- ✅ **Tích hợp Zalo**: Liên kết Zalo User ID để nhận thông báo

#### 1.2 Phân quyền (Role-based Access Control)
- **Admin**: Quản lý toàn bộ hệ thống
- **Teacher**: Giảng viên - quản lý lớp học, bài tập, tài liệu
- **Teaching Assistant (TA)**: Trợ giảng - hỗ trợ giảng viên
- **Student**: Học sinh - tham gia lớp, làm bài tập

#### 1.3 Quản lý trợ giảng (TA)
- ✅ **Gán TA cho lớp học**: Phân công trợ giảng hỗ trợ từng lớp
- ✅ **Phân quyền chi tiết**: 
  - Điểm danh sinh viên
  - Quản lý tài liệu học tập
  - Chấm điểm bài tập (tùy chọn)
  - Quản lý buổi học
- ✅ **Lịch TA**: Xem lịch các buổi học được phân công
- ✅ **Dashboard TA**: Theo dõi các lớp được gán

---

### 2️⃣ **QUẢN LÝ LỚP HỌC**

#### 2.1 Tạo và quản lý lớp
- ✅ **CRUD lớp học**: Tạo, sửa, xóa, xem danh sách lớp
- ✅ **Thông tin lớp**: Tên, mô tả, giảng viên, TA, lịch học
- ✅ **Giới hạn học sinh**: Đặt số lượng tối đa học sinh/lớp
- ✅ **Room ID**: ID phòng học cho video trực tiếp
- ✅ **Tích hợp Zalo**: Liên kết Zalo Group ID

#### 2.2 Đăng ký lớp học
- ✅ **Đăng ký học sinh**: Admin/giảng viên ghi danh học sinh vào lớp
- ✅ **Quản lý enrollment**: Theo dõi ngày đăng ký, ngày kết thúc
- ✅ **Danh sách học sinh**: Xem tất cả học sinh trong lớp
- ✅ **Liên kết Zalo**: Kết nối Zalo follower với tài khoản học sinh

#### 2.3 Quản lý buổi học (Class Sessions)
- ✅ **Tạo buổi học**: Lịch buổi học với thời gian, phòng, mô tả
- ✅ **Trạng thái buổi học**: 
  - Scheduled (Đã lên lịch)
  - In-progress (Đang diễn ra)
  - Completed (Hoàn thành)
  - Cancelled (Đã hủy)
- ✅ **Giảng viên thay thế**: Gán "Guest Teacher" cho buổi học cụ thể
- ✅ **Tự động xóa guest teacher**: Sau khi buổi học hoàn thành

---

### 3️⃣ **ĐIỂM DANH VÀ THEO DÕI**

#### 3.1 Hệ thống điểm danh
- ✅ **Điểm danh thủ công**: Giảng viên/TA đánh dấu điểm danh
- ✅ **Tự động điểm danh**: Khi học sinh đăng nhập vào buổi học
- ✅ **Trạng thái điểm danh**:
  - Present (Có mặt)
  - Absent (Vắng mặt)
  - Late (Đến muộn)
  - Early-leave (Về sớm)
- ✅ **Check-in/Check-out time**: Ghi nhận thời gian vào/ra
- ✅ **Ghi chú**: Thêm ghi chú cho từng điểm danh

#### 3.2 Phân tích điểm danh
- ✅ **Thống kê tổng hợp**: Số lượng có mặt/vắng mặt theo buổi
- ✅ **Báo cáo cá nhân**: Lịch sử điểm danh của từng học sinh
- ✅ **Analytics**: Biểu đồ tỷ lệ điểm danh theo lớp

---

### 4️⃣ **QUẢN LÝ BÀI TẬP**

#### 4.1 Tạo và quản lý bài tập
- ✅ **CRUD bài tập**: Tạo, sửa, xóa, xem bài tập
- ✅ **Thông tin bài tập**: Tiêu đề, mô tả, điểm tối đa
- ✅ **Lịch trình tự động**:
  - Tự động phát hành (auto-release)
  - Tự động đóng nhận bài (auto-close)
  - Nhắc nhở chấm điểm (auto-grade reminder)
- ✅ **Hiển thị có điều kiện**: Ẩn/hiện bài tập với học sinh

#### 4.2 Nộp và chấm bài
- ✅ **Nộp bài**: Học sinh nộp văn bản hoặc file đính kèm
- ✅ **Trạng thái bài nộp**:
  - Pending (Chờ chấm)
  - Submitted (Đã nộp)
  - Graded (Đã chấm)
- ✅ **Chấm điểm**: Giảng viên/TA cho điểm và nhận xét
- ✅ **Phản hồi**: Feedback chi tiết cho từng bài nộp
- ✅ **Nộp muộn**: Cho phép nộp sau deadline (tùy chọn)

#### 4.3 Thống kê bài tập
- ✅ **Tỷ lệ nộp bài**: Theo dõi số lượng đã nộp/chưa nộp
- ✅ **Phân tích điểm**: Biểu đồ phân phối điểm số
- ✅ **Hiệu suất cá nhân**: Xem điểm của từng học sinh

---

### 5️⃣ **TÀI LIỆU HỌC TẬP**

#### 5.1 Quản lý tài liệu theo đơn vị học (Learning Units)
- ✅ **Tạo đơn vị học**: Tổ chức tài liệu theo chủ đề/chương
- ✅ **Sắp xếp thứ tự**: Order index để sắp xếp đơn vị
- ✅ **Mô tả đơn vị**: Tiêu đề, mô tả chi tiết

#### 5.2 Upload và quản lý tài liệu
- ✅ **Loại tài liệu**:
  - Video (MP4, WebM, OGG, MOV)
  - Document (PDF, PPT, PPTX, DOC, DOCX)
  - Link (URL bên ngoài)
  - Other (Loại khác)
- ✅ **Upload trực tiếp**: Lưu file lên server
- ✅ **Metadata**: Kích thước file, thời lượng video
- ✅ **Sắp xếp**: Order index trong mỗi đơn vị

#### 5.3 Quản lý file chung
- ✅ **Upload file lớp**: File dùng chung cho lớp học
- ✅ **Theo dõi tải xuống**: Đếm số lần download
- ✅ **Phân loại**: Theo loại file, người upload
- ✅ **Tìm kiếm**: Tìm file theo tên, loại

---

### 6️⃣ **VIDEO TRỰC TIẾP VÀ PHÒNG HỌC**

#### 6.1 Tích hợp LiveKit
- ✅ **Phòng học trực tiếp**: Tạo phòng video cho mỗi lớp
- ✅ **Token generation**: API tạo token LiveKit an toàn
- ✅ **Kết nối video**: WebRTC cho audio/video chất lượng cao

#### 6.2 Tính năng phòng học
- ✅ **Video conferencing**: Giao tiếp video giữa giảng viên - học sinh
- ✅ **Screen sharing**: Chia sẻ màn hình (nếu LiveKit hỗ trợ)
- ✅ **Chat trong phòng**: Chat real-time trong buổi học
- ✅ **Quản lý participant**: Theo dõi người tham gia

#### 6.3 Custom WebRTC Signaling
- ✅ **Signaling server**: Node.js server riêng cho WebRTC
- ✅ **Fallback option**: Nếu không dùng LiveKit

---

### 7️⃣ **HỆ THỐNG THÔNG BÁO**

#### 7.1 Thông báo đa kênh
- ✅ **Kênh thông báo**:
  - App (In-app notification)
  - Zalo (Zalo OA messages)
  - Email (Email notifications)
- ✅ **Loại thông báo**:
  - Reminder (Nhắc nhở buổi học, bài tập)
  - Report (Báo cáo buổi học)
  - Assignment (Thông báo bài tập mới)
  - Attendance (Thông báo điểm danh)
  - General (Thông báo chung)

#### 7.2 Quản lý thông báo
- ✅ **Lịch trình gửi**: Scheduled send cho thông báo
- ✅ **Trạng thái**: Pending, Sent, Failed, Delivered
- ✅ **Gửi kèm hình**: Image attachment trong thông báo
- ✅ **Log lỗi**: Lưu error message khi gửi thất bại

#### 7.3 Template thông báo
- ✅ **Tạo template**: Mẫu thông báo có thể tái sử dụng
- ✅ **Biến động**: Sử dụng placeholders ({{className}}, {{date}}, etc.)
- ✅ **Đa kênh**: Template cho app, Zalo, email riêng biệt
- ✅ **Bật/tắt**: Enable/disable template

---

### 8️⃣ **TÍCH HỢP ZALO OA**

#### 8.1 Kết nối Zalo Official Account
- ✅ **OAuth 2.0**: Xác thực với Zalo OA
- ✅ **Token management**: Tự động refresh access token
- ✅ **Follower sync**: Đồng bộ danh sách follower

#### 8.2 Smart Messaging System (Tối ưu quota)
- ✅ **Quy tắc 48 giờ**: Tự động xử lý quy tắc tương tác 48h
- ✅ **Auto-fallback**:
  - Thử gửi **Consultation message** (MIỄN PHÍ) trước
  - Nếu lỗi -213/-201 → tự động chuyển sang **Promotion message** (TRẢ PHÍ)
- ✅ **Quota tracking**: Theo dõi quota đã sử dụng (Monthly limit: 2000)
- ✅ **Batch sending**: Gửi hàng loạt với quota monitoring

#### 8.3 Các tính năng Zalo
- ✅ **Gửi tin nhắn**: Text message tới follower
- ✅ **Gửi kèm attachment**: Banner/Article ID từ Zalo OA Console
- ✅ **Gửi hình ảnh**: Gửi ảnh trong thông báo
- ✅ **Nhắc nhở buổi học**: Tự động gửi reminder qua Zalo
- ✅ **Báo cáo buổi học**: Gửi summary sau buổi học
- ✅ **Link chat trực tiếp**: Mở Zalo chat từ danh sách học sinh
- ✅ **Error handling**: Xử lý lỗi API Zalo (-124, -213, -201, -216)

#### 8.4 Zalo Widget
- ✅ **Zalo Chat Widget**: Embed chat OA vào trang web
- ✅ **Demo component**: UI test Smart Zalo Send
- ✅ **Follower selection**: Dialog chọn follower để map với học sinh

---

### 9️⃣ **PHẢN HỒI VÀ BÁO CÁO**

#### 9.1 Phản hồi học sinh (Student Feedback)
- ✅ **Feedback cho học sinh**: Giảng viên/TA nhận xét từng học sinh
- ✅ **Đánh giá sao**: Rating 1-5 sao
- ✅ **Theo buổi học**: Feedback gắn với session cụ thể
- ✅ **Lịch sử feedback**: Xem tất cả nhận xét theo thời gian

#### 9.2 Báo cáo buổi học (Class Reports)
- ✅ **Tóm tắt buổi học**: Summary sau mỗi buổi
- ✅ **Thống kê điểm danh**: Tổng số học sinh, số có mặt
- ✅ **Key points**: Điểm chính của buổi học
- ✅ **Preview buổi sau**: Nội dung dự kiến buổi tiếp theo
- ✅ **Gửi qua Zalo**: Tự động gửi báo cáo cho phụ huynh/học sinh

#### 9.3 Analytics và Dashboard
- ✅ **Dashboard Admin**: Tổng quan toàn hệ thống
- ✅ **Dashboard Teacher**: Thống kê lớp của giảng viên
- ✅ **Dashboard TA**: Các lớp được phân công
- ✅ **Dashboard Student**: Hiệu suất cá nhân (My Performance)
- ✅ **Biểu đồ và charts**: Visualization dữ liệu

---

### 🔟 **AI CHATBOT HỌC TẬP**

#### 10.1 Hệ thống AI Topics
- ✅ **Tạo chủ đề chatbot**: Giảng viên tạo topic AI cho lớp
- ✅ **System prompt**: Tùy chỉnh hướng dẫn cho AI
- ✅ **Bật/tắt topic**: Enable/disable topic theo nhu cầu

#### 10.2 Tích hợp Google AI
- ✅ **Google Gemini API**: Sử dụng model `gemini-2.0-flash`
- ✅ **Conversation history**: Lưu lịch sử hội thoại
- ✅ **Voice support**: Hỗ trợ tin nhắn giọng nói (optional)

#### 10.3 Tính năng chatbot
- ✅ **Chat theo topic**: Học sinh chat với AI về chủ đề cụ thể
- ✅ **Lưu lịch sử**: Tất cả message được lưu vào DB
- ✅ **Trợ lý học tập**: AI hỗ trợ giải đáp thắc mắc

---

## 🛠️ TÍNH NĂNG KỸ THUẬT

### Database
- ✅ **PostgreSQL**: RDBMS chính
- ✅ **Drizzle ORM**: Type-safe database queries
- ✅ **Migrations**: Tự động migration với drizzle-kit
- ✅ **Relations**: Foreign keys và relations được định nghĩa rõ ràng
- ✅ **Seeding**: Script seed dữ liệu mẫu

### API và Backend
- ✅ **Next.js API Routes**: RESTful API endpoints
- ✅ **Server Actions**: Server-side actions cho form submission
- ✅ **Authentication**: Session-based auth
- ✅ **Middleware**: Auth middleware cho protected routes
- ✅ **Error Handling**: Xử lý lỗi tập trung

### Frontend
- ✅ **Next.js 14 App Router**: Routing hiện đại
- ✅ **TypeScript**: Type-safe development
- ✅ **Tailwind CSS**: Utility-first CSS framework
- ✅ **Responsive Design**: Hỗ trợ mobile, tablet, desktop
- ✅ **UI Components**: Custom component library (Shadcn-style)
- ✅ **Client State**: React hooks cho state management

### Security
- ✅ **Password Hashing**: Bcrypt cho mật khẩu
- ✅ **Session Management**: Secure session handling
- ✅ **SQL Injection Prevention**: Drizzle ORM parameterized queries
- ✅ **CSRF Protection**: Cross-site request forgery prevention
- ✅ **Role-based Access**: Kiểm tra quyền cho mọi endpoint

### DevOps và Deployment
- ✅ **Environment Variables**: Config qua .env
- ✅ **Docker Support**: LiveKit self-hosted
- ✅ **Git Workflows**: Structured commit workflow
- ✅ **Documentation**: Comprehensive docs và workflows

---

## 📊 THỐNG KÊ DỰ ÁN

### Database Schema
- **20+ bảng chính**:
  - users, classes, classEnrollments
  - assignments, assignmentSubmissions
  - files, messages, sessions
  - classSessions, attendance
  - studentFeedbacks, classReports
  - notifications, notificationTemplates
  - learningUnits, learningMaterials
  - teachingAssistantAssignments
  - aiChatTopics, aiChatMessages

### API Endpoints
- **50+ endpoints** bao gồm:
  - Auth: /api/auth/*
  - Classes: /api/classes/*
  - Assignments: /api/assignments/*
  - Sessions: /api/class-sessions/*
  - Files: /api/files/*
  - Notifications: /api/notifications/*
  - Zalo: /api/zalo/* (send, smart-send, followers, etc.)
  - AI: /api/ai-chat/*
  - LiveKit: /api/livekit-token

### Pages (UI)
- **30+ trang chính**:
  - Authentication (signin, signup, forgot-password)
  - Admin dashboard (users, classes, TAs)
  - Classes (list, detail, edit, create)
  - Sessions (list, detail, new, session detail)
  - Assignments (list, detail, submit, edit)
  - Files management
  - Classroom (live video)
  - Student dashboard
  - TA dashboard và calendar
  - Materials, Analytics, Notifications, AI Topics

### Components
- **100+ components** bao gồm:
  - UI primitives (button, input, dialog, dropdown, etc.)
  - Domain components (assignments, files, students, sessions)
  - Zalo components (chat widget, smart-send demo, follower dialog)
  - Charts và analytics components
  - Navigation (top-nav, user-menu, class-nav)
  - Forms và dialogs

---

## 🚀 CÁC TÍNH NĂNG NỔI BẬT

### 1. **Smart Zalo Messaging**
- Tự động tối ưu chi phí gửi tin nhắn Zalo
- Tuân thủ quy tắc 48 giờ
- Theo dõi quota real-time
- Batch sending với error recovery

### 2. **Auto Attendance**
- Tự động điểm danh khi học sinh login vào buổi học
- Giảm công việc thủ công cho giảng viên
- Ghi nhận thời gian chính xác

### 3. **AI Learning Assistant**
- Chatbot AI tùy chỉnh theo chủ đề
- Hỗ trợ học sinh 24/7
- Lưu lịch sử để giảng viên theo dõi

### 4. **Teaching Assistant System**
- Phân quyền linh hoạt cho TA
- Lịch riêng cho TA
- Giúp giảng viên quản lý lớp lớn

### 5. **Guest Teacher Support**
- Gán giảng viên thay thế cho buổi học cụ thể
- Tự động xóa sau khi buổi học kết thúc
- Linh hoạt trong quản lý lịch

### 6. **Learning Materials Organization**
- Tổ chức tài liệu theo đơn vị học
- Upload trực tiếp lên server
- Hỗ trợ nhiều loại file

### 7. **Comprehensive Reporting**
- Báo cáo buổi học tự động
- Gửi qua Zalo cho phụ huynh
- Analytics chi tiết

---

## 📝 TÀI LIỆU THAM KHẢO

### Workflows
- `.agent/workflows/zalo-oa-integration.md` - Tích hợp Zalo OA

### Documentation
- `docs/ZALO_SMART_SEND.md` - Hướng dẫn Smart Zalo
- `docs/SUMMARY_SMART_ZALO.md` - Tóm tắt Smart Zalo
- `docs/FIX_SUMMARY.md` - Tóm tắt các fix
- `QUICK_REFERENCE_ZALO.md` - Quick reference Zalo
- `DEBUG_ATTENDANCE.md` - Debug điểm danh
- `Readme.md` - Main README

### Scripts
- `scripts/test-livekit.sh` - Test LiveKit
- `scripts/test-smart-zalo.ts` - Test Smart Zalo
- `db/seed.ts` - Seed database

---

## ✅ TÌNH TRẠNG TRIỂN KHAI

| Module | Trạng thái | Ghi chú |
|--------|-----------|---------|
| Quản lý người dùng | ✅ Hoàn thành | Full CRUD + roles |
| Quản lý lớp học | ✅ Hoàn thành | Bao gồm sessions, enrollments |
| Điểm danh | ✅ Hoàn thành | Auto + manual |
| Bài tập | ✅ Hoàn thành | CRUD + auto-scheduling |
| Tài liệu học tập | ✅ Hoàn thành | Units + materials |
| Video trực tiếp | ✅ Hoàn thành | LiveKit integration |
| Thông báo | ✅ Hoàn thành | Multi-channel |
| Tích hợp Zalo | ✅ Hoàn thành | Smart messaging + follower sync |
| AI Chatbot | ✅ Hoàn thành | Google Gemini |
| TA System | ✅ Hoàn thành | Assignment + calendar |
| Analytics | ✅ Hoàn thành | Dashboards + charts |
| Guest Teacher | ✅ Hoàn thành | Session-specific |

---

## 🎓 KẾT LUẬN

Dự án **POTO Online Learning Platform** là một hệ thống quản lý học tập trực tuyến toàn diện với đầy đủ các tính năng:
- Quản lý người dùng đa vai trò (Admin, Teacher, TA, Student)
- Quản lý lớp học, buổi học, điểm danh tự động
- Bài tập với lịch trình tự động
- Tài liệu học tập được tổ chức khoa học
- Video trực tiếp với LiveKit
- Thông báo đa kênh (App, Zalo, Email)
- Tích hợp Zalo OA với Smart Messaging tối ưu chi phí
- AI Chatbot hỗ trợ học tập
- Hệ thống trợ giảng linh hoạt
- Analytics và báo cáo chi tiết

**Công nghệ hiện đại**: Next.js 14, TypeScript, PostgreSQL, Drizzle ORM  
**Bảo mật**: Session-based auth, role-based access control  
**Khả năng mở rộng**: Kiến trúc module, API RESTful  
**Sẵn sàng production**: ✅

---

**Ngày báo cáo:** 2026-01-09  
**Phiên bản:** 1.0  
**Người tổng hợp:** AI Assistant (Antigravity)
