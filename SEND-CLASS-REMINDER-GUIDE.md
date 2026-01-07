# 🔔 Hướng dẫn Gửi Nhắc Nhở Zalo cho Buổi Học

## 📋 Tổng quan

Tính năng gửi nhắc nhở tự động qua Zalo cho học viên khi sắp tới giờ học, giúp tăng tỷ lệ tham gia và đảm bảo học viên không bỏ lỡ buổi học.

## 🎯 Tính năng chính

### 1. **Gửi nhắc nhở thủ công**
- Giáo viên/Admin có thể gửi nhắc nhở cho tất cả học viên trong lớp
- Tin nhắn được gửi qua Zalo OA
- Chỉ gửi cho học viên đã kết nối Zalo

### 2. **Thông tin trong tin nhắn**
- 📚 Tên lớp học
- 📝 Tiêu đề buổi học
- ⏰ Thời gian diễn ra
- ⏳ Thời gian còn lại đến giờ học
- 📌 Ghi chú buổi học (nếu có)

### 3. **Điểm danh & Đánh giá**
- ✅ Điểm danh học viên
- 📝 Nhận xét từng học viên
- ⭐ Đánh giá bằng sao (1-5 sao)
- 📊 Báo cáo buổi học

## 🚀 Cách sử dụng

### Bước 1: Truy cập trang chi tiết buổi học

Đường dẫn: `/classes/[id]/sessions/[sessionId]`

Ví dụ: `http://localhost:3000/classes/1/sessions/1`

### Bước 2: Gửi nhắc nhở Zalo

1. **Chỉ giáo viên/admin mới thấy** card "Gửi nhắc nhở qua Zalo"
2. Click button **"Gửi nhắc nhở"**
3. Hệ thống sẽ:
   - Lấy danh sách học viên trong lớp
   - Lọc những học viên đã có Zalo ID
   - Tạo tin nhắn nhắc nhở
   - Gửi đồng thời cho tất cả học viên
   - Hiển thị kết quả gửi

### Mẫu tin nhắn được gửi:

```
🔔 NHẮC NHỞ BUỔI HỌC

📚 Lớp: Lập trình Web cơ bản
📝 Buổi học: Buổi 1 - Giới thiệu HTML/CSS
⏰ Thời gian: Thứ Tư, 8 tháng 1, 2026 20:00

⏳ Còn 2 giờ 15 phút nữa là đến giờ học!

📌 Ghi chú: Chuẩn bị laptop và trình duyệt Chrome
💡 Hãy chuẩn bị sẵn sàng và tham gia đúng giờ nhé!

Chúc bạn học tập hiệu quả! 🎓
```

### Bước 3: Điểm danh học viên

1. Chuyển đến tab **"Điểm Danh"**
2. Đánh dấu trạng thái cho từng học viên:
   - ✅ Có mặt (Present)
   - ❌ Vắng mặt (Absent)
   - ⏰ Đi muộn (Late)
   - 🚪 Về sớm (Early Leave)
3. Click **"Lưu"**

### Bước 4: Nhận xét học viên

1. Chuyển đến tab **"Nhận Xét"**
2. Click **"Nhận Xét"** bên cạnh tên học viên
3. Điền:
   - ⭐ Đánh giá bằng sao (1-5 sao)
   - 📝 Nhận xét chi tiết
4. Click **"Lưu nhận xét"**

### Bước 5: Báo cáo buổi học

1. Chuyển đến tab **"Báo Cáo"**
2. Điền thông tin:
   - 📊 Tổng kết buổi học
   - 📝 Nội dung đã giảng
   - 💡 Ghi chú thêm
3. Click **"Lưu báo cáo"**

## 📡 API Endpoints

### POST `/api/class-sessions/[sessionId]/send-reminder`

Gửi nhắc nhở Zalo cho tất cả học viên trong buổi học.

**Request:**
```bash
POST /api/class-sessions/1/send-reminder
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đã gửi nhắc nhở thành công cho 15/20 học viên",
  "sent": 15,
  "failed": 5,
  "failedStudents": ["Nguyễn Văn A", "Trần Thị B"],
  "totalStudents": 20
}
```

**Response lỗi:**
```json
{
  "success": false,
  "error": "Session not found"
}
```

## ⚙️ Yêu cầu kỹ thuật

### 1. Học viên phải có Zalo ID

Để nhận được nhắc nhở, học viên cần:
- Đã follow Zalo OA của trường
- Đã được link Zalo ID trong hệ thống

Kiểm tra bằng cách vào **Quản lý học viên** → Xem cột "Zalo ID"

### 2. Zalo Token phải hợp lệ

Hệ thống sử dụng **Zalo Token Auto-Refresh** (xem `ZALO-TOKEN-AUTO-REFRESH.md`)

Token sẽ tự động refresh khi còn dưới 5 phút.

### 3. Cấu hình môi trường

File `.env.local` cần có:
```env
ZALO_OA_ID=<your_oa_id>
ZALO_APP_ID=<your_app_id>
ZALO_APP_SECRET=<your_app_secret>
ZALO_ACCESS_TOKEN=<your_access_token>
ZALO_REFRESH_TOKEN=<your_refresh_token>
```

## 🎨 Giao diện

### Card Gửi Nhắc Nhở
- Gradient background: blue-50 → purple-50
- Icon: BellRing (purple-600)
- Button: Gradient blue-600 → purple-600
- Loading state với spinner animation
- Alert hiển thị kết quả (success/error)

### Tabs Quản lý
1. **Điểm Danh** - Checklist interactive
2. **Nhận Xét** - Form với star rating
3. **Báo Cáo** - Form tổng kết

## 🔄 Tự động hóa (Tương lai)

### Lên lịch gửi nhắc nhở tự động

Có thể tạo cron job để gửi tự động:

```typescript
// app/api/cron/send-class-reminders/route.ts
export async function GET(req: NextRequest) {
  // Lấy tất cả buổi học sắp diễn ra trong 2 giờ tới
  const upcomingSessions = await db.query.classSessions.findMany({
    where: (sessions, { and, gte, lte }) => and(
      gte(sessions.scheduledAt, new Date()),
      lte(sessions.scheduledAt, new Date(Date.now() + 2 * 60 * 60 * 1000))
    ),
  });

  // Gửi reminder cho từng session
  for (const session of upcomingSessions) {
    await fetch(`/api/class-sessions/${session.id}/send-reminder`, {
      method: "POST",
    });
  }
}
```

Sau đó config trong Vercel/cron:
```json
{
  "crons": [{
    "path": "/api/cron/send-class-reminders",
    "schedule": "0 */2 * * *"
  }]
}
```

## 📊 Thống kê & Monitoring

### Log format:

```
[Reminder] Sent to Nguyễn Văn A (1234567890)
[Reminder] Failed to send to Trần Thị B: Error: Invalid Zalo ID
[Reminder] Successfully sent 15/20 reminders for session #1
```

### Metrics cần theo dõi:

- ✅ Tỷ lệ gửi thành công
- ❌ Số lượng thất bại
- 👥 Số học viên không có Zalo ID
- ⏱️ Thời gian xử lý

## 🐛 Troubleshooting

### Không gửi được tin nhắn?

1. **Kiểm tra Zalo Token**
   ```bash
   curl http://localhost:3000/api/zalo/token-status
   ```

2. **Kiểm tra học viên có Zalo ID**
   - Vào trang quản lý học viên
   - Xem cột "Zalo ID"
   - Nếu trống → Cần link Zalo ID

3. **Xem logs**
   - Mở Developer Console
   - Tab Network → Xem response
   - Tab Console → Xem error logs

### Một số học viên không nhận được?

Có thể do:
- Học viên chưa follow Zalo OA
- Zalo ID không chính xác
- Học viên đã block OA
- Token không có quyền gửi tin

Kiểm tra:
```bash
# Test gửi tin cho 1 học viên cụ thể
curl -X POST http://localhost:3000/api/zalo/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "zaloUserId": "1234567890",
    "message": "Test message"
  }'
```

## 🔐 Bảo mật

### Chỉ giáo viên/admin được gửi

```typescript
// Trong page.tsx
{userRole && userRole !== "student" && (
  <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
    {/* Send reminder UI */}
  </Card>
)}
```

### API không cần authentication (nếu cần bảo mật hơn)

Thêm middleware check role:

```typescript
// app/api/class-sessions/[sessionId]/send-reminder/route.ts
export async function POST(req: NextRequest, { params }) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session || session.user.role === 'student') {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // ... rest of code
}
```

## 📚 Tài liệu liên quan

- [Zalo Token Auto-Refresh](./ZALO-TOKEN-AUTO-REFRESH.md)
- [Zalo API v3.0 Migration](./ZALO-API-V3-MIGRATION.md)
- [Zalo Integration Guide](./ZALO-INTEGRATION-GUIDE.md)

---

**Tạo bởi:** Antigravity AI Assistant  
**Ngày:** 2026-01-07  
**Version:** 1.0
