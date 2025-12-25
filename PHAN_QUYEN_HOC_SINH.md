# Phân Quyền Học Sinh - Giáo Viên

## Tổng Quan
Hệ thống đã được cập nhật để phân quyền rõ ràng giữa học sinh và giáo viên trong các trang quản lý buổi học.

## Các Trang Đã Cập Nhật

### 1. Trang Analytics (`/classes/{id}/analytics`)
**File**: `lib/actions/analytics.ts`, `components/analytics-dashboard.tsx`

**Cải tiến**:
- Dữ liệu phân tích lấy từ database thật (không dùng mock data)
- Chuyển toàn bộ giao diện sang tiếng Việt
- Function `getStudentsNeedingAttention()` chỉ lấy học sinh của lớp cụ thể

### 2. Trang Danh Sách Buổi Học (`/classes/{id}/sessions`)
**File**: `components/class-sessions-page.tsx`

**Phân quyền**:
- ✅ **Giáo viên/Admin**: Thấy nút "Tạo Buổi Học", "Sửa", "Xóa"
- ✅ **Học sinh**: CHỈ thấy nút "Xem"

**Cách hoạt động**:
```tsx
{userRole && userRole !== "student" && (
  <Button onClick={openCreate}>Tạo Buổi Học</Button>
)}
```

### 3. Trang Chi Tiết Buổi Học (`/classes/{id}/sessions/{sessionId}`)
**File**: `app/classes/[id]/sessions/[sessionId]/page.tsx`

**Phân quyền**:

#### **Học sinh** (role = "student"):
- ✅ Xem thông tin buổi học (thời gian, thời lượng, trạng thái)
- ✅ Xem **CHỈ** nhận xét của chính mình
- ❌ KHÔNG thấy: Tab điểm danh, nhận xét tất cả học sinh, báo cáo
- ❌ KHÔNG thể: Thêm/sửa/xóa bất kỳ thông tin nào

#### **Giáo viên/Admin** (role = "teacher" | "admin"):
- ✅ Xem tất cả thông tin buổi học
- ✅ Tab "Điểm Danh": Điểm danh từng học sinh
- ✅ Tab "Nhận Xét": Viết nhận xét cho từng học sinh
- ✅ Tab "Báo Cáo": Tạo báo cáo buổi học
- ✅ Xem danh sách tất cả nhận xét đã lưu

**Cách hoạt động**:
```tsx
{userRole === 'student' ? (
  <Card>
    <CardTitle>Nhận xét của bạn</CardTitle>
    {/* Chỉ hiển thị nhận xét của chính học sinh */}
    {feedbacks.filter(f => f.studentId === currentUserId)}
  </Card>
) : (
  <Tabs>
    <TabsTrigger value="attendance">Điểm Danh</TabsTrigger>
    <TabsTrigger value="feedback">Nhận Xét</TabsTrigger>
    <TabsTrigger value="report">Báo Cáo</TabsTrigger>
  </Tabs>
)}
```

## API Cập Nhật

### `/api/auth/me`
**File**: `app/api/auth/me/route.ts`

**Thay đổi**:
- ❌ Trước: Dùng mock users, parse token theo format cũ
- ✅ Sau: Dùng `getCurrentSession()` từ database
- ✅ Tương thích với hệ thống đăng nhập thực tế

```typescript
const session = await getCurrentSession();
if (!session?.user) {
  return NextResponse.json({ message: "Không có phiên đăng nhập" }, { status: 401 });
}
```

## Xử Lý Lỗi

### Trường hợp chưa đăng nhập
- Hiển thị card thông báo rõ ràng
- Nút "Đăng nhập" dẫn đến trang signin
- Icon AlertCircle thu hút sự chú ý

### Trường hợp đang load
- Hiển thị "Đang tải thông tin người dùng..."
- Tránh flash content không mong muốn

## Cách Test

### Test với tài khoản Học sinh:
```
Email: student1@example.com
Password: password123
```

**Kỳ vọng**:
1. Trang `/classes/{id}/sessions`: Chỉ thấy nút "Xem"
2. Trang `/classes/{id}/sessions/{sessionId}`: Chỉ thấy card "Nhận xét của bạn"

### Test với tài khoản Giáo viên:
```
Email: teacher1@example.com
Password: password123
```

**Kỳ vọng**:
1. Trang `/classes/{id}/sessions`: Thấy "Tạo Buổi Học", "Sửa", "Xóa"
2. Trang `/classes/{id}/sessions/{sessionId}`: Thấy tabs điểm danh, nhận xét, báo cáo

## Kết Luận

✅ Phân quyền hoàn chỉnh giữa học sinh và giáo viên
✅ Bảo mật dữ liệu - học sinh chỉ xem thông tin của mình
✅ Giao diện thân thiện với từng loại người dùng
✅ Xử lý lỗi và edge cases đầy đủ
