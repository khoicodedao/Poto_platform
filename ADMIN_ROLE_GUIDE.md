# Hệ Thống Phân Quyền - Admin & Manager

## 📊 Tổng Quan Các Role

### 1. **Student (Học Sinh)**
- ✅ Xem thông tin lớp học, bài tập, tài liệu
- ✅ Nộp bài tập, xem kết quả cá nhân
- ❌ Không tạo/sửa/xóa nội dung
- ❌ Không xem thông tin học sinh khác

### 2. **Teacher (Giáo Viên)**
- ✅ Quản lý lớp học được gán
- ✅ Tạo/sửa/xóa: buổi học, bài tập, thông báo
- ✅ Điểm danh, nhận xét, báo cáo
- ✅ Xem phân tích lớp học
- ❌ Không tạo lớp học mới
- ❌ Không quản lý tài khoản

### 3. **Admin (Quản Trị Viên)** ⭐
- ✅ **TOÀN QUYỀN** trên hệ thống
- ✅ Tạo/sửa/xóa lớp học
- ✅ Tạo/sửa/xóa tài khoản (giáo viên, học sinh)
- ✅ Gán giáo viên vào lớp
- ✅ Gán học sinh vào lớp
- ✅ Tạo/quản lý buổi học
- ✅ Xem tất cả dữ liệu và báo cáo
- ✅ Quản lý cài đặt hệ thống

---

## 🔐 Logic Phân Quyền

### **Điều Kiện Kiểm Tra**

```typescript
// Kiểm tra có phải Teacher hoặc Admin
const isTeacherOrAdmin = userRole && userRole !== "student";

// Kiểm tra chỉ Admin
const isAdmin = userRole === "admin";

// Kiểm tra Teacher (không phải admin)
const isTeacherOnly = userRole === "teacher";
```

### **Áp Dụng Trong Components**

```tsx
// Ẩn với student, hiện với teacher và admin
{userRole && userRole !== "student" && (
  <Button>Quản lý</Button>
)}

// Chỉ admin mới thấy
{userRole === "admin" && (
  <Button>Tạo Lớp Học</Button>
)}

// Teacher và admin
{(userRole === "teacher" || userRole === "admin") && (
  <Button>Chỉnh sửa</Button>
)}
```

---

## 🎯 Chức Năng Theo Role

### **Dashboard**
| Chức năng | Student | Teacher | Admin |
|-----------|---------|---------|-------|
| Xem dashboard cá nhân | ✅ | ✅ | ✅ |
| Xem danh sách lớp | ✅ | ✅ | ✅ |
| **Tạo lớp mới** | ❌ | ❌ | ✅ |
| Xem thống kê tổng quan | ❌ | Lớp của mình | ✅ Toàn bộ |

### **Lớp Học**
| Chức năng | Student | Teacher | Admin |
|-----------|---------|---------|-------|
| Xem thông tin lớp | ✅ | ✅ | ✅ |
| Sửa thông tin lớp | ❌ | Lớp của mình | ✅ |
| Xóa lớp | ❌ | ❌ | ✅ |
| **Gán giáo viên** | ❌ | ❌ | ✅ |
| **Gán học sinh** | ❌ | Lớp của mình | ✅ |

### **Buổi Học**
| Chức năng | Student | Teacher | Admin |
|-----------|---------|---------|-------|
| Xem danh sách | ✅ | ✅ | ✅ |
| Tạo buổi học | ❌ | ✅ | ✅ |
| Sửa buổi học | ❌ | ✅ | ✅ |
| Xóa buổi học | ❌ | ✅ | ✅ |
| Điểm danh | ❌ | ✅ | ✅ |

### **Bài Tập**
| Chức năng | Student | Teacher | Admin |
|-----------|---------|---------|-------|
| Xem bài tập | ✅ | ✅ | ✅ |
| Nộp bài | ✅ | ❌ | ❌ |
| Tạo bài tập | ❌ | ✅ | ✅ |
| Chấm bài | ❌ | ✅ | ✅ |

### **Người Dùng**
| Chức năng | Student | Teacher | Admin |
|-----------|---------|---------|-------|
| Xem hồ sơ cá nhân | ✅ | ✅ | ✅ |
| Sửa hồ sơ cá nhân | ✅ | ✅ | ✅ |
| **Tạo tài khoản** | ❌ | ❌ | ✅ |
| **Sửa tài khoản khác** | ❌ | ❌ | ✅ |
| **Xóa tài khoản** | ❌ | ❌ | ✅ |
| **Xem danh sách user** | ❌ | ❌ | ✅ |

---

## 📝 Cập Nhật Code

### **1. Navigation Tabs** (`components/class-nav-tabs.tsx`)

**Hiện tại:** Teacher và Admin đều thấy đầy đủ tabs
```typescript
const isTeacher = userRole && userRole !== "student";
const visibleNavItems = classNavItems.filter(
  (item) => !item.teacherOnly || isTeacher
);
```

✅ **Đã đúng** - Admin cũng được coi là "teacher" nên có full access

### **2. Top Navigation** (`components/top-nav.tsx`)

**Hiện tại:**
```tsx
{inClassPage && user && user.role !== "student" && (
  <DropdownMenu>Chức năng lớp</DropdownMenu>
)}
```

✅ **Đã đúng** - Admin sẽ thấy dropdown

### **3. Sessions Page**

**Hiện tại:** 
```typescript
const isTeacher = userRole && userRole !== "student";
```

✅ **Đã đúng** - Admin có thể tạo/sửa/xóa sessions

### **4. Assignments Page**

**Hiện tại:**
```typescript
const isTeacher = userRole && userRole !== "student";
```

✅ **Đã đúng** - Admin có full access

---

## 🆕 Chức Năng Cần Thêm Cho Admin

### **1. Trang Quản Lý Người Dùng** (Mới)
**Route:** `/admin/users`

**Chức năng:**
- Danh sách tất cả user (students, teachers, admins)
- Tạo tài khoản mới
- Sửa thông tin user
- Xóa user
- Phân quyền (chuyển role)

### **2. Trang Quản Lý Lớp Học** (Cập nhật)
**Route:** `/admin/classes`

**Chức năng mới:**
- Tạo lớp học
- Gán giáo viên cho lớp
- Xóa lớp học
- Xem thống kê tất cả lớp

### **3. Gán Học Sinh Vào Lớp** (Mới)
**Route:** `/admin/classes/{id}/enroll`

**Chức năng:**
- Danh sách học sinh chưa vào lớp
- Thêm/xóa học sinh khỏi lớp
- Import học sinh hàng loạt (CSV)

### **4. Dashboard Admin** (Mới)
**Route:** `/admin/dashboard`

**Hiển thị:**
- Tổng số user (students/teachers/admins)
- Tổng số lớp học
- Tổng số buổi học
- Biểu đồ thống kê hoạt động
- Học sinh có vấn đề (toàn hệ thống)

---

## 💾 Database Schema

### **User Roles** (Đã có sẵn)
```typescript
export const userRoleEnum = pgEnum("user_role", [
  "student",   // Học sinh
  "teacher",   // Giáo viên
  "admin",     // Quản trị viên
]);
```

### **Test Accounts**

```typescript
// Admin account
{
  email: "admin@example.com",
  password: "password123",
  name: "Admin",
  role: "admin"
}

// Teacher account
{
  email: "teacher1@example.com",
  password: "password123",
  name: "Cô Lan",
  role: "teacher"
}

// Student account
{
  email: "student1@example.com",
  password: "password123",
  name: "Minh",
  role: "student"
}
```

---

## 🚀 Roadmap Implementation

### **Phase 1: Hoàn thiện phân quyền hiện tại** ✅
- [x] Navigation tabs
- [x] Sessions management
- [x] Assignments management
- [x] Notifications
- [x] Session details

### **Phase 2: Admin Dashboard & User Management** (Tiếp theo)
- [ ] Tạo page `/admin/dashboard`
- [ ] Tạo page `/admin/users` (CRUD users)
- [ ] Tạo page `/admin/classes` (CRUD classes)
- [ ] API endpoints cho admin

### **Phase 3: Advanced Features**
- [ ] Gán giáo viên vào lớp
- [ ] Gán học sinh vào lớp (bulk)
- [ ] Import/Export CSV
- [ ] Audit logs (lịch sử thay đổi)
- [ ] Role permissions matrix

---

## 📌 Best Practices

### **1. Luôn check role ở cả client và server**
```typescript
// Client-side (UI)
{userRole === "admin" && <AdminPanel />}

// Server-side (API)
const session = await getCurrentSession();
if (session.user.role !== "admin") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

### **2. Sử dụng helper functions**
```typescript
// lib/auth-helpers.ts
export function isAdmin(role: string) {
  return role === "admin";
}

export function canManageClass(role: string) {
  return role === "admin" || role === "teacher";
}

export function canViewAnalytics(role: string) {
  return role !== "student";
}
```

### **3. Middleware cho protected routes**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = getSession(request);
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session?.user?.role !== 'admin') {
      return NextResponse.redirect('/');
    }
  }
}
```

---

## 🎯 Kết Luận

### **Hiện tại:**
✅ Admin đã có **full access** vào tất cả chức năng của teacher
✅ Phân quyền UI hoạt động đúng (student bị giới hạn)
✅ Database schema hỗ trợ đầy đủ 3 roles

### **Cần làm thêm:**
🔨 Tạo trang admin dashboard
🔨 Trang quản lý users (CRUD)
🔨 Trang quản lý classes cho admin
🔨 Chức năng gán teacher/student vào lớp

**Ngày tạo:** 2025-12-25
**Phiên bản:** 2.0
**Trạng thái:** ✅ Phân quyền cơ bản hoàn thành, Admin features đang phát triển
