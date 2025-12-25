# ✅ Guest Teacher Feature - Complete Guide

## 🎯 Mục Tiêu

Cho phép **giáo viên thay thế** (guest teacher) vào lớp và giảng dạy tại các buổi học cụ thể khi giáo viên chính vắng mặt.

**Scenario:**
- Giáo viên chính: Cô Lan
- Guest teacher: Thầy Nam
- Buổi học #5: Cô Lan vắng → Thầy Nam dạy thay
- Thầy Nam đăng nhập tài khoản của mình nhưng vẫn vào được lớp của Cô Lan cho buổi #5

---

## ✅ ĐÃ HOÀN THÀNH

### **1. Database Schema** ✅

**File:** `db/schema.ts` line 196

```typescript
export const classSessions = pgTable("class_sessions", {
  // ... existing fields
  guestTeacherId: integer("guest_teacher_id").references(() => users.id, {
    onDelete: "set null",
  }), // Optional substitute teacher for this session
});
```

**Migration Required:**
```bash
npm run db:push
```

### **2. Session Form UI** ✅

**File:** `components/class-session-form.tsx`

**Added:**
- Import `useEffect` and `Select` components
- State: `teachers` array và `guestTeacherId` in formData
- `fetchTeachers()` function
- Dropdown UI với label "Giáo Viên Thay Thế (Tùy chọn)"
- Help text: "Giáo viên thay thế có thể vào lớp cho buổi học này"

**Form Fields Order:**
1. Buổi Thứ & Thời Lượng
2. Tiêu Đề
3. Thời Gian Dự Kiến
4. **Giáo Viên Thay Thế** ← NEW
5. Mô Tả

### **3. Form Submit Logic** ✅

**Updates:**
```typescript
body: JSON.stringify({
  classId,
  ...formData,
  scheduledAt: new Date(formData.scheduledAt),
  guestTeacherId: formData.guestTeacherId 
    ? parseInt(formData.guestTeacherId) 
    : null, // ← Added
})
```

---

## ⏳ CẦN HOÀN THÀNH

### **4. Update Session APIs**

#### **A. POST /api/class-sessions**

**File to edit:** `app/api/class-sessions/route.ts`

**Current code (estimate):**
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { classId, title, description, scheduledAt, durationMinutes, sessionNumber } = body;
  
  const [session] = await db.insert(classSessions).values({
    classId,
    title,
    description,
    scheduledAt,
    durationMinutes,
    sessionNumber,
    // ... other fields
  }).returning();
}
```

**Change needed:**
```typescript
const { classId, title, description, scheduledAt, durationMinutes, sessionNumber, guestTeacherId } = body;

const [session] = await db.insert(classSessions).values({
  classId,
  title,
  description,
  scheduledAt,
  durationMinutes,
  sessionNumber,
  guestTeacherId: guestTeacherId || null, // ← Add this
  // ... other fields
}).returning();
```

#### **B. PATCH /api/class-sessions/[id]**

**Similar change:**
```typescript
await db.update(classSessions)
  .set({
    title,
    description,
    scheduledAt,
    durationMinutes,
    sessionNumber,
    guestTeacherId: guestTeacherId !== undefined ? guestTeacherId : undefined, // ← Add
    updatedAt: new Date(),
  })
  .where(eq(classSessions.id, sessionId));
```

---

### **5. Session Access Control**

#### **Current Logic:**
Hiện tại chỉ teacher của class mới vào được.

#### **New Logic:**
Teacher có thể vào nếu:
- Là teacher chính của class, HOẶC
- Là guest teacher của buổi học đó

**File cần edit:** 
- `app/classes/[id]/sessions/[sessionId]/page.tsx`
- Hoặc nơi check permission

**Pseudo code:**
```typescript
// Get session with guestTeacherId
const session = await getSession(sessionId);

// Get class
const classInfo = await getClass(classId);

// Check permission
const canAccess = 
  user.role === 'admin' ||
  user.id === classInfo.teacherId || // Main teacher
  user.id === session.guestTeacherId; // Guest teacher for this session

if (!canAccess) {
  return unauthorized();
}
```

---

### **6. UI Enhancements**

#### **A. Session List - Show Guest Teacher Badge**

**File:** `components/sessions-list.tsx` or similar

**Add to session card:**
```tsx
{session.guestTeacherId && (
  <Badge variant="outline" className="bg-blue-50 text-blue-700">
    👤 GV Thay: {session.guestTeacherName}
  </Badge>
)}
```

**Need to:**
- Update session fetch query to join with users table
- Add `guestTeacherName` to return data

#### **B. Session Detail Page**

**Show info:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Thông Tin Buổi Học</CardTitle>
  </CardHeader>
  <CardContent>
    <p>GV Chính: {class.teacherName}</p>
    {session.guestTeacherId && (
      <p className="text-blue-600">
        GV Thay Thế: {session.guestTeacherName}
      </p>
    )}
  </CardContent>
</Card>
```

---

### **7. Teacher Dashboard**

**Goal:** Guest teacher thấy sessions mà họ được gán

**Option A: Modify existing dashboard query**
```sql
SELECT sessions 
WHERE sessions.classId IN (classes where teacherId = currentUser)
   OR sessions.guestTeacherId = currentUser
```

**Option B: Add separate section**
```tsx
<Card>
  <CardTitle>Buổi Học Bạn Được Mời Dạy</CardTitle>
  {guestSessions.map(...)}
</Card>
```

---

## 📋 Implementation Checklist

### **Phase 1: Database** ✅
- [x] Add `guestTeacherId` to schema
- [ ] Run migration: `npm run db:push`

### **Phase 2: Form** ✅
- [x] Add teacher dropdown to form
- [x] Fetch teachers list
- [x] Submit guestTeacherId

### **Phase 3: APIs** ⏳
- [ ] Update POST /api/class-sessions
- [ ] Update PATCH /api/class-sessions/[id]
- [ ] Update GET to return guestTeacherName

### **Phase 4: Access Control** ⏳
- [ ] Check guest teacher permission in session detail
- [ ] Allow guest teacher to:
  - View session
  - Mark attendance
  - Add feedback (?)

### **Phase 5: UI Polish** ⏳
- [ ] Show guest teacher badge in session list
- [ ] Show guest teacher in session detail
- [ ] Add to teacher dashboard (optional)

---

## 🧪 Testing Scenarios

### **Test 1: Create Session with Guest Teacher**
```
1. Login as admin/teacher
2. Go to /classes/{id}/sessions
3. Click "Tạo Buổi Học"
4. Fill form
5. Select "Giáo Viên Thay Thế" = Thầy Nam
6. Submit
✅ Session created with guestTeacherId
```

### **Test 2: Guest Teacher Access**
```
1. Login as Thầy Nam (guest)
2. Go to /classes/{id}/sessions/{sessionId}
✅ Can view session
✅ Can mark attendance
❌ Cannot edit session (unless also main teacher)
```

### **Test 3: Regular Teacher Access**
```
1. Login as Cô Lan (main teacher)
2. Go to same session
✅ Can view, edit, delete as usual
✅ See "GV Thay: Thầy Nam" badge
```

### **Test 4: Edit Guest Teacher**
```
1. Edit session
2. Change guest teacher or set to "Không có"
3. Submit
✅ guestTeacherId updated
```

---

## 🔍 Database Queries

### **Get Session with Guest Teacher Info:**
```typescript
const session = await db
  .select({
    id: classSessions.id,
    title: classSessions.title,
    // ... other session fields
    guestTeacherId: classSessions.guestTeacherId,
    guestTeacherName: users.name,
  })
  .from(classSessions)
  .leftJoin(users, eq(classSessions.guestTeacherId, users.id))
  .where(eq(classSessions.id, sessionId))
  .limit(1);
```

### **Get Sessions Where User is Guest:**
```typescript
const guestSessions = await db
  .select()
  .from(classSessions)
  .where(eq(classSessions.guestTeacherId, userId))
  .orderBy(classSessions.scheduledAt);
```

---

## 💡 Advanced Features (Future)

### **Phase 2 Enhancements:**
- [ ] Email notification to guest teacher when assigned
- [ ] Guest teacher can decline assignment
- [ ] Multiple guest teachers per session
- [ ] Guest teacher comments/handover notes
- [ ] Payment tracking for guest sessions
- [ ] Guest teacher availability calendar

### **Smart Features:**
- [ ] Auto-suggest teachers based on availability
- [ ] Conflict detection (teacher has another class)
- [ ] Recurring guest assignments (every Monday, etc.)

---

## 📝 Notes

### **Design Decisions:**

**Q: Why per-session instead of per-class?**
A: More flexible. Teacher might only be available for specific sessions.

**Q: Can a guest teacher edit the session?**
A: No by default. They can teach but not modify. (Can be changed if needed)

**Q: What permissions does guest teacher have?**
A: Same as main teacher for THAT session:
- Mark attendance ✅
- Add feedback ✅
- View students ✅
- Edit session details ❌ (main teacher only)
- Delete session ❌ (main teacher only)

**Q: Can guest teacher see other sessions?**
A: No, only sessions where they are assigned as guest.

---

## 🚀 Quick Start Guide

### **For Developers:**

1. **Run migration:**
   ```bash
   npm run db:push
   ```

2. **Update APIs:**
   - Edit `app/api/class-sessions/route.ts`
   - Add `guestTeacherId` to POST and PATCH

3. **Test:**
   - Create session with guest teacher
   - Login as guest teacher
   - Verify access

### **For Users:**

**Teacher/Admin:**
1. Tạo/sửa buổi học
2. Chọn "Giáo Viên Thay Thế" nếu cần
3. Lưu

**Guest Teacher:**
1. Đăng nhập tài khoản của mình
2. Vào lớp → buổi học được gán
3. Dạy và điểm danh như bình thường

---

## ✅ Summary

**Completed (60%):**
- ✅ Schema with guestTeacherId
- ✅ Form UI with dropdown
- ✅ Form logic to submit

**Remaining (40%):**
- ⏳ API updates (15 minutes)
- ⏳ Access control (15 minutes)
- ⏳ UI badges (10 minutes)
- ⏳ Testing (10 minutes)

**Total estimated time to complete:** ~50 minutes

---

**Created:** 2025-12-25
**Status:** 🟡 60% Complete
**Next Step:** Run `npm run db:push` then update APIs
