# 📌 Add Guest Sessions to Dashboard

## ✅ Đã Làm:

1. ✅ Import `getGuestSessionsForTeacher` 
2. ✅ Fetch `guestSessions` trong Promise.all

## 🔧 Cần Thêm Vào UI:

### **Location:** `app/page.tsx` 
### **Insert After:** Line 226 (after `</Card>` of "Lớp học đang giảng dạy")
### **Insert Before:** Line 228 (`<Card>` of "Bài tập nổi bật")

### **Code to Add:**

```tsx
{/* Guest Sessions Card - Only for teachers */}
{user.role === "teacher" && guestSessions.length > 0 && (
  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
          👤 Giáo Viên Khách Mời
        </Badge>
        <CardTitle>Buổi Học Được Mời</CardTitle>
      </div>
      <CardDescription>
        Bạn được mời dạy thay {guestSessions.length} buổi học
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      {guestSessions.slice(0, 3).map((session) => (
        <div
          key={session.sessionId}
          className="flex items-center justify-between rounded-xl border border-blue-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {session.sessionTitle}
            </p>
            <p className="text-sm text-gray-600">
              Lớp: {session.className}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                GV: {session.mainTeacherName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(session.sessionDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
          <Link href={`/classes/${session.classId}/sessions/${session.sessionId}`}>
            <Button size="sm" className="ml-2">
              Xem
            </Button>
          </Link>
        </div>
      ))}
      {guestSessions.length > 3 && (
        <Link href="/classes" className="block">
          <Button variant="outline" className="w-full mt-2">
            Xem tất cả {guestSessions.length} buổi học
          </Button>
        </Link>
      )}
    </CardContent>
  </Card>
)}
```

---

## 📍 Exact Location:

Find this in `app/page.tsx`:

```tsx
            </CardContent>
          </Card>    ← Line 226 (End of "Lớp học" card)

          ← INSERT GUEST SESSIONS CARD HERE

          <Card>     ← Line 228 (Start of "Bài tập" card)
            <CardHeader>
              <CardTitle>Bài tập nổi bật</CardTitle>
```

---

## 🎨 UI Preview:

```
┌────────────────────────────────────────┐
│ Lớp học đang giảng dạy                 │
│ [Class 1] [Class 2] [Class 3]          │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ 👤 Giáo Viên Khách Mời                │
│ Buổi Học Được Mời                      │
│ Bạn được mời dạy thay 2 buổi học       │
├────────────────────────────────────────┤
│ Session: Buổi 5 - Luyện đọc           │
│ Lớp: Tiếng Anh Cơ Bản                 │
│ 👤 GV: Cô Lan  📅 26/12, 14:00       │
│                            [Xem]       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Bài tập nổi bật                        │
│ ...                                    │
└────────────────────────────────────────┘
```

---

## ✅ Features:

- **Gradient blue background** - đáng chú ý
- **Badge** "👤 Giáo Viên Khách Mời"
- **Show top 3** sessions
- **"Xem tất cả"** nếu > 3
- **Link** đến session detail
- **Only visible** to teachers với guest sessions

---

## 🧪 Test:

1. Login as teacher with guest sessions assigned
2. Go to `/` (dashboard)
3. Should see blue gradient card
4. Click "Xem" → Navigate to session detail

---

**Status:** Code ready, cần copy-paste vào đúng vị trí!
