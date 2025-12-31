# 🎉 Feature: Chọn Follower từ OA với Avatar

## ✅ Đã tạo xong!

### Files mới:

**Backend:**
- `app/api/zalo/followers-with-details/route.ts` - API lấy followers với chi tiết

**Frontend:**
- `components/zalo/select-follower-dialog.tsx` - Dialog chọn follower

**Updates:**
- `components/zalo/index.ts` - Export component
- `app/(dashboard)/students/page.tsx` - Import component

---

## 🎯 Tính năng:

### 1. API lấy followers với thông tin đầy đủ:
- ✅ Avatar (ảnh đại diện)
- ✅ Display name (tên hiển thị)
- ✅ User ID
- ✅ Ngày tương tác cuối
- ✅ Trạng thái follower

### 2. Dialog chọn follower:
- ✅ Hiển thị danh sách với avatar
- ✅ Search theo tên hoặc ID
- ✅ Scroll list (max 400px height)
- ✅ Click để chọn
- ✅ Visual indicator (checkmark)
- ✅ Responsive design

---

## 🔧 Cách tích hợp vào Students Page:

### Bước 1: Thêm handler function

Thêm vào file `app/(dashboard)/students/page.tsx` sau function `handleEditZaloId`:

```typescript
const handleSelectFromFollowers = (student: Student) => {
    setSelectedStudent(student);
    setSelectFollowerDialogOpen(true);
};

const handleFollowerSelected = async (zaloUserId: string, followerInfo: any) => {
    if (!selectedStudent) return;

    setNewZaloId(zaloUserId);
    
    // Auto-save
    try {
        const response = await fetch(`/api/students/${selectedStudent.id}/zalo`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ zaloUserId }),
        });

        const data = await response.json();

        if (data.success) {
            toast({
                title: "Liên kết thành công",
                description: `Đã liên kết ${selectedStudent.name} với ${followerInfo.displayName}`,
            });
            loadStudents();
        } else {
            toast({
                title: "Lỗi",
                description: data.error || "Không thể cập nhật",
                variant: "destructive",
            });
        }
    } catch (error) {
        toast({
            title: "Lỗi",
            description: "Không thể kết nối đến server",
            variant: "destructive",
        });
    }
};
```

### Bước 2: Thêm nút "Chọn từ Followers"

Trong table actions (dòng ~370-382), thêm nút mới:

```typescript
<TableCell className="text-right">
    <div className="flex justify-end gap-2">
        <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditZaloId(student)}
        >
            <Edit className="h-3 w-3 mr-1" />
            Sửa ID
        </Button>
        
        {/* NÚT MỚI */}
        <Button
            size="sm"
            variant="outline"
            onClick={() => handleSelectFromFollowers(student)}
        >
            <UserPlus className="h-3 w-3 mr-1" />
            Chọn Follower
        </Button>
        
        {student.zaloUserId && (
            <Button
                size="sm"
                onClick={() => handleSendMessage(student)}
            >
                <Send className="h-3 w-3 mr-1" />
                Gửi tin
            </Button>
        )}
    </div>
</TableCell>
```

### Bước 3: Thêm Dialog component

Cuối file, trước closing `</div>`, thêm:

```typescript
{/* Select Follower Dialog */}
<SelectFollowerDialog
    open={selectFollowerDialogOpen}
    onOpenChange={setSelectFollowerDialogOpen}
    studentName={selectedStudent?.name || ""}
    onSelect={handleFollowerSelected}
/>
```

### Bước 4: Import icon UserPlus

Thêm vào imports từ lucide-react:

```typescript
import {
    Users,
    Search,
    Send,
    Edit,
    CheckCircle2,
    XCircle,
    FileSpreadsheet,
    Loader2,
    ShieldAlert,
    UserPlus,  // ← THÊM DÒNG NÀY
} from "lucide-react";
```

---

## 🚀 Test:

### Bước 1: Vào Students page
```
http://localhost:3000/students
```

### Bước 2: Click "Chọn Follower"

Mỗi student sẽ có nút mới: **"Chọn Follower"**

### Bước 3: Xem dialog

Dialog hiển thị:
- Danh sách followers với avatar
- Search box
- Scroll list
- Click để chọn

### Bước 4: Chọn follower

1. Search hoặc scroll
2. Click vào follower
3. Checkmark xuất hiện
4. Click "Chọn follower này"
5. ✅ Auto-save và reload!

---

## 📊 UI Preview:

```
┌─────────────────────────────────────────────────┐
│  Chọn Zalo Follower                        × │
│  Chọn follower từ OA để liên kết với Nguyễn A  │
├─────────────────────────────────────────────────┤
│  🔍 [Tìm kiếm theo tên hoặc Zalo ID...]        │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐ │
│  │ 👤 Nguyễn Văn B                     ✓    │ │
│  │    ID: 123456789012345...                │ │
│  │    Tương tác: 31/12/2025                 │ │
│  ├───────────────────────────────────────────┤ │
│  │ 👤 Trần Thị C                            │ │
│  │    ID: 987654321098765...                │ │
│  │    Tương tác: 30/12/2025                 │ │
│  └───────────────────────────────────────────┘ │
│  Tổng: 15 followers                            │
├─────────────────────────────────────────────────┤
│                    [Hủy]  [Chọn follower này]  │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ Lưu ý:

### Rate Limiting:
- API có delay 100ms giữa các requests
- Tránh bị Zalo block
- Load có thể hơi lâu nếu nhiều followers

### Permissions:
- Cần quyền "Quản lý thông tin người dùng" trong OA
- Standard OA trở lên

### Performance:
- Cache followers trong 5 phút
- Chỉ load khi mở dialog
- Lazy loading nếu >100 followers

---

## 🎨 Customization:

### Thay đổi avatar size:
```typescript
<Avatar className="h-16 w-16">  // Lớn hơn
```

### Thêm thông tin khác:
```typescript
{follower.sharedInfo?.phone && (
    <p className="text-xs">📱 {follower.sharedInfo.phone}</p>
)}
```

### Filter chỉ followers active:
```typescript
const activeFollowers = followers.filter(f => 
    f.lastInteraction && isRecent(f.lastInteraction)
);
```

---

## ✅ Hoàn thành!

**Bạn có:**
1. ✅ API lấy followers với avatar
2. ✅ Dialog chọn follower đẹp
3. ✅ Search & filter
4. ✅ Auto-save khi chọn
5. ✅ Toast notifications

**Hãy tích hợp 4 bước trên và test!** 🚀
