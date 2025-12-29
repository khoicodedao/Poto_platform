# 📥📤 Export & Bulk Update Zalo IDs - Usage Guide

## 🎯 Tổng quan

Bạn vừa có 2 tính năng mới để quản lý Zalo IDs cho students:

1. **📥 Export Followers to Excel** - Xuất danh sách ra file Excel
2. **📤 Bulk Update Zalo IDs** - Nhập hàng loạt từ file Excel

---

## ✅ Installation

Package `xlsx` đã được cài đặt. Kiểm tra:

```bash
npm list xlsx
```

Nếu chưa có:

```bash
npm install xlsx
```

---

## 📥 Feature 1: Export Danh sách Followers

### Mô tả
Export danh sách học viên với thông tin:
- Tên, Email
- Lớp học
- Zalo User ID
- Trạng thái kết nối
- Trạng thái follow OA

### Cách sử dụng

#### Option 1: Từ Demo Page

1. Vào: `http://localhost:3000/zalo-demo`
2. Scroll xuống phần **"Tính năng cho Admin"**
3. Tìm card **"📥 Export Danh sách"**
4. Chọn lớp (hoặc "Tất cả các lớp")
5. Click **"Export Excel"**
6. File sẽ tự động download

#### Option 2: Tích hợp vào page khác

```tsx
import { ExportFollowersButton } from "@/components/zalo";

// In your component
<ExportFollowersButton 
  classes={classes}
  showClassSelector={true}
/>
```

### File Excel xuất ra

**Columns:**
- Tên học viên
- Email
- Lớp
- Zalo User ID
- Đã kết nối Zalo (Có/Chưa)
- Đã follow OA (✓ Có / ✗ Chưa / N/A)
- Trạng thái (text mô tả)

**Summary row:**
- Tổng học viên
- Đã kết nối
- Đã follow
- Tổng followers OA
- Timestamp

---

## 📤 Feature 2: Bulk Update Zalo IDs

### Mô tả
Upload file Excel/CSV để cập nhật Zalo IDs cho nhiều students cùng lúc.

### Cách sử dụng

#### Bước 1: Download Template

1. Vào: `http://localhost:3000/zalo-demo`
2. Card **"📤 Bulk Update"**
3. Click **"Bulk Update Zalo IDs"**
4. Click link **"Download CSV Template"**

Template format:
```csv
email,zaloUserId
student1@example.com,1234567890
student2@example.com,0987654321
```

#### Bước 2: Điền thông tin

Mở file template và điền:
- **email**: Email học viên (phải trùng với email trong database)
- **zaloUserId**: Zalo User ID của học viên

**Ví dụ:**
```csv
email,zaloUserId
john@student.com,1234567890123456789
mary@student.com,9876543210987654321
peter@student.com,5555555555555555555
```

#### Bước 3: Upload file

1. Save file Excel/CSV
2. Click **"Chọn file Excel/CSV"**
3. Chọn file vừa save
4. Click **"Upload & Cập nhật"**

#### Bước 4: Xem kết quả

Dialog sẽ hiển thị:
- **Thành công**: Số lượng update thành công
- **Thất bại**: Số lượng thất bại (email không tồn tại, v.v.)
- **Bỏ qua**: Số lượng row thiếu data

**Chi tiết từng dòng:**
- ✅ Email - Zalo ID (nếu thành công)
- ❌ Email - Lý do lỗi (nếu thất bại)

---

## 🔄 Workflow đầy đủ

### Scenario: Setup Zalo cho toàn bộ students

1. **Export danh sách hiện tại**
   - Click Export Excel
   - Mở file, xem ai chưa có Zalo ID

2. **Thu thập Zalo IDs**
   - Gửi link OA cho students
   - Students follow OA
   - Students nhắn "ID" cho OA
   - OA trả về Zalo User ID
   - Thu thập IDs vào Excel

3. **Bulk update**
   - Format Excel:  email, zaloUserId
   - Upload file
   - Xem kết quả

4. **Verify**
   - Export lại để kiểm tra
   - Hoặc dùng "Kiểm tra Học viên đã Follow"

---

## 📊 API Endpoints

### GET /api/zalo/export-followers

**Query params:**
- `classId`:  ID của lớp (optional)
- `all=true`: Export tất cả classes

**Response:**
- File Excel download

**Example:**
```
GET /api/zalo/export-followers?classId=1
GET /api/zalo/export-followers?all=true
```

### POST /api/zalo/bulk-update-ids

**Body:** FormData with Excel file

**Excel format:**
```
email | zaloUserId
------|-------------
user@email.com | 1234567890
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": 10,
    "success": 8,
    "failed": 1,
    "skipped": 1
  },
  "details": [
    {
      "email": "user@email.com",
      "status": "success",
      "zaloUserId": "1234567890"
    },
    ...
  ]
}
```

---

## 🎨 UI Components

### ExportFollowersButton

```typescript
type Props = {
  classes: ClassOption[];        // Danh sách lớp
  defaultClassId?: number;       // Pre-select lớp
  showClassSelector?: boolean;   // Hiện/ẩn class selector
};
```

**Usage:**
```tsx
<ExportFollowersButton 
  classes={[
    { id: 1, name: "Lớp A" },
    { id: 2, name: "Lớp B" }
  ]}
  defaultClassId={1}
  showClassSelector={true}
/>
```

### BulkUpdateZaloIdsDialog

```typescript
// No props needed
```

**Usage:**
```tsx
<BulkUpdateZaloIdsDialog />
```

---

## ⚠️ Lưu ý quan trọng

### Export:
- ✅ Works với any role: teacher, TA, admin
- ✅ Teacher chỉ export được classes của mình
- ✅ Admin export được tất cả

### Bulk Update:
- ⚠️ **Chỉ admin** mới bulk update được
- ⚠️ Email phải **chính xác 100%** (case-insensitive)
- ⚠️ Zalo ID phải **đúng format** (string)
- ✅ Tự động trim whitespace

### Data validation:
- Email không tồn tại → Skip
- Missing data → Skip
- Invalid format → Failed

---

## 🧪 Testing Guide

### Test Export:

1. Tạo test students trong database
2. Một số có Zalo ID, một số không
3. Export → Verify file Excel
4. Check:
   - Tất cả students có trong file
   - Zalo IDs đúng
   - Status đúng (Connected/Following/Not connected)

### Test Bulk Update:

1. Tạo CSV với test data:
```csv
email,zaloUserId
test1@example.com,111111111
test2@example.com,222222222
invalid@example.com,333333333
```

2. Upload → Check kết quả:
   - test1, test2: Success
   - invalid: Failed (not found)

3. Export lại → Verify Zalo IDs đã update

---

## 🔮 Future Enhancements (Optional)

- [ ] Export với filters (by status, by class type)
- [ ] Bulk update với validation qua Zalo API
- [ ] Auto-match students by name (fuzzy matching)
- [ ] Import students + Zalo IDs (create new users)
- [ ] Export template với existing data
- [ ] Schedule export (daily/weekly)

---

## 🆘 Troubleshooting

### ❌ Export không có data
→ Check database có students không
→ Check permissions (teacher chỉ export được class của mình)

### ❌ Bulk update thất bại hết
→ Check email format đúng không
→ Check emails có trong database không
→ Check role (phải là admin)

### ❌ File download corrupt
→ Check XLSX package installed
→ Try restart server

---

## 📋 Quick Commands

```bash
# Test export API
curl http://localhost:3000/api/zalo/export-followers?classId=1 > test.xlsx

# Install package
npm install xlsx

# Restart server
npm run dev
```

---

**Status:** ✅ READY TO USE!

Hãy test ngay tại: `http://localhost:3000/zalo-demo`
