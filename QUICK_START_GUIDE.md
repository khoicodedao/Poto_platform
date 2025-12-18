# 🚀 EduPlatform - Hướng Dẫn Sử Dụng Nhanh

## Khởi Động

### 1. Cài Đặt & Chạy

```bash
# Cài dependencies
npm install

# Chạy development server
npm run dev

# Chạy Drizzle migration
npm run db:push
```

**Server sẽ chạy tại:** `http://localhost:3000`

---

## 📋 Quy Trình Sử Dụng

### A. Giáo Viên

#### 1️⃣ **Tạo & Quản Lý Buổi Học**

```
1. Đăng nhập
2. Vào Lớp Học
3. Chọn "🗓️ Quản Lý Buổi Học"
4. Tab "Tạo Buổi Học Mới"
5. Điền thông tin:
   - Tiêu đề: "Bài 1: Giới Thiệu"
   - Thời gian: [chọn datetime]
   - Phòng: "101"
   - Thời lượng: 60 phút
6. Submit
```

#### 2️⃣ **Điểm Danh Học Sinh**

```
1. Vào Buổi Học
2. Bảng "Điểm Danh"
3. Chọn trạng thái từng HS:
   - ✅ Có Mặt
   - ❌ Vắng Mặt
   - ⏰ Muộn
   - 🚶 Về Sớm
4. Tự động save
```

#### 3️⃣ **Nhận Xét Học Sinh**

```
1. Vào Buổi Học
2. Bảng "Nhận Xét"
3. Với từng HS:
   - Viết nhận xét
   - Chọn điểm thái độ (1-10)
   - Chọn mức độ tham gia
4. Save
```

#### 4️⃣ **Tạo Báo Cáo Buổi Học**

```
1. Vào Buổi Học
2. Bảng "Báo Cáo"
3. Form tự động hiển thị:
   - Tổng HS: [auto]
   - Có Mặt: [auto]
   - Tỷ Lệ Điểm Danh: [auto]%
4. Điền:
   - Tóm tắt nội dung
   - Điểm chính
   - Nội dung buổi tiếp theo
5. Create Report
6. ✨ Auto-gửi qua Zalo (nếu setup)
```

#### 5️⃣ **Tạo Bài Tập với Auto-Release**

```
1. Vào Lớp Học
2. Chọn "📝 Bài Tập & Bài Kiểm Tra"
3. Tab "Tạo Bài Tập Mới"
4. Điền:
   - Tiêu đề: "Bài Tập 1"
   - Mô tả: "Chi tiết bài tập..."
   - Điểm tối đa: 100
   - Hạn nộp: [chọn datetime]
5. Scheduling tự động:
   ☑️ Auto-release: [ngày/giờ phát hành]
   ☑️ Auto-close: [ngày/giờ đóng bài]
6. Submit
7. ✨ Hệ thống tự động phát hành & đóng bài vào giờ
```

#### 6️⃣ **Xem Phân Tích Lớp**

```
1. Vào Lớp Học
2. Chọn "📊 Phân Tích & Thống Kê"
3. Xem:
   📊 KPI Cards:
   - Điểm Trung Bình: [avg]
   - Tỷ Lệ Nộp Bài: [%]
   - Tỷ Lệ Điểm Danh: [%]
   - Nộp Trễ: [%]

   ⚠️ Học Sinh Cần Chú Ý:
   - Danh sách HS có vấn đề
   - Chi tiết: điểm, điểm danh, nộp bài
   - Risk factors

   📈 Charts:
   - Xu hướng nộp bài (30 ngày)
   - Trendline điểm danh
```

#### 7️⃣ **Gửi Thông Báo**

```
1. Vào Lớp Học
2. Chọn "🔔 Thông Báo"
3. Điền:
   - Tiêu đề: "Nhắc nhở bài kiểm tra"
   - Nội dung: "..."
   - Loại: [Reminder/Assignment/Report/Attendance/General]
   - Gửi qua: [App/Zalo/Email]
4. ☑️ Gửi qua nhóm Zalo (nếu cần)
5. Submit
6. ✨ Thông báo gửi ngay + được lưu trong hệ thống
```

---

### B. Học Sinh

#### 1️⃣ **Xem Danh Sách Bài Tập**

```
1. Vào Lớp Học
2. Chọn "📝 Bài Tập & Bài Kiểm Tra"
3. Xem danh sách bài tập:
   - Chưa Phát Hành: không thấy
   - Đang Thực Hiện: xanh
   - Sắp Hết Hạn: vàng
   - Quá Hạn: đỏ
4. Click "Chi Tiết" để nộp bài
```

#### 2️⃣ **Nộp Bài Tập**

```
1. Vào Bài Tập
2. Xem hạn nộp, yêu cầu
3. Nộp file/nội dung
4. ✅ Lưu nộp
5. Chờ chấm điểm từ giáo viên
```

#### 3️⃣ **Xem Hiệu Suất Cá Nhân**

```
1. Vào Lớp Học
2. Chọn "📊 Phân Tích & Thống Kê"
3. Hoặc truy cập: [Class]/my-performance
4. Xem KPI của bạn:
   - Điểm Trung Bình
   - Tỷ Lệ Điểm Danh
   - Tỷ Lệ Nộp Bài
   - Bài Tập Nộp
5. Bar chart: Điểm theo từng bài tập
```

#### 4️⃣ **Nhận Thông Báo**

```
1. Click chuông 🔔 ở góc trên cùng
2. Xem các thông báo:
   - Nhắc lịch học
   - Bài tập được phát hành
   - Kết quả chấm điểm
   - Báo cáo buổi học
3. Click để xem chi tiết
4. Xóa nếu không cần
```

---

## 🔧 Cấu Hình Tính Năng Nâng Cao

### 1. Zalo Integration

**Bước 1:** Lấy thông tin từ Zalo

```
1. Vào Zalo Official Account (OA) của bạn
2. Lấy:
   - ZALO_OA_ID: [ID của OA]
   - ZALO_ACCESS_TOKEN: [Token từ Zalo]
   - ZALO_WEBHOOK_SIGN_KEY: [Key để verify webhook]
```

**Bước 2:** Cập nhật `.env.local`

```bash
ZALO_OA_ID=your_oa_id
ZALO_ACCESS_TOKEN=your_token
ZALO_WEBHOOK_SIGN_KEY=your_sign_key
```

**Bước 3:** Cấu hình Webhook

```
1. Zalo OA Settings → Webhook
2. URL: https://yourdomain.com/api/webhooks/zalo
3. Verify: Hệ thống sẽ validate signature
4. Save
```

**Bước 4:** Test

```
1. Tạo thông báo
2. Chọn "Zalo"
3. Gửi
4. Kiểm tra Zalo nhận được message
```

### 2. Lên Lịch Tự Động (Cron Jobs)

Có 3 cách setup:

#### **Option A: Vercel (Easiest)**

````
File: vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-release-assignments",
      "schedule": "0 8 * * MON"
    },
    {
      "path": "/api/cron/auto-close-assignments",
      "schedule": "59 23 * * FRI"
    },
    {
      "path": "/api/cron/assignment-reminders",
      "schedule": "*/30 * * * *"
    },
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/5 * * * *"
    }
  ]
}
````

```bash
npm run deploy  # Deploy to Vercel
```

#### **Option B: GitHub Actions**

````
File: .github/workflows/cron-jobs.yml
```yaml
name: Cron Jobs

on:
  schedule:
    - cron: '0 8 * * MON'     # Auto-release
    - cron: '59 23 * * FRI'   # Auto-close
    - cron: '*/30 * * * *'    # Reminders
    - cron: '*/5 * * * *'     # Send notifications

jobs:
  run-crons:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run cron jobs
        run: |
          curl -X POST https://yourdomain.com/api/cron/auto-release-assignments \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
````

#### **Option C: External Cron Service**

```
1. Vào cron-job.org (miễn phí)
2. Tạo 4 jobs:
   - URL: https://yourdomain.com/api/cron/auto-release-assignments
   - Schedule: 0 8 MON * * *
   - Tương tự cho các job khác
3. Add header: Authorization: Bearer [CRON_SECRET]
```

**Add CRON_SECRET** vào `.env.local`:

```bash
CRON_SECRET=your_secret_key_here
```

### 3. Email Notifications (Optional)

```bash
# Cài Resend hoặc SendGrid
npm install resend

# Add to .env.local
RESEND_API_KEY=re_xxxxx
```

---

## 📊 Database Management

### Xem Data

```bash
# Connect to PostgreSQL
psql -d eduplatform_local

# View tables
\dt

# View enums
\dT

# Query example
SELECT id, name, email FROM users LIMIT 10;
```

### Reset Database

```bash
# Drop & recreate
npm run db:push -- --force-drop

# Seed data (nếu có)
npm run db:seed
```

---

## 🐛 Troubleshooting

### Problem: "WebSocket is already in CLOSING or CLOSED state"

**Solution:** LiveKit connection issue

```
1. Kiểm tra LIVEKIT_URL trong .env.local
2. Đảm bảo LiveKit server đang chạy
3. Reload page
```

### Problem: "Notification not sent via Zalo"

**Solution:** Check Zalo config

```
1. Verify ZALO_ACCESS_TOKEN hợp lệ
2. Check ZALO_OA_ID chính xác
3. Xem logs API response
4. Thử lại
```

### Problem: "Cron jobs not running"

**Solution:** Check cron configuration

```
1. Verify CRON_SECRET matches
2. Check logs for errors
3. Manually trigger: curl https://yourdomain.com/api/cron/...
4. Verify scheduled time
```

---

## 🎯 Tính Năng Chính - Checklist

### Phase 1: Class Management ✅

- ✅ Tạo & quản lý buổi học
- ✅ Điểm danh tự động
- ✅ Nhận xét & đánh giá HS
- ✅ Báo cáo buổi học

### Phase 2: Notifications ✅

- ✅ Gửi thông báo trong App
- ✅ Gửi via Zalo (setup required)
- ✅ Quản lý notification center
- ✅ Webhook receive from Zalo

### Phase 3: Assignment Automation ✅

- ✅ Tạo bài tập
- ✅ Auto-release vào giờ
- ✅ Auto-close sau hạn
- ✅ Reminder trước hạn

### Phase 4: Analytics ✅

- ✅ Hiệu suất lớp
- ✅ Hiệu suất cá nhân
- ✅ At-risk students alert
- ✅ Charts & visualization

---

## 📞 Support

- 📧 Email: support@eduplatform.vn
- 💬 Zalo: [Link OA]
- 🐞 Issues: GitHub Issues

---

## 🎉 Bạn Đã Sẵn Sàng!

Tất cả tính năng đã được implement. Hãy:

1. **Test locally:** `npm run dev`
2. **Setup Zalo:** Thêm credentials
3. **Setup Cron:** Chọn provider (Vercel/GitHub/External)
4. **Deploy:** Đến production
5. **Enjoy!** 🚀

---

**Last Updated:** Dec 18, 2025
**Status:** All 4 Phases Complete ✅
