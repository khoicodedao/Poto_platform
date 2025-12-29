# 🚀 Quick Start - Zalo OA Integration

## 📦 Những gì đã có

Hệ thống đã có SẴN đầy đủ infrastructure cho Zalo OA:
- ✅ Backend APIs
- ✅ Frontend Components  
- ✅ Database schema
- ✅ Webhook handlers
- ✅ Cron jobs

## ⚡ 3 Bước để bắt đầu

### 1️⃣ Tạo Zalo App (10 phút)

Làm theo hướng dẫn: **`.agent/workflows/zalo-oa-integration.md`**

Kết quả cần có:
- ✅ OA ID
- ✅ App ID  
- ✅ App Secret
- ✅ Access Token

### 2️⃣ Cấu hình (2 phút)

Copy nội dung từ `env-zalo-template.txt` vào `.env.local`:

```env
ZALO_OA_ID=<your_oa_id>
ZALO_APP_ID=<your_app_id>
ZALO_APP_SECRET=<your_app_secret>
ZALO_ACCESS_TOKEN=<your_access_token>
CRON_SECRET=random-secret-key-here
```

### 3️⃣ Test (1 phút)

```bash
# Start dev server
npm run dev

# Navigate to demo page
http://localhost:3000/zalo-demo

# Or add component to admin page
import { ZaloTestConnection } from "@/components/zalo";
```

## 🎯 Sử dụng Components

### Học viên kết nối Zalo

```tsx
import { ZaloConnectionCard } from "@/components/zalo";

// Thêm vào trang profile/settings
<ZaloConnectionCard />
```

### Giáo viên gửi thông báo

```tsx
import { SendZaloMessageDialog } from "@/components/zalo";

// Gửi đến cả lớp
<SendZaloMessageDialog 
  classes={teacherClasses}
  classId={selectedClassId}
/>

// Gửi đến một học viên
<SendZaloMessageDialog 
  recipientId={studentId}
  recipientName={studentName}
  classes={[]}
/>
```

### Admin test connection

```tsx
import { ZaloTestConnection } from "@/components/zalo";

<ZaloTestConnection />
```

## 📚 Tài liệu

- **Setup**: `.agent/workflows/zalo-oa-integration.md`
- **Full Guide**: `ZALO-INTEGRATION-GUIDE.md`
- **Summary**: `ZALO-SUMMARY.md`
- **Demo Page**: `/zalo-demo`

## 🔥 Common Tasks

### Gửi tin đến cả lớp
```typescript
await fetch("/api/zalo/send-message", {
  method: "POST",
  body: JSON.stringify({
    classId: 123,
    title: "Thông báo buổi học",
    message: "Buổi học ngày mai lúc 9:00 AM",
    type: "reminder"
  })
});
```

### Gửi tin đến một người
```typescript
await fetch("/api/zalo/send-message", {
  method: "POST",
  body: JSON.stringify({
    recipientId: 456,
    title: "Điểm bài tập",
    message: "Bạn đã đạt 9/10",
    type: "report"
  })
});
```

### Kết nối Zalo
```typescript
await fetch("/api/zalo/connect", {
  method: "POST",
  body: JSON.stringify({
    zaloUserId: "1234567890"
  })
});
```

## ⚠️ Lưu ý

**FREE OA có giới hạn:**
- 7 ngày rule (chỉ gửi được đến user tương tác trong 7 ngày)
- ~1000 tin/ngày
- Một chiều (không nhận reply)

→ Upgrade Premium để bỏ giới hạn

## 🆘 Troubleshooting

**Lỗi: Missing Zalo configuration**
→ Kiểm tra `.env.local` có đủ ZALO_* variables

**Lỗi: Invalid access token**  
→ Token hết hạn, lấy token mới từ Developer Console

**Không nhận được tin**
→ Kiểm tra học viên đã follow OA và kết nối Zalo ID chưa

## 📞 Next Steps

1. ✅ Setup Zalo App theo workflow
2. ✅ Add credentials vào .env.local
3. ✅ Test connection ở /zalo-demo
4. ✅ Tích hợp components vào UI
5. ✅ Hướng dẫn học viên follow OA
6. 🚀 Sử dụng!

---

**Status**: ✅ READY (chỉ cần credentials)
