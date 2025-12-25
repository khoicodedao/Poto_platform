# ⚠️ MIGRATION REQUIRED BEFORE TESTING

## 🚨 Critical Step

**MUST RUN BEFORE CODE WORKS:**

```bash
npm run db:push
```

Lệnh này sẽ thêm 2 columns cần thiết:
- `class_enrollments.end_date` (TIMESTAMP NULL)
- `class_sessions.guest_teacher_id` (INTEGER NULL)

---

## ❌ Nếu Không Chạy:

**Error sẽ xảy ra:**
```
PostgresError: column "guest_teacher_id" does not exist
```

**Code không thể chạy** vì:
- `getGuestSessionsForTeacher()` query column chưa có
- Session form submit `guestTeacherId` nhưng DB không nhận

---

## ✅ Sau Khi Chạy Migration:

1. **Test Session Form:**
   - Tạo session mới
   - Chọn guest teacher từ dropdown
   - Submit → Lưu được

2. **Test Guest Teacher View:**
   - Login as guest teacher
   - Vào `/classes`
   - Thấy section "Buổi Học Được Mời"

3. **Test End Date:**
   - Enroll student
   - Set end date
   - Verify trong database

---

## 🔍 Verify Migration Worked:

**Check trong database:**
```sql
-- Check class_sessions table
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'class_sessions' 
  AND column_name = 'guest_teacher_id';

-- Check class_enrollments table  
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'class_enrollments' 
  AND column_name = 'end_date';
```

Should return rows if successful.

---

## 📝 Files That Need Migration:

1. `lib/actions/classes.ts` - getGuestSessionsForTeacher()
2. `components/class-session-form.tsx` - Submit guestTeacherId
3. `app/api/admin/classes/[id]/enroll/route.ts` - Uses endDate
4. Any session create/update APIs

---

## ⏭️ Next Step After Migration:

Update `/app/classes/page.tsx` to show guest sessions (already coded function, just need to call it)

---

**STATUS:** 🔴 **BLOCKED until migration runs**
**RUN NOW:** `npm run db:push`
