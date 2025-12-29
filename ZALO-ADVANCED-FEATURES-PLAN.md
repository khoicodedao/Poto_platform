# 🚀 Zalo Advanced Features - Implementation Plan

## ✅ Tổng quan

Tài liệu này mô tả chi tiết các tính năng nâng cao sẽ được implement cho Zalo OA integration.

---

## 📋 Features List

### 1. Auto-send Reminder trước buổi học ⏰
**Status**: Infrastructure có sẵn, cần enhance

**Mô tả:**
- Tự động gửi reminder 2 giờ trước buổi học
- Tự động gửi reminder 10 phút trước buổi học
- Gửi qua Zalo cho học viên đã follow OA

**Files cần tạo/sửa:**
- `lib/actions/auto-notifications.ts` - Functions tạo auto notifications
- `app/api/cron/create-session-reminders/route.ts` - Cron job tạo reminders
- Enhance existing `app/api/cron/send-reminders/route.ts`

**Implementation:**
```typescript
// Khi tạo class session mới → Tự động tạo 2 notifications:
1. Reminder 2 giờ trước (scheduledSendAt = sessionTime - 2 hours)
2. Reminder 10 phút trước (scheduledSendAt = sessionTime - 10 minutes)

// Cron job chạy mỗi 5 phút sẽ gửi các notifications theo schedule
```

---

### 2. Auto-send Điểm số sau khi chấm 📊
**Status**: Cần tạo mới

**Mô tả:**
- Tự động gửi Zalo khi teacher chấm điểm assignment
- Thông báo điểm số và feedback

**Files cần tạo:**
- `lib/actions/assignment-notifications.ts`
- Hook vào existing assignment grading flow

**Implementation:**
```typescript
// Sau khi grade assignment:
1. Tạo notification type "assignment" với điểm số
2. Gửi qua Zalo nếu student đã connect
3. Format message: "Bài tập X đã được chấm. Điểm: Y/100. Feedback: ..."
```

---

### 3. Thông báo Deadline bài tập 📝
**Status**: Cần tạo mới

**Mô tả:**
- Khi tạo assignment mới → Auto gửi thông báo
- Nhắc deadline 1 ngày trước, 1 giờ trước

**Files cần tạo:**
- Hook vào assignment creation
- Cron job kiểm tra deadline sắp tới

**Implementation:**
```typescript
// Khi tạo assignment:
1. Auto tạo notification cho tất cả students in class
2. Schedule reminder 1 ngày trước deadline
3. Schedule reminder 1 giờ trước deadline
```

---

### 4. Export Danh sách Followers 📥
**Status**: Cần tạo mới

**Mô tả:**
- Export danh sách followers ra Excel
- Bao gồm: Zalo ID, tên, trạng thái kết nối, lớp học

**Files cần tạo:**
- `app/api/zalo/export-followers/route.ts`
- `components/zalo/export-followers-button.tsx`

**Library:**
```bash
npm install xlsx
```

**Implementation:**
```typescript
// GET /api/zalo/export-followers?classId=X
1. Lấy danh sách students từ database
2. Match với Zalo followers
3. Generate Excel file
4. Return file download
```

---

### 5. Bulk Update Zalo IDs 🔄
**Status**: Cần tạo mới

**Mô tả:**
- Import file Excel với Zalo IDs
- Bulk update cho nhiều students cùng lúc
- Validate Zalo IDs

**Files cần tạo:**
- `app/api/zalo/bulk-update-ids/route.ts`
- `components/zalo/bulk-update-dialog.tsx`

**Implementation:**
```typescript
// POST /api/zalo/bulk-update-ids
Body: Excel file với columns: studentEmail, zaloUserId
1. Parse Excel
2. Validate emails exist in DB
3. Update zaloUserId cho từng student
4. Return success/fail report
```

---

### 6. Analytics Dashboard 📈
**Status**: Cần tạo mới

**Mô tả:**
- Track delivery rate, open rate (nếu có)
- Dashboard hiển thị statistics
- Chart theo thời gian

**Files cần tạo:**
- `app/api/zalo/analytics/route.ts`
- `components/zalo/analytics-dashboard.tsx`

**Metrics:**
```typescript
- Total messages sent (by type, by class, by time)
- Delivery rate: sent / total
- Failure rate: failed / total
- Success rate by class
- Top notification types
- Usage over time (chart)
```

---

### 7. Chatbot FAQ (Basic) 🤖
**Status**: Cần tạo mới

**Mô tả:**
- Auto reply câu hỏi thường gặp
- Keyword-based responses
- Fallback to human

**Files cần tạo:**
- `app/api/webhooks/zalo/route.ts` - Enhance existing
- `lib/chatbot-responses.ts` - FAQ database

**Implementation:**
```typescript
// Khi user gửi tin nhắn đến OA:
1. Parse message
2. Match với FAQ keywords
3. Auto reply nếu match
4. Log conversation
```

**FAQ Examples:**
```
"lịch học" → "Xem lịch học tại: [link]"
"id" → "Zalo ID của bạn là: [user_id]"
"điểm" → "Xem điểm tại: [link]"
"bài tập" → "Danh sách bài tập: [link]"
```

---

## 🎯 Priority Order

### Phase 1 (Cao - Làm ngay)
1. ✅ Auto-send reminder trước buổi học
2. ✅ Thông báo deadline bài tập
3. ✅ Auto-send điểm số
4. ✅ Export danh sách followers
5. ✅ Bulk update Zalo IDs

### Phase 2 (Trung bình)
6. ✅ Analytics dashboard
7. ✅ Chatbot FAQ basic

### Phase 3 (Nâng cao - sau)
- Advanced chatbot with AI
- Two-way messaging
- Rich message templates
- Video/image attachments

---

## 📊 Database Changes Needed

### Thêm tracking fields (optional):
```sql
ALTER TABLE notifications 
ADD COLUMN delivered_at TIMESTAMP,
ADD COLUMN read_at TIMESTAMP,
ADD COLUMN clicked_at TIMESTAMP;
```

### Chatbot conversation log:
```sql
CREATE TABLE zalo_conversations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  message TEXT,
  response TEXT,
  matched_faq VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 Environment Variables

Không cần thêm, sử dụng existing:
```env
ZALO_OA_ID=194643797257239355
ZALO_APP_ID=2284323715851765379
ZALO_APP_SECRET=zvNxF7y02XOI05kwZI6I
ZALO_ACCESS_TOKEN=<token>
CRON_SECRET=<secret>
```

---

## 📦 Dependencies cần thêm

```bash
# For Excel export/import
npm install xlsx

# For charts (analytics)
npm install recharts

# Optional: For advanced chatbot
npm install openai  # if using AI
```

---

## 🧪 Testing Plan

### Test Cases:

1. **Auto Reminders:**
   - Tạo session 3 giờ sau → Check reminder được tạo
   - Wait cron job → Check reminder được gửi

2. **Điểm số:**
   - Chấm điểm assignment → Check notification
   - Student nhận Zalo message

3. **Export:**
   - Click export → Download Excel
   - Verify data đúng

4. **Bulk Update:**
   - Upload Excel → Check students updated
   - Verify Zalo IDs in DB

5. **Analytics:**
   - Gửi messages → Check stats update
   - View dashboard → Charts hiển thị

6. **Chatbot:**
   - Gửi "id" qua Zalo → Nhận auto reply
   - Gửi "lịch học" → Nhận link

---

## 🚀 Deployment Checklist

- [ ] All files created
- [ ] Dependencies installed
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Cron jobs configured
- [ ] Webhooks registered
- [ ] Tests passed
- [ ] Documentation updated

---

## 📚 Files sẽ tạo (Summary)

### Backend (10 files):
1. `lib/actions/auto-notifications.ts`
2. `lib/actions/assignment-notifications.ts`
3. `lib/chatbot-responses.ts`
4. `lib/excel-utils.ts`
5. `app/api/cron/create-session-reminders/route.ts`
6. `app/api/zalo/export-followers/route.ts`
7. `app/api/zalo/bulk-update-ids/route.ts`
8. `app/api/zalo/analytics/route.ts`
9. Enhance: `app/api/webhooks/zalo/route.ts`
10. Enhance: `lib/actions/class-sessions.ts`

### Frontend (5 files):
1. `components/zalo/export-followers-button.tsx`
2. `components/zalo/bulk-update-dialog.tsx`
3. `components/zalo/analytics-dashboard.tsx`
4. `components/zalo/auto-notification-settings.tsx`
5. Update: `components/zalo/index.ts`

### Total: ~15 files

---

**Estimated Time:** 4-6 hours for all features

**Start Implementation:** YES! Let's go! 🚀
