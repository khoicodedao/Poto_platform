# 🎓 Kết Thúc Buổi Học - Auto Remove Guest Teacher

## 🎯 Yêu Cầu

Khi buổi học kết thúc, hệ thống cần:
1. Đánh dấu `status = "completed"`
2. Xóa giáo viên phụ (`guestTeacherId = null`)
3. Giáo viên chính vẫn là owner của lớp

---

## ✅ ĐÃ CÓ

### **1. Admin Tạo Lớp** ✅
- Form admin có dropdown chọn giáo viên chính
- Teacher được gán vào `classes.teacherId`
- Teacher này là owner vĩnh viễn của lớp

### **2. Tạo/Sửa Buổi Học** ✅
- Form có dropdown "Giáo Viên Thay Thế"
- Có thể chọn guest teacher hoặc "Không có"
- Submit với `guestTeacherId`

---

## ⏳ CẦN LÀM

### **Feature: Nút "Kết Thúc Buổi Học"**

#### **A. UI - Session Detail Page**

**File:** `app/classes/[id]/sessions/[sessionId]/page.tsx`

**Location:** Thêm button ở header hoặc action area

**Code mẫu:**
```tsx
{/* Only show if session is not completed yet */}
{session.status !== 'completed' && (
  <Button 
    onClick={handleCompleteSession}
    variant="default"
    className="bg-green-600 hover:bg-green-700"
  >
    <CheckCircle className="w-4 h-4 mr-2" />
    Kết Thúc Buổi Học
  </Button>
)}

{/* Show completed status */}
{session.status === 'completed' && (
  <Badge className="bg-green-500">
    ✓ Đã Kết Thúc
  </Badge>
)}
```

**Handler function:**
```tsx
const handleCompleteSession = async () => {
  try {
    const res = await fetch(`/api/class-sessions/${sessionId}/complete`, {
      method: 'POST',
    });
    
    if (!res.ok) throw new Error('Failed to complete session');
    
    toast({
      title: "Thành công",
      description: "Buổi học đã được đánh dấu hoàn thành",
    });
    
    router.refresh();
  } catch (error) {
    toast({
      title: "Lỗi",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

#### **B. API Endpoint**

**File to create:** `app/api/class-sessions/[id]/complete/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/db";
import { classSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST /api/class-sessions/[id]/complete
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = parseInt(params.id);

    // Get session to check permissions
    const [existingSession] = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.id, sessionId))
      .limit(1);

    if (!existingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check permission: must be admin or teacher of the class
    // (Add class check here if needed)

    // Mark as completed and remove guest teacher
    await db
      .update(classSessions)
      .set({
        status: "completed",
        guestTeacherId: null, // Remove guest teacher assignment
        updatedAt: new Date(),
      })
      .where(eq(classSessions.id, sessionId));

    return NextResponse.json({
      message: "Session completed successfully",
      guestTeacherRemoved: existingSession.guestTeacherId !== null,
    });
  } catch (error) {
    console.error("[Complete Session] Error:", error);
    return NextResponse.json(
      { error: "Failed to complete session" },
      { status: 500 }
    );
  }
}
```

---

## 🎨 UI Design

### **Button Placement Options:**

#### **Option 1: Header Actions**
```
┌─────────────────────────────────────────┐
│ Buổi Học #5 - Luyện đọc cơ bản         │
│ [Sửa] [Xóa] [Kết Thúc Buổi Học]  ← NEW │
└─────────────────────────────────────────┘
```

#### **Option 2: Status Card**
```
┌─────────────────────────────────────┐
│ 📊 Trạng Thái Buổi Học              │
│ ────────────────────────────────── │
│ Status: Đã lên lịch                 │
│ GV Chính: Cô Lan                    │
│ GV Thay: Thầy Nam ← Will be removed│
│                                     │
│ [Kết Thúc Buổi Học]  ← Button here │
└─────────────────────────────────────┘
```

#### **Option 3: Floating Action**
```
Fixed position bottom-right:
  [Kết Thúc Buổi Học] (Green, with icon)
```

---

## 🔄 Workflow

### **Before Completion:**
```
Session {
  status: "scheduled" or "in-progress"
  guestTeacherId: 5 (Thầy Nam)
}

Class {
  teacherId: 3 (Cô Lan) ← Main teacher, unchanged
}
```

### **After Click "Kết Thúc":**
```
Session {
  status: "completed" ✓
  guestTeacherId: null ✓ (removed)
}

Class {
  teacherId: 3 (Cô Lan) ✓ (still owner)
}
```

### **Effects:**
- ✅ Session marked as completed
- ✅ Guest teacher (Thầy Nam) no longer has access
- ✅ Main teacher (Cô Lan) still owns the class
- ✅ Guest teacher can't edit/view this session anymore
- ✅ Main teacher can still view/edit as usual

---

## 🧪 Test Scenarios

### **Test 1: Complete Session with Guest Teacher**
```
1. Create session with guestTeacherId = 5
2. Login as main teacher or admin
3. Go to session detail
4. Click "Kết Thúc Buổi Học"
✅ Status → "completed"
✅ guestTeacherId → null
✅ Success toast shown
```

### **Test 2: Guest Teacher Access After Completion**
```
1. Complete session (as above)
2. Logout
3. Login as guest teacher (Thầy Nam)
4. Try to access session
✅ Should get "Access Denied" or not see session
```

### **Test 3: Main Teacher Still Has Access**
```
1. Complete session
2. Login as main teacher (Cô Lan)
3. Access session
✅ Can still view
✅ Can still edit if needed
✅ See "Đã Kết Thúc" badge
```

### **Test 4: Complete Session Without Guest**
```
1. Create session without guest teacher
2. Click "Kết Thúc"
✅ Status → "completed"
✅ guestTeacherId → already null, no change
```

---

## 🎯 Permissions Matrix

| Role | Before Completion | After Completion |
|------|------------------|------------------|
| **Main Teacher** | ✅ Full access | ✅ Full access |
| **Guest Teacher** | ✅ Can teach | ❌ No access |
| **Admin** | ✅ Full access | ✅ Full access |
| **Student** | ✅ View only | ✅ View only |

---

## 💡 Additional Features (Optional)

### **Auto-Complete:**
```typescript
// When session scheduledAt + duration has passed
if (now > session.scheduledAt + session.durationMinutes) {
  // Auto mark as completed
  // Auto remove guestTeacherId
}
```

### **Confirm Dialog:**
```tsx
<AlertDialog>
  <AlertDialogTitle>Kết thúc buổi học?</AlertDialogTitle>
  <AlertDialogDescription>
    Giáo viên thay thế sẽ bị xóa khỏi buổi học này.
    Hành động này không thể hoàn tác.
  </AlertDialogDescription>
  <AlertDialogAction onClick={handleComplete}>
    Kết Thúc
  </AlertDialogAction>
</AlertDialog>
```

### **Session History:**
```typescript
// Log guest teacher before removal
sessionHistory {
  sessionId,
  action: "completed",
  guestTeacherRemoved: "Thầy Nam",
  completedAt: timestamp,
  completedBy: userId
}
```

---

## 📋 Implementation Steps

### **Step 1: Create API Endpoint** (5 min)
```bash
# Create file
touch app/api/class-sessions/[id]/complete/route.ts

# Add POST handler
# - Check permissions
# - Update status = "completed"
# - Set guestTeacherId = null
```

### **Step 2: Add Button to UI** (10 min)
```tsx
// In session detail page
// Add "Kết Thúc Buổi Học" button
// Add handleCompleteSession function
// Add confirm dialog (optional)
```

### **Step 3: Test** (5 min)
```
- Complete session with guest
- Verify guest removed
- Verify main teacher unchanged
```

**Total: ~20 minutes**

---

## 🔧 Code Files to Edit

### **1. Create New File:**
```
app/api/class-sessions/[id]/complete/route.ts
```

### **2. Edit Existing:**
```
app/classes/[id]/sessions/[sessionId]/page.tsx
  - Add button
  - Add handler
  - Import CheckCircle icon
```

### **3. Optional:**
```
app/classes/[id]/sessions/[sessionId]/page.tsx
  - Add AlertDialog for confirmation
  - Add session history logging
```

---

## ✅ Checklist

- [ ] Create `/api/class-sessions/[id]/complete` endpoint
- [ ] Add POST handler to mark completed + remove guest
- [ ] Add "Kết Thúc Buổi Học" button to session detail
- [ ] Add handleCompleteSession function
- [ ] Test with guest teacher assigned
- [ ] Test without guest teacher
- [ ] Verify permissions work correctly
- [ ] Add confirm dialog (optional)
- [ ] Add session history (optional)

---

## 🎯 Summary

**What happens when "Kết Thúc Buổi Học" is clicked:**

1. ✅ Session status → "completed"
2. ✅ Guest teacher assignment removed (guestTeacherId = null)
3. ✅ Main teacher (class owner) unchanged
4. ✅ Guest teacher loses access to this session
5. ✅ Main teacher keeps full access
6. ✅ UI shows "Đã Kết Thúc" badge

**Key Points:**
- Guest teacher is ONLY for this specific session
- Main teacher is permanent owner of the class
- Completing session cleans up temporary guest assignment
- Main teacher can always manage the class

---

**Created:** 2025-12-25
**Status:** 📝 Documentation Complete
**Implementation:** Ready to code (~20 mins)
