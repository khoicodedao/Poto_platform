# 🔧 FIX: Cấu hình Attachment ID cho Smart Zalo Messaging

## ⚠️ Bạn cần thêm vào file `.env.local`:

```env
# Zalo OA Attachment IDs (Bắt buộc cho Smart Messaging)
# Đây là ID của article/banner bạn tạo trên Zalo OA Console

# Default attachment (dùng chung)
ZALO_DEFAULT_ATTACHMENT_ID=your_attachment_id_here

# Attachment riêng cho reminder (optional)
ZALO_REMINDER_ATTACHMENT_ID=your_reminder_attachment_id_here

# Attachment riêng cho assignment (optional)
ZALO_ASSIGNMENT_ATTACHMENT_ID=your_assignment_attachment_id_here
```

---

## 📝 Cách lấy Attachment ID

### Bước 1: Đăng nhập Zalo OA Console
1. Truy cập: https://oa.zalo.me/
2. Đăng nhập với tài khoản OA của bạn

### Bước 2: Tạo Article/Banner
1. Vào **Quản lý nội dung** → **Bài viết**
2. Click **Tạo bài viết mới**
3. Điền thông tin:
   - **Tiêu đề**: "Nhắc nhở buổi học" (hoặc bất kỳ)
   - **Mô tả**: Nội dung mô tả
   - **Hình ảnh**: Upload ảnh đại diện (bắt buộc)
4. Click **Lưu**

### Bước 3: Lấy Attachment ID

#### Cách 1: Từ URL
- Sau khi tạo, URL sẽ có dạng: `https://oa.zalo.me/article/detail?id=ABC123XYZ456`
- Copy phần `ABC123XYZ456` → Đây chính là **Attachment ID**

#### Cách 2: Qua API
```bash
curl -X GET "https://openapi.zalo.me/v2.0/oa/article/getslice?offset=0&limit=10" \
  -H "access_token: YOUR_ACCESS_TOKEN"
```

Response sẽ chứa:
```json
{
  "data": {
    "articles": [
      {
        "id": "ABC123XYZ456",  ← Đây là Attachment ID
        "title": "Nhắc nhở buổi học",
        "cover": "https://..."
      }
    ]
  }
}
```

---

## ✅ Sau khi có Attachment ID

### Cập nhật `.env.local`:

```env
ZALO_DEFAULT_ATTACHMENT_ID=ABC123XYZ456
ZALO_REMINDER_ATTACHMENT_ID=ABC123XYZ456
```

### Restart dev server:

```bash
# Dừng server hiện tại (Ctrl+C)
# Chạy lại
npm run dev
```

---

## 🧪 Test ngay

Sau khi cập nhật `.env.local` và restart server, thử gửi reminder lại:

1. Vào trang class session
2. Click **Send Reminder**
3. Check console logs, bạn sẽ thấy:

```
[Zalo Smart] Step 1: Attempting Consultation message to 123...
✅ Consultation message sent successfully!
[Reminder] ✅ Sent to Nguyễn Văn A via CONSULTATION (Quota: NO ✅)
```

Hoặc nếu user không tương tác 48h:

```
[Zalo Smart] Step 1: Attempting Consultation message to 123...
⚠️ Consultation failed: Error -213
[Zalo Smart] Step 2: Falling back to Promotion message...
✅ Promotion message sent successfully!
[Reminder] ✅ Sent to Nguyễn Văn A via PROMOTION (Quota: YES ❌)
```

---

## 📊 Response sẽ bao gồm Statistics

```json
{
  "success": true,
  "sent": 3,
  "failed": 0,
  "totalStudents": 3,
  "statistics": {
    "consultationCount": 2,
    "promotionCount": 1,
    "quotaUsed": 1,
    "savedQuota": 2
  }
}
```

Trong đó:
- **consultationCount**: Số tin gửi FREE (không trừ quota)
- **promotionCount**: Số tin gửi PAID (trừ quota)
- **quotaUsed**: Tổng quota đã dùng
- **savedQuota**: Số quota đã tiết kiệm được! 🎉

---

## 🎯 Tóm tắt

✅ **Đã update**: `/api/class-sessions/[id]/send-reminder` dùng Smart Messaging  
⚠️ **Cần làm**: Thêm `ZALO_DEFAULT_ATTACHMENT_ID` vào `.env.local`  
🚀 **Kết quả**: Tự động fallback, tiết kiệm quota, không còn lỗi 48h!

---

**Nếu gặp vấn đề, check:**
1. ✅ Đã tạo article/banner trên OA Console?
2. ✅ Đã copy đúng Attachment ID?
3. ✅ Đã thêm vào `.env.local`?
4. ✅ Đã restart dev server?
