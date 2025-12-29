# Hướng dẫn Tích hợp và Sử dụng Zalo OA

## 📋 Tổng quan

Tôi đã triển khai đầy đủ hệ thống tích hợp Zalo OA vào nền tảng học tập online của bạn. Dưới đây là chi tiết về những gì đã làm và cách sử dụng.

---

## ✅ Những gì đã triển khai

### 1. **Backend Infrastructure**

#### API Endpoints:
- ✅ `POST /api/zalo/send-message` - Gửi tin nhắn đến cá nhân hoặc cả lớp
- ✅ `POST /api/zalo/connect` - Kết nối tài khoản Zalo
- ✅ `DELETE /api/zalo/connect` - Ngắt kết nối tài khoản Zalo
- ✅ `GET /api/zalo/connect` - Kiểm tra trạng thái kết nối
- ✅ `GET /api/zalo/test` - Test kết nối Zalo OA (admin only)
- ✅ `POST /api/webhooks/zalo` - Webhook nhận events từ Zalo
- ✅ `POST /api/cron/send-reminders` - Cron job gửi thông báo tự động

#### Services:
- ✅ `lib/zalo-integration.ts` - Module xử lý Zalo API
  - `sendZaloMessage()` - Gửi tin nhắn cá nhân
  - `sendZaloGroupMessage()` - Gửi tin nhắn nhóm
  - `getZaloUserProfile()` - Lấy thông tin user
  - `testZaloConnection()` - Test kết nối
  - `verifyZaloWebhookSignature()` - Xác thực webhook

#### Database:
- ✅ `users.zaloUserId` - Lưu Zalo ID của học viên
- ✅ `classes.zaloGroupId` - Lưu Zalo Group ID của lớp
- ✅ `notifications` table - Log tất cả thông báo đã gửi

### 2. **Frontend Components**

- ✅ `SendZaloMessageDialog` - Dialog gửi tin nhắn Zalo
- ✅ `ZaloConnectionCard` - Card để user kết nối Zalo
- ✅ `ZaloTestConnection` - Component test connection (admin)

---

## 🚀 Cách thiết lập

### Bước 1: Cấu hình Environment Variables

Sau khi làm theo hướng dẫn trong file `.agent/workflows/zalo-oa-integration.md`, thêm các biến sau vào file `.env.local`:

```env
# Zalo OA Configuration
ZALO_OA_ID=<your_oa_id>
ZALO_APP_ID=<your_app_id>
ZALO_APP_SECRET=<your_app_secret>
ZALO_ACCESS_TOKEN=<your_access_token>

# Optional - for webhook verification
ZALO_WEBHOOK_SIGN_KEY=<your_webhook_sign_key>
ZALO_WEBHOOK_VERIFY_TOKEN=<your_verify_token>

# Optional - for cron jobs
CRON_SECRET=<your_secret_for_cron>
```

### Bước 2: Cài đặt Webhook (Tùy chọn)

1. Vào Zalo Developer Console
2. Chọn app của bạn
3. Vào **Webhook Settings**
4. Thêm URL: `https://your-domain.com/api/webhooks/zalo`
5. Nhập verify token (giống với `ZALO_WEBHOOK_VERIFY_TOKEN`)

### Bước 3: Test kết nối

Sau khi deploy hoặc chạy local, sử dụng component `ZaloTestConnection` để test.

---

## 📖 Hướng dẫn sử dụng

### A. Cho Học viên (Students)

#### 1. Kết nối tài khoản Zalo

Học viên cần thực hiện các bước sau:

1. **Follow OA của công ty** trên Zalo
2. **Nhắn tin "ID"** cho OA (hoặc bất kỳ tin nhắn nào)
3. **OA sẽ tự động trả Zalo User ID** (hoặc admin cung cấp)
4. **Vào Profile/Settings** trên nền tảng học tập
5. **Tìm section "Kết nối Zalo"** (component `ZaloConnectionCard`)
6. **Nhập Zalo User ID** và click "Kết nối"

#### Sử dụng component:
```tsx
import { ZaloConnectionCard } from "@/components/zalo/zalo-connection-card";

// Trong page profile hoặc settings
<ZaloConnectionCard />
```

### B. Cho Giáo viên/Admin (Teachers/Admins)

#### 1. Gửi tin nhắn đến một lớp

```tsx
import { SendZaloMessageDialog } from "@/components/zalo/send-message-dialog";

// Trong trang class detail
<SendZaloMessageDialog 
  classes={[{ id: classId, name: className }]}
  classId={classId} // Pre-select class
/>
```

#### 2. Gửi tin nhắn đến học viên cụ thể

```tsx
<SendZaloMessageDialog 
  classes={[]}
  recipientId={studentId}
  recipientName={studentName}
/>
```

#### 3. Gửi tin nhắn từ nhiều lớp

```tsx
<SendZaloMessageDialog 
  classes={teacherClasses} // Array of all classes
/>
```

### C. Cho Admin

#### Test Zalo Connection

```tsx
import { ZaloTestConnection } from "@/components/zalo/test-connection";

// Trong admin dashboard
<ZaloTestConnection />
```

---

## 🎯 Use Cases thực tế

### 1. Nhắc nhở buổi học sắp diễn ra

**Cách 1: Gửi thủ công**
- Teacher vào trang Class Detail
- Click "Gửi tin Zalo đến lớp"
- Chọn loại: "⏰ Nhắc nhở"
- Nhập nội dung
- Gửi

**Cách 2: Tự động (đã có sẵn)**
- Hệ thống tự động tạo notification 1-2 giờ trước buổi học
- Cron job `/api/cron/send-reminders` sẽ gửi tự động

### 2. Thông báo bài tập mới

```tsx
// Sau khi tạo assignment
await fetch("/api/zalo/send-message", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    classId: classId,
    title: "Bài tập mới",
    message: `Bài tập "${assignmentTitle}" đã được giao. Hạn nộp: ${dueDate}`,
    type: "assignment",
  }),
});
```

### 3. Gửi kết quả học tập

```tsx
// Gửi riêng cho từng học viên sau khi chấm điểm
<SendZaloMessageDialog 
  recipientId={student.id}
  recipientName={student.name}
  classes={[]}
/>
```

### 4. Thông báo khẩn cấp cho cả lớp

```tsx
<SendZaloMessageDialog 
  classes={[currentClass]}
  classId={currentClass.id}
/>
```

---

## 🔧 API Usage Examples

### Gửi tin nhắn đến toàn bộ lớp

```typescript
const response = await fetch("/api/zalo/send-message", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    classId: 123,
    title: "Thông báo buổi học",
    message: "Buổi học ngày mai sẽ bắt đầu lúc 9:00 AM. Link: https://...",
    type: "reminder",
  }),
});

const result = await response.json();
// {
//   success: true,
//   summary: {
//     total: 25,
//     success: 23,
//     failed: 0,
//     skipped: 2
//   },
//   results: [...]
// }
```

### Gửi tin nhắn đến một học viên

```typescript
const response = await fetch("/api/zalo/send-message", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    recipientId: 456,
    title: "Điểm bài tập",
    message: "Bạn đã đạt 9/10 điểm cho bài tập tuần này. Excellent!",
    type: "report",
  }),
});
```

---

## 📊 Monitoring & Logs

### Kiểm tra logs

Tất cả tin nhắn Zalo được log vào database:

```sql
SELECT * FROM notifications 
WHERE sent_via = 'zalo' 
ORDER BY created_at DESC;
```

### Xem thống kê gửi tin

```typescript
// Get success rate
const stats = await db
  .select({
    total: count(),
    sent: countIf(eq(notifications.status, 'sent')),
    failed: countIf(eq(notifications.status, 'failed')),
  })
  .from(notifications)
  .where(eq(notifications.sentVia, 'zalo'));
```

---

## ⚠️ Lưu ý quan trọng

### Giới hạn FREE OA:
1. **7 ngày rule**: Chỉ gửi được đến user đã tương tác với OA trong 7 ngày gần nhất
2. **Rate limit**: ~1000 tin/ngày
3. **Một chiều**: FREE OA chỉ gửi được, không nhận phản hồi phức tạp

### Để nâng cấp Premium:
- Gửi không giới hạn số lượng tin nhắn
- Gửi được đến tất cả follower (không cần 7 ngày)
- Hỗ trợ template message với buttons, carousel
- API đầy đủ hơn

---

## 🎨 Tích hợp vào UI hiện có

### 1. Thêm vào Class Detail Page

```tsx
// app/classes/[id]/page.tsx
import { SendZaloMessageDialog } from "@/components/zalo/send-message-dialog";

// Trong component
<div className="flex gap-2">
  {/* Existing buttons */}
  <SendZaloMessageDialog 
    classes={[{ id: classData.id, name: classData.name }]}
    classId={classData.id}
  />
</div>
```

### 2. Thêm vào Student Profile/Settings

```tsx
// app/profile/page.tsx hoặc app/settings/page.tsx
import { ZaloConnectionCard } from "@/components/zalo/zalo-connection-card";

<div className="grid gap-6">
  {/* Other cards */}
  <ZaloConnectionCard />
</div>
```

### 3. Thêm vào Admin Dashboard

```tsx
// app/admin/settings/page.tsx
import { ZaloTestConnection } from "@/components/zalo/test-connection";

<div className="grid gap-6">
  <ZaloTestConnection />
  {/* Other admin settings */}
</div>
```

---

## 🐛 Troubleshooting

### Lỗi: "User has no Zalo ID"
→ Học viên chưa kết nối tài khoản Zalo. Yêu cầu follow OA và kết nối.

### Lỗi: "Zalo API error: Invalid access token"
→ Access token hết hạn. Cần refresh token hoặc lấy token mới.

### Lỗi: "Missing Zalo configuration"
→ Kiểm tra `.env.local` có đủ các biến `ZALO_*` chưa.

### Không nhận được webhook events
→ Kiểm tra URL webhook đã đúng chưa, verify token đã đúng chưa.

---

## 📞 Next Steps

1. ✅ **Hoàn thành setup Zalo OA** theo `.agent/workflows/zalo-oa-integration.md`
2. ✅ **Thêm credentials vào `.env.local`**
3. ✅ **Test connection** bằng component `ZaloTestConnection`
4. ✅ **Tích hợp UI components** vào các trang phù hợp
5. ✅ **Hướng dẫn học viên follow OA** và kết nối tài khoản
6. ✅ **Test gửi tin nhắn** thử nghiệm
7. 🚀 **Deploy và sử dụng thực tế**

---

Nếu cần hỗ trợ thêm về bất kỳ phần nào, hãy cho tôi biết! 💪
