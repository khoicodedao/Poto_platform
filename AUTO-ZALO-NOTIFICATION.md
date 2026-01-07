# 📲 Tự động Gửi Thông Báo Zalo cho Học Viên

## 📋 Tổng quan

Hệ thống tự động gửi thông báo qua Zalo OA khi:
1. ✅ **Điểm danh học viên** - Gửi kết quả điểm danh
2. 💬 **Nhận xét học viên** - Gửi nhận xét và đánh giá từ giáo viên

## 🎯 Tính năng

### 1. Thông báo Điểm danh

**Khi nào gửi:**
- Ngay sau khi giáo viên lưu điểm danh cho học viên
- Chỉ gửi cho học viên có Zalo ID

**Nội dung tin nhắn:**
```
📋 THÔNG BÁO ĐIỂM DANH

📚 Lớp: Lập trình Web cơ bản
📝 Buổi học: Buổi 1 - HTML/CSS
📅 Ngày: 07/01/2026

✅ Trạng thái: Có mặt ✅
📌 Ghi chú: Tham gia tích cực

Cảm ơn bạn đã tham gia! 🎓
```

**Các trạng thái:**
- ✅ **Có mặt** (present)
- ❌ **Vắng mặt** (absent) - Kèm lời nhắc liên hệ GV
- ⏰ **Đi muộn** (late) - Kèm lời nhắc đến đúng giờ
- 🚪 **Về sớm** (early-leave)

### 2. Thông báo Nhận xét

**Khi nào gửi:**
- Ngay sau khi giáo viên lưu nhận xét cho học viên
- Chỉ gửi cho học viên có Zalo ID

**Nội dung tin nhắn:**
```
💬 NHẬN XÉT TỪ GIÁO VIÊN

📚 Lớp: Lập trình Web cơ bản
📝 Buổi học: Buổi 1 - HTML/CSS
📅 Ngày: 07/01/2026

⭐ Đánh giá: ⭐⭐⭐⭐⭐ (5/5 sao)

💬 Nhận xét:
Học sinh tham gia tích cực, hoàn thành bài tập tốt. 
Cần cải thiện kỹ năng debug code.

🎉 Xuất sắc! Hãy tiếp tục phát huy nhé!

Cảm ơn bạn đã tham gia buổi học! 🎓
```

**Tin nhắn động theo đánh giá:**
- ⭐⭐⭐⭐⭐ (4-5 sao): "🎉 Xuất sắc! Hãy tiếp tục phát huy nhé!"
- ⭐⭐⭐ (3 sao): "💪 Tốt! Hãy cố gắng hơn nữa!"
- ⭐⭐ (1-2 sao): "📖 Hãy chú ý ôn tập và tham gia tích cực hơn..."

## 🔧 Cách hoạt động

### Flow Điểm danh:

```
1. Giáo viên điểm danh học viên (tab "Điểm Danh")
   ↓
2. POST /api/attendance
   ↓
3. Lưu điểm danh vào database
   ↓
4. Kiểm tra học viên có Zalo ID?
   ├─ Có → Gửi thông báo Zalo
   └─ Không → Bỏ qua
   ↓
5. Trả về kết quả thành công
```

### Flow Nhận xét:

```
1. Giáo viên viết nhận xét (tab "Nhận Xét")
   ↓
2. POST /api/student-feedback
   ↓
3. Lưu nhận xét vào database
   ↓
4. Kiểm tra học viên có Zalo ID?
   ├─ Có → Gửi nhận xét qua Zalo
   └─ Không → Bỏ qua
   ↓
5. Trả về kết quả thành công
```

## 💡 Đặc điểm quan trọng

### 1. **Non-blocking**
- Gửi Zalo **không làm chậm** request chính
- Nếu gửi Zalo thất bại → Log error nhưng vẫn trả về success
- Đảm bảo UX mượt mà

```typescript
try {
  // Gửi Zalo
  await sendZaloMessage(...)
} catch (zaloError) {
  // Log nhưng không throw error
  console.error("[Attendance] Failed to send Zalo:", zaloError);
}
// Vẫn return success
return NextResponse.json(result.data, { status: 201 });
```

### 2. **Chỉ gửi cho học viên có Zalo ID**

```typescript
if (student?.zaloUserId) {
  // Gửi tin nhắn
  await sendZaloMessage(student.zaloUserId, message);
}
```

### 3. **Tự động refresh token**
- Sử dụng `ZaloTokenManager` 
- Token tự động refresh khi còn < 5 phút
- Không lo token hết hạn

## 📊 Logs & Monitoring

### Success logs:

```
[Attendance] Sent Zalo notification to student Nguyễn Văn A
[Feedback] Sent Zalo notification to student Trần Thị B
```

### Error logs:

```
[Attendance] Failed to send Zalo notification: Error: Invalid Zalo ID
[Feedback] Failed to send Zalo notification: Error: Token expired
```

## 🎨 Template Messages

### Template Điểm danh:

```typescript
const statusMap: Record<string, string> = {
  present: "Có mặt ✅",
  absent: "Vắng mặt ❌",
  late: "Đi muộn ⏰",
  "early-leave": "Về sớm 🚪",
};

const message = `📋 THÔNG BÁO ĐIỂM DANH

📚 Lớp: ${className}
📝 Buổi học: ${sessionTitle}
📅 Ngày: ${date}

✅ Trạng thái: ${statusText}
${notes ? `📌 Ghi chú: ${notes}` : ""}

${conditionalMessage}

Cảm ơn bạn đã tham gia! 🎓`;
```

### Template Nhận xét:

```typescript
const stars = "⭐".repeat(rating);

const message = `💬 NHẬN XÉT TỪ GIÁO VIÊN

📚 Lớp: ${className}
📝 Buổi học: ${sessionTitle}
📅 Ngày: ${date}

${rating > 0 ? `⭐ Đánh giá: ${stars} (${rating}/5 sao)\n` : ""}
💬 Nhận xét:
${feedbackText}

${motivationalMessage}

Cảm ơn bạn đã tham gia buổi học! 🎓`;
```

## 🚀 Cách sử dụng (Cho giáo viên)

### Điểm danh học viên:

1. Truy cập trang session: `/classes/[id]/sessions/[sessionId]`
2. Chuyển tab **"Điểm Danh"**
3. Chọn trạng thái cho từng học viên
4. Click **"Lưu"**
5. ✅ Học viên nhận thông báo Zalo ngay lập tức

### Nhận xét học viên:

1. Truy cập trang session: `/classes/[id]/sessions/[sessionId]`
2. Chuyển tab **"Nhận Xét"**
3. Click **"Nhận Xét"** bên cạnh tên học viên
4. Điền:
   - ⭐ Đánh giá (1-5 sao)
   - 💬 Nhận xét chi tiết
5. Click **"Lưu nhận xét"**
6. ✅ Học viên nhận nhận xét qua Zalo ngay lập tức

## 🔐 Yêu cầu

### 1. Học viên phải có Zalo ID

Kiểm tra trong database:
```sql
SELECT id, name, zaloUserId 
FROM users 
WHERE role = 'student' 
AND zaloUserId IS NULL;
```

Nếu thiếu Zalo ID:
- Học viên cần follow Zalo OA
- Admin link Zalo ID trong hệ thống

### 2. Zalo Token hợp lệ

File `.env.local` cần có:
```env
ZALO_OA_ID=<oa_id>
ZALO_APP_ID=<app_id>
ZALO_APP_SECRET=<app_secret>
ZALO_ACCESS_TOKEN=<access_token>
ZALO_REFRESH_TOKEN=<refresh_token>
```

### 3. Database Schema

Bảng `users` cần có:
```sql
users:
  - id (number)
  - name (string)
  - zaloUserId (string, nullable)
  - role (string)
```

Bảng `classSessions` cần có:
```sql
classSessions:
  - id (number)
  - title (string)
  - scheduledAt (datetime)
  - classId (number)
```

## 🐛 Troubleshooting

### Học viên không nhận được thông báo?

**Kiểm tra:**

1. **Zalo ID có chính xác?**
   ```bash
   # Kiểm tra trong database
   SELECT zaloUserId FROM users WHERE id = <student_id>;
   ```

2. **Token có hợp lệ?**
   ```bash
   curl http://localhost:3000/api/zalo/token-status
   ```

3. **Học viên đã follow OA?**
   - Kiểm tra trong Zalo OA dashboard
   - Followers list

4. **Xem logs:**
   ```bash
   # Terminal logs
   [Attendance] Sent Zalo notification to student ...
   [Attendance] Failed to send Zalo notification: ...
   ```

### Gửi nhưng bị lỗi?

**Các lỗi thường gặp:**

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| Invalid Zalo ID | Zalo ID sai format | Kiểm tra lại ID |
| Token expired | Access token hết hạn | Refresh token hoặc đợi auto-refresh |
| User not found | Học viên chưa follow OA | Yêu cầu học viên follow |
| Rate limit | Gửi quá nhiều tin | Đợi vài phút |

### Test gửi tin thủ công:

```bash
curl -X POST http://localhost:3000/api/zalo/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "zaloUserId": "1234567890",
    "message": "Test message từ POTO"
  }'
```

## 📈 Thống kê

### Metrics cần theo dõi:

- **Success rate**: Tỷ lệ gửi thành công
- **Failed count**: Số lượng thất bại
- **No Zalo ID**: Số học viên chưa có Zalo ID
- **Response time**: Thời gian xử lý

### Dashboard monitoring (Tương lai):

```typescript
// Tạo API để theo dõi
GET /api/analytics/zalo-notifications

Response:
{
  "today": {
    "attendance": { "sent": 150, "failed": 5 },
    "feedback": { "sent": 80, "failed": 2 }
  },
  "thisWeek": { ... },
  "thisMonth": { ... }
}
```

## 🎓 Best Practices

### 1. **Viết nhận xét rõ ràng, có ích**
- Cụ thể về điểm mạnh/yếu
- Gợi ý cải thiện
- Khuyến khích học viên

### 2. **Điểm danh đúng giờ**
- Điểm danh ngay sau buổi học
- Học viên nhận thông báo kịp thời

### 3. **Kiểm tra Zalo ID định kỳ**
- Đảm bảo tất cả học viên có Zalo ID
- Yêu cầu học viên mới follow OA

### 4. **Monitor logs**
- Xem logs để phát hiện lỗi sớm
- Fix các Zalo ID không hợp lệ

## 📚 Tài liệu liên quan

- [Zalo Token Auto-Refresh](./ZALO-TOKEN-AUTO-REFRESH.md)
- [Send Class Reminder Guide](./SEND-CLASS-REMINDER-GUIDE.md)
- [Zalo Integration Guide](./ZALO-INTEGRATION-GUIDE.md)

---

**Tạo bởi:** Antigravity AI Assistant  
**Ngày:** 2026-01-07  
**Version:** 1.0
