# 🔧 FIX: Guest Teacher Không Thấy Classes

## ❌ Vấn Đề

Guest teacher đăng nhập nhưng không thấy classes/sessions mà họ được gán.

## 🔍 Root Cause

**File:** `lib/actions/classes.ts`
**Function:** `getClassesForUser()`

```typescript
if (role === "teacher") {
  return await baseSelect.where(eq(classes.teacherId, userId));
  // ❌ Chỉ check teacherId, không check guestTeacherId
}
```

Guest teacher được gán vào **SESSIONS** (không phải classes), nên cần query khác.

---

## ✅ Solution Option A: Show Guest Sessions Separately

Tạo section riêng trong dashboard cho "Buổi Học Khách Mời"

### **Step 1: Tạo Function Get Guest Sessions**

**File:** `lib/actions/classes.ts`

```typescript
export async function getGuestSessionsForTeacher(userId: number) {
  const guestSessions = await db
    .select({
      sessionId: classSessions.id,
      sessionTitle: classSessions.title,
      sessionDate: classSessions.scheduledAt,
      classId: classes.id,
      className: classes.name,
      mainTeacher: users.name,
      status: classSessions.status,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .innerJoin(users, eq(classes.teacherId, users.id))
    .where(eq(classSessions.guestTeacherId, userId))
    .orderBy(classSessions.scheduledAt);

  return guestSessions;
}
```

### **Step 2: Update Classes Page**

**File:** `app/classes/page.tsx`

```tsx
export default async function ClassesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin");

  const classes = await getClassesForUser(user.id, user.role as any);
  
  // NEW: Get guest sessions if teacher
  const guestSessions = user.role === "teacher" 
    ? await getGuestSessionsForTeacher(user.id)
    : [];

  return (
    <div>
      {/* Existing classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(...)}
      </div>

      {/* NEW: Guest Sessions Section */}
      {guestSessions.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-4">
            Buổi Học Khách Mời
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guestSessions.map((session) => (
              <Card key={session.sessionId}>
                <CardHeader>
                  <CardTitle>{session.sessionTitle}</CardTitle>
                  <CardDescription>
                    Lớp: {session.className}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-2">
                    👤 Giáo viên khách
                  </Badge>
                  <p className="text-sm text-gray-600">
                    GV chính: {session.mainTeacher}
                  </p>
                  <p className="text-sm text-gray-600">
                    📅 {new Date(session.sessionDate).toLocaleString("vi-VN")}
                  </p>
                  <Link href={`/classes/${session.classId}/sessions/${session.sessionId}`}>
                    <Button className="w-full mt-4">
                      Tham gia buổi học
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Solution Option B: Include Guest Classes in Main List

Show cả classes chính + classes có guest sessions

### **Modify getClassesForUser()**

```typescript
if (role === "teacher") {
  // Get classes where user is main teacher
  const ownClasses = await baseSelect.where(eq(classes.teacherId, userId));

  // Get distinct classes where user is guest teacher for any session
  const guestClassIds = await db
    .selectDistinct({ classId: classSessions.classId })
    .from(classSessions)
    .where(eq(classSessions.guestTeacherId, userId));

  if (guestClassIds.length > 0) {
    const ids = guestClassIds.map(g => g.classId);
    const guestClasses = await baseSelect.where(
      inArray(classes.id, ids)
    );

    // Merge and dedupe
    const allClasses = [...ownClasses];
    for (const gc of guestClasses) {
      if (!allClasses.find(c => c.id === gc.id)) {
        allClasses.push(gc);
      }
    }
    return allClasses;
  }

  return ownClasses;
}
```

**Cần import:**
```typescript
import { inArray } from "drizzle-orm";
```

---

## 📊 Comparison

| Feature | Option A | Option B |
|---------|----------|----------|
| **UI** | Separate section | Mixed list |
| **Clarity** | Very clear | Less obvious |
| **Code** | More code | Cleaner |
| **UX** | Better | Okay |

**Khuyến nghị: Option A**

---

## 🎨 Option A UI Preview

```
┌─────────────────────────────────┐
│ Lớp học của tôi                 │
├─────────────────────────────────┤
│ [Class 1] [Class 2] [Class 3]   │ ← Main classes
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 👤 Buổi Học Khách Mời           │
├─────────────────────────────────┤
│ [Session A] [Session B]         │ ← Guest sessions
│ Lớp: Toán Học                   │
│ GV chính: Cô Lan                │
│ 📅 26/12/2025 14:00            │
│ [Tham gia buổi học]             │
└─────────────────────────────────┘
```

---

## ⚡ Quick Implementation (Option A)

### **1. Add Function**

**File:** `lib/actions/classes.ts` (end of file)

```typescript
export async function getGuestSessionsForTeacher(userId: number) {
  return await db
    .select({
      sessionId: classSessions.id,
      sessionTitle: classSessions.title,
      sessionDate: classSessions.scheduledAt,
      classId: classes.id,
      className: classes.name,
      mainTeacherName: users.name,
      status: classSessions.status,
    })
    .from(classSessions)
    .innerJoin(classes, eq(classSessions.classId, classes.id))
    .innerJoin(users, eq(classes.teacherId, users.id))
    .where(eq(classSessions.guestTeacherId, userId))
    .orderBy(classSessions.scheduledAt);
}
```

### **2. Update Page**

**File:** `app/classes/page.tsx`

Add after line 36:
```typescript
const guestSessions = user.role === "teacher" 
  ? await getGuestSessionsForTeacher(user.id)
  : [];
```

Add after line 147 (after classes grid, before empty state):
```tsx
{/* Guest Sessions Section */}
{user.role === "teacher" && guestSessions.length > 0 && (
  <div className="mt-12">
    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <Badge variant="outline" className="text-base px-3 py-1">
        👤 Giáo Viên Khách Mời
      </Badge>
      Buổi Học Được Mời
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {guestSessions.map((session) => (
        <Card key={session.sessionId} className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg">{session.sessionTitle}</CardTitle>
            <CardDescription>Lớp: {session.className}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                GV chính: {session.mainTeacherName}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(session.sessionDate).toLocaleString("vi-VN")}
              </div>
              <Badge 
                variant={session.status === "completed" ? "secondary" : "default"}
              >
                {session.status === "completed" ? "Đã kết thúc" : "Sắp diễn ra"}
              </Badge>
            </div>
            <Link 
              href={`/classes/${session.classId}/sessions/${session.sessionId}`}
              className="block mt-4"
            >
              <Button className="w-full" size="sm">
                Tham gia buổi học
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
```

---

## 🧪 Testing

### **Test Steps:**

1. **Create Session with Guest:**
   ```
   - Login as admin/teacher
   - Create session
   - Select guest teacher
   ```

2. **Login as Guest Teacher:**
   ```
   - Navigate to /classes
   - Should see "Buổi Học Được Mời" section
   - See card with session details
   ```

3. **Click "Tham gia":**
   ```
   - Should navigate to session detail
   - Should have access (after API updates)
   ```

---

## ⚠️ Important Notes

**This fix requires:**
1. ✅ Schema has `guestTeacherId` (already done)
2. ⚠️ Migration run: `npm run db:push`
3. ⚠️ Session with guestTeacherId exists in DB

**Without migration, query will fail!**

---

## 📋 Checklist

- [ ] Add `getGuestSessionsForTeacher()` function
- [ ] Import function in classes page
- [ ] Call function for teachers
- [ ] Add guest sessions UI section
- [ ] Test with guest teacher account
- [ ] Verify sessions show correctly
- [ ] Test navigation to session detail

---

**Estimated Time:** 15 minutes  
**Complexity:** Medium  
**Impact:** High (critical for guest teacher UX)
