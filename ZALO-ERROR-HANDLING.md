# 🚨 Zalo Error Handling - Hướng dẫn xử lý lỗi

## ✅ Đã bổ sung Error Handling chi tiết

### Cập nhật:
- ✅ API `/api/zalo/test-send` - Parse error codes
- ✅ Students page - Hiển thị error với giải pháp
- ✅ Toast notifications với duration dài hơn

---

## 📋 Các lỗi thường gặp

### 1. ❌ SEVEN_DAY_RULE

**Error:**
```
Không thể gửi tin. Người dùng chưa tương tác với OA trong 7 ngày qua (7-day rule).
```

**Nguyên nhân:**
- FREE/Standard OA có giới hạn 7-day rule
- Chỉ gửi được tin đến user tương tác trong 7 ngày gần nhất

**Giải pháp:**
```
💡 Nhờ học viên nhắn tin cho OA trước, sau đó thử lại.
```

**Workflow:**
1. Liên hệ học viên
2. Nhờ họ mở Zalo → Nhắn "Hello" cho OA
3. Sau khi họ nhắn → Thử gửi lại
4. ✅ Sẽ gửi được!

---

### 2. ❌ NOT_FOLLOWER

**Error:**
```
Người dùng chưa follow OA hoặc đã unfollow.
```

**Nguyên nhân:**
- User đã unfollow OA
- Hoặc chưa bao giờ follow

**Giải pháp:**
```
💡 Nhờ học viên follow lại OA.
```

**Workflow:**
1. Liên hệ học viên
2. Hướng dẫn họ tìm OA: "Công ty TNHH Poto English Hub"
3. Click "Quan tâm" / "Follow"
4. ✅ Thử gửi lại

---

### 3. ❌ INVALID_TOKEN

**Error:**
```
Access token không hợp lệ hoặc đã hết hạn. Vui lòng refresh token.
```

**Nguyên nhân:**
- Access token hết hạn (thường sau 90 ngày)
- Token bị revoke

**Giải pháp:**
```
💡 Vào /api/zalo/refresh-token để lấy token mới.
```

**Workflow:**
1. Mở browser:
   ```
   http://localhost:3000/api/zalo/refresh-token
   ```
   (hoặc dùng POST request)

2. Copy `accessToken` và `refreshToken` mới

3. Update `.env.local`:
   ```env
   ZALO_ACCESS_TOKEN=<new_token>
   ZALO_REFRESH_TOKEN=<new_refresh_token>
   ```

4. Restart server:
   ```bash
   npm run dev
   ```

5. ✅ Thử gửi lại

---

### 4. ❌ USER_NOT_FOUND

**Error:**
```
Không tìm thấy người dùng với Zalo ID này.
```

**Nguyên nhân:**
- Zalo ID sai
- User đã xóa tài khoản Zalo
- ID không tồn tại

**Giải pháp:**
```
💡 Kiểm tra lại Zalo ID hoặc chọn lại từ danh sách followers.
```

**Workflow:**
1. Click "Chọn Follower" để chọn lại
2. Hoặc nhờ học viên nhắn "ID" cho OA
3. Copy Zalo ID mới từ webhook logs
4. Update lại trong Students page
5. ✅ Thử gửi lại

---

### 5. ❌ RATE_LIMIT

**Error:**
```
Đã vượt quá giới hạn số tin nhắn. Vui lòng thử lại sau.
```

**Nguyên nhân:**
- Gửi quá nhiều tin trong thời gian ngắn
- Zalo API rate limiting

**Giải pháp:**
```
⏰ Đợi 1-5 phút rồi thử lại
```

**Best Practice:**
- Không gửi quá 10 tin/phút
- Dùng batch sending với delay
- Schedule messages thay vì gửi ngay

---

### 6. ❌ QUOTA_EXCEEDED

**Error:**
```
Đã hết quota tin nhắn hôm nay. Vui lòng thử lại vào ngày mai.
```

**Nguyên nhân:**
- FREE OA: ~1000 tin/ngày
- Standard OA: Có giới hạn theo gói

**Giải pháp:**
```
⏰ Đợi đến 00:00 ngày mai
hoặc
💰 Upgrade lên gói cao hơn
```

---

## 🎨 UI Error Display

### Toast Notification:

```
┌─────────────────────────────────────────┐
│ ❌ Gửi tin nhắn thất bại           ×   │
├─────────────────────────────────────────┤
│ Không thể gửi tin. Người dùng chưa      │
│ tương tác với OA trong 7 ngày qua       │
│ (7-day rule).                           │
│                                         │
│ 💡 Giải pháp: Nhờ học viên nhắn tin    │
│ cho OA trước, sau đó thử lại.          │
└─────────────────────────────────────────┘
```

**Features:**
- ✅ Error title rõ ràng
- ✅ Mô tả chi tiết
- ✅ Giải pháp cụ thể
- ✅ Duration 10s (dài hơn success toast)
- ✅ Variant "destructive" (màu đỏ)

---

## 🔧 Technical Details

### Error Response Format:

```json
{
  "success": false,
  "error": "Không thể gửi tin. Người dùng chưa tương tác...",
  "errorCode": "SEVEN_DAY_RULE",
  "technicalError": "Zalo API error: -213..."
}
```

### Error Codes:

| Code | Meaning | User-facing |
|------|---------|-------------|
| `SEVEN_DAY_RULE` | 7-day interaction rule | ✅ Yes |
| `NOT_FOLLOWER` | User not following OA | ✅ Yes |
| `INVALID_TOKEN` | Token expired/invalid | ✅ Yes |
| `USER_NOT_FOUND` | Invalid Zalo ID | ✅ Yes |
| `RATE_LIMIT` | Too many requests | ✅ Yes |
| `QUOTA_EXCEEDED` | Daily quota reached | ✅ Yes |
| `UNKNOWN` | Other errors | ✅ Yes |

---

## 📊 Error Handling Flow

```
User clicks "Gửi tin"
   ↓
API call to /api/zalo/test-send
   ↓
Try sendZaloMessage()
   ↓
   ├─ Success → ✅ Toast: "Gửi thành công"
   │
   └─ Error → Parse error
              ↓
              Check error code
              ↓
              ├─ SEVEN_DAY_RULE → Show solution
              ├─ NOT_FOLLOWER → Show solution
              ├─ INVALID_TOKEN → Show solution
              ├─ USER_NOT_FOUND → Show solution
              ├─ RATE_LIMIT → Show solution
              ├─ QUOTA_EXCEEDED → Show solution
              └─ UNKNOWN → Generic error
              ↓
              ❌ Toast with detailed message + solution
              Duration: 10 seconds
```

---

## 💡 Best Practices

### 1. Prevent errors proactively:

**Before sending:**
- ✅ Check if user has Zalo ID
- ✅ Verify user is follower (if possible)
- ✅ Check last interaction date
- ✅ Validate token expiry

### 2. Handle errors gracefully:

**When error occurs:**
- ✅ Show clear error message
- ✅ Provide actionable solution
- ✅ Log technical details for debugging
- ✅ Don't expose internal errors to users

### 3. User education:

**Educate users about:**
- 7-day rule requirement
- Importance of following OA
- How to interact with OA
- When to refresh tokens

---

## 🎯 Testing Errors

### Test 7-day rule:
```
1. Find user không tương tác >7 ngày
2. Try send message
3. Verify error: SEVEN_DAY_RULE
4. Check toast shows solution
```

### Test NOT_FOLLOWER:
```
1. Unfollow OA với test account
2. Try send message
3. Verify error: NOT_FOLLOWER
4. Check toast shows solution
```

### Test INVALID_TOKEN:
```
1. Set invalid token in .env.local
2. Try send message
3. Verify error: INVALID_TOKEN
4. Check toast shows refresh solution
```

---

## ✅ Summary

**Đã bổ sung:**
- ✅ 6 error codes với messages rõ ràng
- ✅ Giải pháp cụ thể cho từng lỗi
- ✅ Toast duration 10s cho errors
- ✅ Technical error logging
- ✅ User-friendly error display

**Benefits:**
- 🎯 Users biết chính xác vấn đề gì
- 🎯 Users biết cách fix
- 🎯 Giảm support requests
- 🎯 Better UX

---

**Hãy test gửi tin nhắn và xem error messages!** 🚀
