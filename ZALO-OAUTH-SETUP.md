# 🔗 Hướng dẫn Setup OAuth Callback URL

## Vấn đề hiện tại

Bạn đang thấy yêu cầu thiết lập Callback URL:
```
https://oauth.zaloapp.com/v4/oa/permission?app_id=2284323715851765379&redirect_uri=
```

## 🎯 Giải pháp cho Testing (Local Development)

### Option 1: Dùng ngrok (RECOMMENDED cho OAuth)

**Bước 1: Cài ngrok**
```bash
# Download ngrok từ https://ngrok.com/download
# Hoặc dùng npm
npm install -g ngrok
```

**Bước 2: Tạo tunnel**
```bash
# Start dev server trước
npm run dev

# Ở terminal khác, chạy ngrok
ngrok http 3000
```

**Bước 3: Copy URL từ ngrok**
Bạn sẽ thấy:
```
Forwarding: https://abc123xyz.ngrok.io -> http://localhost:3000
```

**Bước 4: Điền Callback URL**
```
https://abc123xyz.ngrok.io/api/webhooks/zalo/oauth-callback
```

**Bước 5: Click link OAuth**
Sau khi setup callback, click vào link:
```
https://oauth.zaloapp.com/v4/oa/permission?app_id=2284323715851765379&redirect_uri=https://abc123xyz.ngrok.io/api/webhooks/zalo/oauth-callback
```

Đăng nhập và cấp quyền → Token sẽ hiện ra trên trang!

---

### Option 2: Bỏ qua OAuth, lấy Test Token (FASTEST)

**Nếu không muốn setup ngrok ngay:**

1. Bỏ QUA phần OAuth callback URL này
2. Tìm tab **"Tools"** hoặc **"Công cụ"** trong Developer Console
3. Click **"Get Test Access Token"** hoặc **"Access Token"**
4. Sẽ có button tạo token test → Click
5. Copy token → Dùng được 90 ngày

---

## 📋 Callback URL cho các môi trường

### Development (Local):
```
# Với ngrok
https://your-ngrok-id.ngrok.io/api/webhooks/zalo/oauth-callback

# KHÔNG dùng localhost vì Zalo cần HTTPS
```

### Production (khi deploy):
```
https://your-domain.com/api/webhooks/zalo/oauth-callback
```

---

## ✅ Quyền cần yêu cầu

Khi setup OAuth, chọn các quyền sau:

- ✅ **Send messages to followers** - Gửi tin nhắn
- ✅ **Get follower information** - Lấy thông tin user  
- ✅ **Manage followers** - Quản lý followers
- ✅ **Read OA information** - Đọc thông tin OA

---

## 🚀 Khuyến nghị

**Cho testing ngay bây giờ:**
→ Dùng **Test Token** (Option 2) - Nhanh nhất, không cần setup gì

**Cho production sau này:**
→ Setup OAuth với callback URL production

---

## 📝 Bước tiếp theo

Sau khi có ACCESS_TOKEN (bằng cách nào cũng được):

1. Add vào `.env.local`
2. Restart server
3. Test tại `/zalo-demo`
4. Bắt đầu sử dụng!

