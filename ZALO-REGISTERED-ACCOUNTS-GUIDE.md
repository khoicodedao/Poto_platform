# 👥 Danh sách Tài khoản đã Đăng ký OA

## ✅ Feature mới

Tôi vừa tạo tính năng để xem **danh sách tất cả tài khoản đã đăng ký Zalo OA**.

---

## 🎯 Tính năng

### Hiển thị:
1. ✅ **Tổng số tài khoản** đã đăng ký (có Zalo ID)
2. ✅ **Số lượng đang follow** OA
3. ✅ **Phân loại theo vai trò**: Student, Teacher, TA, Admin
4. ✅ **Bảng chi tiết** từng tài khoản:
   - Tên, Email
   - Vai trò
   - Zalo User ID
   - Trạng thái (Active/Inactive)
   - Follow status (Đang follow / Chưa follow)

5. ✅ **Followers chưa đăng ký**: Danh sách Zalo IDs đã follow OA nhưng chưa kết nối trong hệ thống

---

## 🚀 Cách xem

### Vào Demo Page:
```
http://localhost:3000/zalo-demo
```

Scroll xuống cuối, bạn sẽ thấy section mới:
**"Danh sách Tài khoản đã Đăng ký OA"**

### Thông tin hiển thị:

**Summary Cards (4 số liệu):**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Đã đăng ký   │ Đang follow  │ Chưa follow  │ Tổng followers│
│      12      │      8       │      4       │      10      │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Phân loại theo vai trò:**
- Học viên: X người
- Giáo viên: Y người
- Trợ giảng: Z người
- Admin: A người

**Bảng chi tiết:**
| Tên | Email | Vai trò | Zalo ID | Status | Follow |
|-----|-------|---------|---------|--------|--------|
| Nguyễn Văn A | a@example.com | Học viên | 123456... | Active | ✓ Đang follow |
| Trần Thị B | b@example.com | Giáo viên | 789012... | Active | ✗ Chưa follow |

---

## 📊 API Endpoint

### GET /api/zalo/registered-accounts

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": {
      "registered": 12,
      "following": 10,
      "matched": 8,
      "unmatched": {
        "registeredButNotFollowing": 4,
        "followingButNotRegistered": 2
      }
    },
    "byRole": {
      "students": 10,
      "teachers": 1,
      "teachingAssistants": 0,
      "admins": 1
    }
  },
  "accounts": {
    "registered": [
      {
        "id": 1,
        "name": "Nguyễn Văn A",
        "email": "a@example.com",
        "role": "student",
        "zaloUserId": "1234567890",
        "isActive": true,
        "isFollowing": true,
        "registeredAt": "2025-01-01T00:00:00Z",
        "status": "following"
      }
    ],
    "unregisteredFollowers": [
      {
        "zaloUserId": "9999999999",
        "status": "following_not_registered",
        "isFollowing": true,
        "note": "Đã follow OA nhưng chưa kết nối trong hệ thống"
      }
    ]
  },
  "timestamp": "2025-12-29T12:15:00Z"
}
```

---

## 🎯 Use Cases

### 1. Kiểm tra ai đã đăng ký
- Xem tổng số và danh sách chi tiết
- Phân loại theo vai trò
- Identify students vs teachers

### 2. Find accounts chưa follow
- Filter cột "Follow"
- Nhìn thấy ai có Zalo ID nhưng chưa follow OA
- Nhắc nhở họ follow

### 3. Identify followers chưa đăng ký
- Danh sách Zalo IDs trong OA nhưng không có trong system
- Có thể là users mới cần hướng dẫn đăng ký

### 4. Statistics & Reports
- Export data để báo cáo
- Track adoption rate
- Monitor growth

---

## 💡 So sánh vs Check Students Followers

| Feature | Check Students Followers | Registered Accounts List |
|---------|--------------------------|--------------------------|
| Scope | 1 lớp specific | Toàn bộ hệ thống |
| Filter | By class | All users |
| Role | Teacher/TA/Admin | Teacher/TA/Admin |
| Purpose | Check before send message | Overview all accounts |

**Khi nào dùng gì:**
- **Check Students Followers**: Khi muốn gửi tin đến 1 lớp → check trước
- **Registered Accounts**: Khi muốn xem overview toàn system

---

## 🔄 Refresh Data

Click nút **"Làm mới"** (Refresh icon) để reload data mới nhất từ:
- Database (registered accounts)
- Zalo OA API (current followers)

---

## 📝 Giải thích các Status

### "Đã đăng ký" (Registered)
- User đã nhập Zalo User ID trong hệ thống
- Có record trong database với `zaloUserId` không null

### "Đang follow OA" (Following)
- User hiện đang follow Zalo OA của công ty
- Xuất hiện trong danh sách followers từ Zalo API

### "Chưa follow" (Not Following)
- User đã đăng ký (có Zalo ID) nhưng **không có** trong followers list
- Có thể đã unfollow hoặc nhập sai ID

### "Followers chưa đăng ký" (Unregistered Followers)
- Zalo User ID có trong OA followers
- Nhưng **không tìm thấy** trong database
- Có thể là người mới follow, chưa kết nối account

---

## 🎨 UI Components

### RegisteredAccountsList

```tsx
import { RegisteredAccountsList } from "@/components/zalo";

// Usage
<RegisteredAccountsList />
```

**Props:** None (self-contained)

**Features:**
- Auto-load on mount
- Refresh button
- Loading states
- Empty states
- Responsive table

---

## 📦 Files Created

**Backend:**
- `app/api/zalo/registered-accounts/route.ts`

**Frontend:**
- `components/zalo/registered-accounts-list.tsx`

**Updates:**
- `components/zalo/index.ts` - Export
- `app/(dashboard)/zalo-demo/page.tsx` - Demo UI

---

## ✅ Testing

### Bước 1: Load page
```
http://localhost:3000/zalo-demo
```

### Bước 2: Scroll to bottom
Tìm section **"Danh sách Tài khoản đã Đăng ký OA"**

### Bước 3: Verify data
- Kiểm tra số liệu summary
- Xem table chi tiết
- Check followers chưa đăng ký (nếu có)

### Bước 4: Test refresh
- Click **"Làm mới"**
- Data reload

---

## 🎊 Summary

**Thông tin bạn sẽ thấy:**
1. Tổng số accounts đã đăng ký Zalo
2. Số lượng đang follow OA (của những người đã đăng ký)
3. Phân loại theo vai trò
4. Chi tiết từng account
5. Zalo IDs đã follow nhưng chưa trong system

**Mục đích:**
- Overview toàn bộ Zalo integration status
- Identify gaps (registered but not following, following but not registered)
- Monitor adoption
- Make decisions (ai cần nhắc follow, ai cần hướng dẫn đăng ký)

---

**Hãy vào `/zalo-demo` và xem danh sách thật ngay!** 🚀

Cho tôi biết bạn thấy bao nhiêu accounts! 😊
