---
description: Hướng dẫn tích hợp Zalo OA
---

# Hướng dẫn Tích hợp Zalo OA vào Online Learning Platform

## Phần 1: Chuẩn bị từ Zalo Developer

### Bước 1.1: Tạo App trên Zalo Developer Console

1. Truy cập https://developers.zalo.me/
2. Đăng nhập bằng tài khoản Zalo của bạn
3. Click **"Tạo ứng dụng"** hoặc **"Create App"**
4. Chọn loại ứng dụng: **"OA - Official Account"**
5. Điền thông tin:
   - **Tên ứng dụng**: Online Learning Platform
   - **Mô tả**: Hệ thống quản lý lớp học trực tuyến
   - **Website**: (URL hệ thống của bạn nếu có)
6. Sau khi tạo, bạn sẽ nhận được:
   - **App ID**: Ví dụ `1234567890123456789`
   - **App Secret**: Ví dụ `abcdefghijklmnopqrstuvwxyz`

### Bước 1.2: Liên kết OA với App

1. Trong Dashboard của App vừa tạo
2. Vào tab **"Official Account"** hoặc **"Tài khoản OA"**
3. Click **"Liên kết OA"**
4. Chọn OA của công ty bạn
5. Cấp quyền cho App

### Bước 1.3: Lấy Access Token

**Cách 1: Sử dụng OAuth (Khuyến nghị cho Production)**
- Implement OAuth flow để lấy access token tự động
- Token có thời hạn, cần refresh định kỳ

**Cách 2: Lấy Access Token thủ công (Dùng cho testing FREE OA)**
1. Trong Dashboard App, vào **"Tools & Resources"**
2. Chọn **"Get Token"** hoặc **"Lấy Access Token"**
3. Copy **Access Token** (có dạng: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
4. **Lưu ý**: Token này có hạn (thường 90 ngày cho Free OA)

### Bước 1.4: Lấy OA ID

1. Truy cập https://oa.zalo.me/
2. Chọn Official Account của bạn
3. Vào **"Cài đặt"** → **"Thông tin OA"**
4. Copy **OA ID** (dạng số, ví dụ: `1234567890123456789`)

## Phần 2: Thông tin cần cung cấp

Sau khi hoàn thành Phần 1, hãy cung cấp các thông tin sau:

```
ZALO_OA_ID=<OA_ID của bạn>
ZALO_APP_ID=<App_ID từ developer console>
ZALO_APP_SECRET=<App_Secret từ developer console>
ZALO_ACCESS_TOKEN=<Access_Token vừa lấy>
```

**Ghi chú quan trọng:**
- **FREE OA** chỉ gửi được tin nhắn đến user đã follow OA trong 7 ngày gần nhất
- **FREE OA** có giới hạn số lượng tin nhắn/ngày (thường 1000 tin/ngày)
- Để gửi tin nhắn không giới hạn, cần nâng cấp lên Premium OA

## Phần 3: Luồng hoạt động

### Để gửi tin nhắn từ hệ thống:

1. **Học viên follow OA trước**
   - Teacher/Admin gửi link OA cho học viên
   - Học viên click follow OA

2. **Lưu Zalo User ID**
   - Khi học viên follow OA, Zalo gửi webhook về hệ thống
   - Hệ thống lưu `zaloUserId` vào database (bảng `users`)

3. **Gửi thông báo**
   - Teacher/Admin tạo thông báo từ UI
   - Hệ thống gọi Zalo API để gửi tin nhắn
   - Lưu log vào bảng `notifications`

### Các loại tin nhắn có thể gửi:

1. **Thông báo buổi học sắp diễn ra**
   - Trước buổi học 1-2 giờ
   - Kèm link tham gia

2. **Thông báo bài tập mới**
   - Khi teacher tạo assignment mới
   - Nhắc deadline

3. **Thông báo kết quả**
   - Điểm danh
   - Điểm bài tập
   - Feedback

4. **Thông báo tài liệu mới**
   - Khi upload learning materials
   - Link download/xem

5. **Thông báo nhóm (broadcast)**
   - Gửi đến tất cả học viên trong lớp
   - Thông báo chung

---

## Phần 4: Smart Messaging - Tối ưu Quota 🚀

### 📋 Tổng quan

Hệ thống gửi tin nhắn Zalo thông minh với luồng xử lý tự động:
1. **Ưu tiên Consultation** (miễn phí, không trừ quota)
2. **Auto-fallback sang Promotion** (trừ quota) khi vi phạm luật 48h

### 🎯 Vấn đề & Giải pháp

#### Vấn đề
- Zalo có **luật 48h**: Chặn gửi tin Tư vấn/Text nếu user không tương tác
- Error codes thường gặp: `-213`, `-201`
- Bạn đã mua gói Promotion (2000 tin/tháng) nhưng muốn tối ưu chi phí

#### Giải pháp
- Hệ thống tự động thử gửi **Consultation** trước (FREE)
- Nếu gặp lỗi 48h → tự động chuyển sang **Promotion** (trừ quota)
- Theo dõi quota usage để quản lý budget

### 🔧 Implementation

#### Function 1: `sendSmartZaloMessage()` - Gửi đơn lẻ

```typescript
import { sendSmartZaloMessage } from "@/lib/zalo-integration";

const result = await sendSmartZaloMessage(
  zaloUserId,           // Zalo User ID
  textContent,          // Nội dung tin nhắn
  promotionAttachmentId, // Attachment ID (optional)
  accessToken           // Custom token (optional)
);

// Response:
{
  success: true,
  messageId: "abc123",
  messageType: "consultation" | "promotion",
  usedQuota: false | true,
  error?: "...",
  errorCode?: -213
}
```

#### Function 2: `batchSmartSend()` - Gửi hàng loạt

```typescript
import { batchSmartSend } from "@/lib/zalo-integration";

const result = await batchSmartSend(
  ["user_id_1", "user_id_2", "user_id_3"],
  "Thông báo từ hệ thống",
  "attachment_id_xxx"
);

// Response: Thống kê chi tiết
{
  total: 3,
  success: 2,
  failed: 1,
  consultationCount: 1,
  promotionCount: 1,
  quotaUsed: 1,
  results: [...]
}
```

### 🌐 API Endpoint

**POST** `/api/zalo/smart-send`

#### Single Mode
```json
{
  "mode": "single",
  "userId": "zalo_user_id",
  "textContent": "Xin chào! Đây là thông báo từ hệ thống",
  "promotionAttachmentId": "attachment_abc123"
}
```

#### Batch Mode
```json
{
  "mode": "batch",
  "userIds": ["user1", "user2", "user3"],
  "textContent": "Thông báo học phí tháng 1",
  "promotionAttachmentId": "attachment_abc123"
}
```

### 📊 Luồng xử lý (Flow)

```
1. Gửi tin Consultation (CS) - FREE
   ├─> ✅ Success → Return { messageType: "consultation", usedQuota: false }
   └─> ❌ Error
       ├─> Error -213/-201 (48h rule)?
       │   ├─> ✅ YES → Gửi tin Promotion (trừ quota)
       │   │   ├─> ✅ Success → Return { messageType: "promotion", usedQuota: true }
       │   │   └─> ❌ Error → Return error
       │   └─> ❌ NO → Return error (không fallback)
```

### 🔑 Lấy Attachment ID cho Promotion

#### Bước 1: Tạo Article/Banner trên Zalo OA Console

1. Đăng nhập [Zalo OA Console](https://oa.zalo.me/)
2. Chọn **Quản lý nội dung** → **Bài viết** hoặc **Banner**
3. Tạo bài viết/banner mới
4. Copy **Attachment ID** từ URL hoặc API response

#### Bước 2: Lưu vào Environment Variables

```env
# .env.local
ZALO_DEFAULT_ATTACHMENT_ID=your_attachment_id_here
ZALO_REMINDER_ATTACHMENT_ID=your_reminder_attachment_id
ZALO_ASSIGNMENT_ATTACHMENT_ID=your_assignment_attachment_id
```

### 🧪 Testing

#### Test với Postman/cURL

```bash
# Single send
curl -X POST http://localhost:3000/api/zalo/smart-send \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "userId": "test_zalo_user_id",
    "textContent": "Test message from smart send",
    "promotionAttachmentId": "your_attachment_id"
  }'

# Batch send
curl -X POST http://localhost:3000/api/zalo/smart-send \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "batch",
    "userIds": ["user1", "user2", "user3"],
    "textContent": "Batch test message",
    "promotionAttachmentId": "your_attachment_id"
  }'
```

#### Test Script (TypeScript)

```typescript
// Test single send
const testSingle = async () => {
  const response = await fetch("/api/zalo/smart-send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "single",
      userId: "test_zalo_user_id",
      textContent: "Test message from smart send",
      promotionAttachmentId: process.env.ZALO_DEFAULT_ATTACHMENT_ID
    })
  });
  
  const result = await response.json();
  console.log("Result:", result);
};
```

### 📝 Best Practices

1. **Luôn cung cấp `promotionAttachmentId`**
   - Tránh lỗi khi fallback sang Promotion
   - Tạo sẵn 1-2 template banner/article

2. **Monitor quota usage**
   - Log `quotaUsed` để theo dõi
   - Alert khi gần hết quota (>1800/2000)

3. **Handle errors gracefully**
   - Check `result.success` trước khi xử lý
   - Log `errorCode` để debug

4. **Batch processing**
   - Sử dụng `batchSmartSend()` cho hiệu quả cao
   - Built-in rate limiting (100ms delay)

### 🚨 Error Codes Reference

| Error Code | Ý nghĩa | Giải pháp |
|------------|---------|-----------|
| `-213` | User không tương tác trong 48h | Auto fallback sang Promotion |
| `-201` | User chưa follow OA | Yêu cầu user follow trước |
| `-124` | Access token hết hạn | Refresh token tự động |
| `-216` | Quota đã hết | Chờ reset hoặc mua thêm |

### 📈 Example: Gửi reminder cho class session

```typescript
import { batchSmartSend } from "@/lib/zalo-integration";

// Lấy danh sách students
const students = await db.select()
  .from(classEnrollments)
  .where(eq(classEnrollments.classId, classId));

const zaloUserIds = students
  .map(s => s.zaloUserId)
  .filter(Boolean);

const result = await batchSmartSend(
  zaloUserIds,
  `📢 Nhắc nhở: Lớp ${className} sẽ bắt đầu lúc ${startTime}`,
  process.env.ZALO_REMINDER_ATTACHMENT_ID
);

console.log(`Sent: ${result.success}/${result.total}`);
console.log(`Quota used: ${result.quotaUsed}`);
```

### ✅ Checklist

- [ ] Đã tạo attachment (article/banner) trên Zalo OA Console
- [ ] Đã lưu `ZALO_DEFAULT_ATTACHMENT_ID` vào `.env`
- [ ] Test với 1 user trước (single mode)
- [ ] Test với 2-3 users (batch mode)
- [ ] Setup monitoring cho quota usage
- [ ] Document attachment IDs cho team

---

**Cập nhật:** 2026-01-09  
**Version:** 2.0 - Thêm Smart Messaging

