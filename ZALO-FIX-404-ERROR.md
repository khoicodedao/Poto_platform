# 🔧 Fix Zalo API Connection Issues

## ❌ Vấn đề bạn gặp phải

Lỗi: **Error 404 - "You currently access to an empty api"**

Điều này có nghĩa là:
- Token bạn đang dùng là **Social API token** (không dùng cho OA)
- Hoặc token chưa được cấp đủ quyền
- Hoặc đang dùng sai loại token

---

## ✅ Giải pháp đã áp dụng

Tôi vừa **cập nhật code** để dùng đúng **OA API v2.0** thay vì Social API:

### Thay đổi:
- ❌ Cũ: `graph.zalo.me/v3.0/me/message` (Social API)
- ✅ Mới: `openapi.zalo.me/v2.0/oa/message` (OA API)

---

## 🔑 Kiểm tra và Lấy lại Token đúng

### Bước 1: Xác nhận loại token

Bạn cần **OA Access Token**, KHÔNG phải Social API Token.

**Cách kiểm tra:**

1. Vào https://developers.zalo.me/
2. Chọn App của bạn
3. Menu bên trái → **"Official Account"**
4. Kiểm tra xem OA đã liên kết chưa

### Bước 2: Lấy OA Access Token đúng

**Option 1: Dùng Tools (RECOMMENDED)**

1. Trong App Dashboard
2. Menu → **"Tools & Resources"** hoặc **"Tools"**
3. Tìm **"Get Test Access Token"** hoặc **"Access Token"**
4. **QUAN TRỌNG**: Chọn **"OA Access Token"** (KHÔNG phải User Access Token)
5. Chọn OA của bạn: `194643797257239355`
6. Click **"Generate"** hoặc **"Get Token"**
7. Copy token mới

**Option 2: Qua OAuth (Advanced)**

```
1. Setup callback URL (đã có sẵn)
2. Click authorization link
3. Grant permissions
4. Get token từ callback
```

---

## 🎯 Cập nhật Token mới

### File `.env.local`

Thay token cũ bằng token mới:

```env
# CŨ - có thể là Social API token
ZALO_ACCESS_TOKEN=dcx758eEQaMQQCSNZWraGvblmHs95HSEt...

# MỚI - phải là OA Access Token  
ZALO_ACCESS_TOKEN=<paste_oa_access_token_here>
```

### Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## ✅ Kiểm tra quyền Token

Token cần có các quyền sau (Permissions):

### Quyền bắt buộc:
- ✅ **Send messages** - Gửi tin nhắn
- ✅ **Get follower list** - Lấy danh sách followers
- ✅ **Get user profile** - Lấy thông tin user
- ✅ **OA information** - Thông tin OA

### Cách kiểm tra/cấp quyền:

1. Vào App Dashboard
2. Menu → **"Official Account"** 
3. Click OA đã liên kết
4. Xem phần **"Permissions"** hoặc **"Quyền"**
5. Nếu thiếu, click **"Request more permissions"**
6. Tick chọn tất cả quyền cần thiết
7. Submit → Admin OA phê duyệt

---

## 🧪 Test lại

Sau khi cập nhật token mới:

### 1. Test Connection

```
http://localhost:3000/zalo-demo
```

Scroll xuống → Click **"Test Connection"**

**Kết quả mong đợi:**
```json
{
  "success": true,
  "data": {
    "oa_id": "194643797257239355",
    "name": "Tên OA của bạn",
    "description": "...",
    ...
  }
}
```

### 2. Kiểm tra Logs

Xem terminal/console:

✅ **Thành công:**
```
[Zalo] Connection successful: {
  error: 0,
  message: 'Success',
  data: { oa_id: '...', name: '...' }
}
```

❌ **Thất bại:**
```
[Zalo] Connection failed: {
  error: 124,
  message: 'Invalid access token'
}
```

---

## 🔍 Troubleshooting nâng cao

### Lỗi: "Invalid access token"
→ Token sai hoặc hết hạn
→ Lấy token mới

### Lỗi: "Permission denied"  
→ Token chưa có quyền OA
→ Kiểm tra permissions

### Lỗi: "OA not found"
→ OA chưa liên kết với App
→ Link OA với App lại

### Lỗi: Still 404
→ Đảm bảo đang dùng **OA Access Token**, không phải:
  - User Access Token
  - Social API Token
  - App Access Token

---

## 📋 Checklist kiểm tra

- [ ] App đã liên kết với OA ✅
- [ ] Token là **OA Access Token** (không phải Social API)
- [ ] Token có đủ permissions (Send messages, Get followers, etc.)
- [ ] File `.env.local` đã cập nhật token mới
- [ ] Server đã restart
- [ ] Test connection thành công (error: 0)

---

## 🔗 API Endpoints đang dùng (sau khi fix)

```typescript
// Test connection
GET https://openapi.zalo.me/v2.0/oa/getoa
Headers: { access_token: <token> }

// Send message
POST https://openapi.zalo.me/v2.0/oa/message
Headers: { access_token: <token> }
Body: { recipient: { user_id: "..." }, message: { text: "..." } }

// Get followers
GET https://openapi.zalo.me/v2.0/oa/getfollowers
Headers: { access_token: <token> }

// Get user profile
GET https://openapi.zalo.me/v2.0/oa/getprofile
Headers: { access_token: <token> }
```

---

## 💡 Lưu ý quan trọng

### FREE OA Token:
- Có hạn ~90 ngày
- Cần lấy lại định kỳ
- Không auto-refresh

### Premium OA Token:
- Có thể setup OAuth auto-refresh
- Hạn dài hơn
- Nhiều quyền hơn

---

## 🆘 Nếu vẫn lỗi

Hãy:
1. Screenshot màn hình Developer Console (phần Permissions)
2. Copy **chính xác** error message
3. Kiểm tra xem token có bắt đầu bằng gì (vd: `dcx...` hay `eyJ...`)
4. Cho tôi biết bạn lấy token từ tab nào trong Developer Console

---

**Sau khi fix xong, hãy test lại và cho tôi biết kết quả!** 🚀
