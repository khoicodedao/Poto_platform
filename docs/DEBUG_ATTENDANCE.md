# Debug Auto-Attendance

## Các bước kiểm tra khi gặp lỗi điểm danh

### 1. Kiểm tra Console Log
Mở DevTools (F12) → Console và tìm các log bắt đầu bằng `[Auto-Attendance]`:

```
[Auto-Attendance] Check conditions: { isConnected: true, attendanceMarked: false, hasUser: true, classId: 1 }
[Auto-Attendance] Starting auto-attendance for classId: 1
[Auto-Attendance] API response status: 200
[Auto-Attendance] API response data: {...}
```

### 2. Kiểm tra Thời gian Session
API chỉ cho phép điểm danh khi buổi học:
- Sắp bắt đầu (trong vòng 15 phút tới)
- Đã bắt đầu (nhưng không quá 2 giờ)

**Ví dụ:**
- Thời gian hiện tại: 14:25
- Session scheduled: 13:00 → ✅ OK (trong vòng 2 giờ)
- Session scheduled: 11:00 → ❌ Quá 2 giờ
- Session scheduled: 15:00 → ✅ OK (trong vòng 15 phút)
- Session scheduled: 16:00 → ❌ Chưa tới

### 3. Kiểm tra Enrollment
Học viên phải được enroll vào lớp học.

**Truy vấn SQL để kiểm tra:**
```sql
SELECT * FROM class_enrollments 
WHERE class_id = 1 AND student_id = [your_user_id];
```

### 4. Kiểm tra Session hiện tại
**Truy vấn SQL:**
```sql
SELECT id, title, scheduled_at, status
FROM class_sessions
WHERE class_id = 1
AND scheduled_at >= NOW() - INTERVAL '2 hours'
AND scheduled_at <= NOW() + INTERVAL '15 minutes'
ORDER BY scheduled_at ASC
LIMIT 1;
```

### 5. Các thông báo có thể xuất hiện

#### ✅ Thành công:
- "✓ Điểm danh thành công cho buổi: [Tên buổi học]"
- "✓ Điểm danh muộn cho buổi: [Tên buổi học] (Muộn X phút)"
- "Bạn đã được điểm danh cho buổi: [Tên buổi học]"

#### ℹ️ Thông tin:
- "ℹ️ Không tìm thấy buổi học đang diễn ra hoặc sắp diễn ra"
- "ℹ️ You are not enrolled in this class"

#### ❌ Lỗi:
- "❌ Lỗi điểm danh tự động: [Chi tiết lỗi]"
- "Unauthorized - Please login"

### 6. Giải pháp thường gặp

#### Vấn đề: "Không tìm thấy buổi học"
**Giải pháp:**
1. Tạo session mới với thời gian hiện tại hoặc sắp tới
2. Hoặc cập nhật scheduled_at của session hiện tại:
```sql
UPDATE class_sessions 
SET scheduled_at = NOW() 
WHERE id = [session_id];
```

#### Vấn đề: "Not enrolled"
**Giải pháp:**
Thêm enrollment:
```sql
INSERT INTO class_enrollments (class_id, student_id)
VALUES (1, [your_student_id]);
```

#### Vấn đề: Không thấy thông báo gì
**Giải pháp:**
1. Kiểm tra user đã login chưa
2. Kiểm tra classroom đã connect chưa (isConnected = true)
3. Xem console log để biết nguyên nhân

### 7. Test Flow hoàn chỉnh

1. ✅ Đăng nhập với tài khoản student
2. ✅ Kiểm tra có enrollment trong class
3. ✅ Tạo/cập nhật session với thời gian phù hợp
4. ✅ Vào trang /classroom/[classId]
5. ✅ Đợi LiveKit connect
6. ✅ Kiểm tra thông báo điểm danh
7. ✅ Vào trang /classes/[classId]/sessions/[sessionId]
8. ✅ Xác nhận status đã update (present/late)
