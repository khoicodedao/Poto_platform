# Hướng dẫn: Tích hợp Liên kết Zalo Chat từ Danh sách Học sinh

## Tổng quan
Tính năng này cho phép quản lý viên/giáo viên mở trực tiếp chat Zalo với học sinh ngay từ trang danh sách học sinh trong lớp học.

## Các thay đổi đã thực hiện

### 1. **Cập nhật Backend - lib/actions/classes.ts**

#### Thêm `zaloUserId` vào query học sinh:
```typescript
const studentsQuery = db
  .select({
    id: users.id,
    name: users.name,
    email: users.email,
    avatar: users.avatar,
    zaloUserId: users.zaloUserId,  // ← Thêm mới
    enrolledAt: classEnrollments.enrolledAt,
  })
  // ...
```

#### Cập nhật TypeScript type:
```typescript
export type ClassDetail = {
  // ...
  students: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    zaloUserId: string | null;  // ← Thêm mới
    enrolledAt: Date | null;
  }[];
  // ...
};
```

### 2. **Cập nhật Frontend - components/students-list.tsx**

#### A. Cập nhật Student Interface:
```typescript
interface Student {
  id: number;
  name: string;
  email: string;
  zaloUserId?: string | null;  // ← Thêm mới
  enrolledAt?: string;
  status?: string;
}
```

#### B. Thêm chức năng Zalo Deep Link:
```typescript
// Tạo Zalo deep link
const getZaloDeepLink = (zaloUserId: string) => {
  return `https://zalo.me/${zaloUserId}`;
};

// Xử lý mở chat Zalo
const handleOpenZalo = (student: Student) => {
  if (!student.zaloUserId) {
    toast({
      title: "Không có Zalo ID",
      description: `Học sinh ${student.name} chưa liên kết tài khoản Zalo`,
      variant: "destructive",
    });
    return;
  }
  
  const zaloLink = getZaloDeepLink(student.zaloUserId);
  window.open(zaloLink, "_blank");
};
```

#### C. Thêm cột "Liên Hệ" trong bảng Desktop:
```typescript
<TableHead>Liên Hệ</TableHead>
```

#### D. Thêm nút Zalo Chat:

**Desktop View:**
```tsx
<TableCell>
  <Button
    size="sm"
    variant={student.zaloUserId ? "default" : "ghost"}
    className="flex items-center gap-2"
    onClick={() => handleOpenZalo(student)}
    disabled={!student.zaloUserId}
  >
    <MessageCircle className="h-4 w-4" />
    {student.zaloUserId ? "Nhắn tin" : "Chưa liên kết"}
  </Button>
</TableCell>
```

**Mobile View:**
```tsx
<Button
  size="sm"
  variant={student.zaloUserId ? "default" : "ghost"}
  className="flex items-center gap-1 text-xs"
  onClick={() => handleOpenZalo(student)}
  disabled={!student.zaloUserId}
>
  <MessageCircle className="h-3 w-3" />
  Zalo
</Button>
```

## Cách sử dụng

### Bước 1: Truy cập trang danh sách học sinh
Từ trang lớp học, click vào menu "Học sinh" hoặc truy cập trực tiếp:
```
http://localhost:5001/classes/{classId}/students
```

### Bước 2: Nhấn nút "Nhắn tin" (hoặc "Zalo" trên mobile)
- Nếu học sinh **đã liên kết** Zalo:
  - Nút sẽ hiển thị màu primary với text "Nhắn tin"
  - Click sẽ mở tab mới với link `https://zalo.me/{zaloUserId}`
  - Trang Zalo OA sẽ mở, cho phép quản lý viên nhắn tin trực tiếp

- Nếu học sinh **chưa liên kết** Zalo:
  - Nút sẽ hiển thị màu ghost (xám) với text "Chưa liên kết"
  - Nút bị disable, không thể click
  - Hiển thị toast thông báo nếu cố gắng click

## Zalo Deep Link Format

Format link: `https://zalo.me/{zaloUserId}`

### Ví dụ:
- Zalo User ID: `1234567890`
- Deep Link: `https://zalo.me/1234567890`

### Cách hoạt động:
1. **Trên Desktop/Web**: Mở trang Zalo OA trong browser
2. **Trên Mobile**: 
   - Nếu có app Zalo: Tự động mở app và chuyển đến chat
   - Nếu không có app: Mở trang Zalo OA trên browser mobile

## Liên kết Zalo ID cho học sinh

Để học sinh có thể nhận tin nhắn qua Zalo, cần liên kết `zaloUserId`:

### Cách 1: Thông qua Zalo Follower Dialog
1. Học sinh follow Zalo OA của trung tâm
2. Admin vào trang quản lý học sinh
3. Click "Liên kết Zalo" 
4. Chọn follower từ danh sách
5. Hệ thống tự động cập nhật `zaloUserId`

### Cách 2: Cập nhật thủ công qua API
```typescript
POST /api/students/{studentId}/zalo
{
  "zaloUserId": "1234567890"
}
```

### Cách 3: Bulk update qua Excel
Sử dụng component `BulkUpdateDialog` để import nhiều học sinh cùng lúc.

## Database Schema Reference

```sql
-- users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  zalo_user_id VARCHAR(255),  -- ← Lưu Zalo User ID
  -- ... other fields
);
```

## Kiểm tra trạng thái liên kết Zalo

Để kiểm tra học sinh nào đã/chưa liên kết Zalo:

```sql
-- Học sinh đã liên kết Zalo
SELECT id, name, email, zaloUserId 
FROM users 
WHERE role = 'student' AND zaloUserId IS NOT NULL;

-- Học sinh chưa liên kết Zalo
SELECT id, name, email 
FROM users 
WHERE role = 'student' AND zaloUserId IS NULL;
```

## Troubleshooting

### Vấn đề 1: Nút "Zalo" không hiển thị
**Nguyên nhân:** API không trả về `zaloUserId`
**Giải pháp:** 
- Kiểm tra `lib/actions/classes.ts` đã thêm `zaloUserId` vào query
- Restart dev server: `npm run dev`

### Vấn đề 2: Click vào nút không mở Zalo
**Nguyên nhân:** Browser block popup
**Giải pháp:**
- Cho phép popup từ localhost trong browser settings
- Hoặc sử dụng `window.location.href` thay vì `window.open`

### Vấn đề 3: Zalo link không hoạt động
**Nguyên nhân:** `zaloUserId` không đúng format
**Giải pháp:**
- Kiểm tra `zaloUserId` trong database
- Đảm bảo là numeric string (ví dụ: "1234567890")
- Không có khoảng trắng hoặc ký tự đặc biệt

### Vấn đề 4: Toast "Chưa liên kết" hiển thị sai
**Nguyên nhân:** `zaloUserId` là null/undefined trong database
**Giải pháp:**
- Liên kết Zalo ID cho học sinh qua Zalo Follower Dialog
- Hoặc cập nhật trực tiếp trong database

## Best Practices

1. **Validation:** Luôn kiểm tra `zaloUserId` trước khi tạo link
2. **Error Handling:** Hiển thị toast message khi có lỗi
3. **User Feedback:** Sử dụng variant button khác nhau cho trạng thái linked/unlinked
4. **Accessibility:** Disable button khi chưa có Zalo ID
5. **Mobile-first:** Tối ưu UI cho cả desktop và mobile

## Tính năng mở rộng

### 1. Gửi tin nhắn hàng loạt
Thêm checkbox để chọn nhiều học sinh và gửi tin nhắn broadcast:
```typescript
const handleBulkMessage = (selectedStudents: Student[]) => {
  const studentsWithZalo = selectedStudents.filter(s => s.zaloUserId);
  // Call API to send batch messages
};
```

### 2. Hiển thị trạng thái Zalo connection
Thêm badge để hiển thị trạng thái:
```tsx
{student.zaloUserId ? (
  <Badge variant="success">Đã liên kết Zalo</Badge>
) : (
  <Badge variant="secondary">Chưa liên kết</Badge>
)}
```

### 3. QR Code cho quick link
Tạo QR code để scan và chat nhanh:
```typescript
import QRCode from 'qrcode';

const generateZaloQR = async (zaloUserId: string) => {
  const link = `https://zalo.me/${zaloUserId}`;
  return await QRCode.toDataURL(link);
};
```

## Kết luận

Tính năng này giúp quản lý viên/giáo viên có thể liên hệ trực tiếp với học sinh qua Zalo OA một cách nhanh chóng và tiện lợi ngay từ trang danh sách học sinh. Tích hợp seamless với hệ thống quản lý học sinh hiện tại và không yêu cầu thay đổi phức tạp về database schema.
