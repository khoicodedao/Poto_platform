# 🔑 Hướng dẫn Chi tiết Lấy Zalo Credentials

## 📋 Tổng quan

Bạn cần lấy 4 thông tin sau:
1. ✅ **ZALO_OA_ID** - ID của Official Account
2. ✅ **ZALO_APP_ID** - ID của App Developer
3. ✅ **ZALO_APP_SECRET** - Secret key của App
4. ✅ **ZALO_ACCESS_TOKEN** - Token để gọi API

---

## 🎯 BƯỚC 1: Lấy ZALO_OA_ID

### Cách 1: Từ Zalo OA Dashboard

1. **Đăng nhập** vào https://oa.zalo.me/
2. **Chọn OA** của công ty bạn (nếu có nhiều OA)
3. Click vào **Cài đặt** (Settings) ở menu bên trái
4. Click **Thông tin OA** (OA Information)
5. Tìm mục **OA ID** hoặc **Official Account ID**
6. Copy ID này (dạng số, ví dụ: `1234567890123456789`)

### Cách 2: Từ URL

Khi bạn đang ở trang quản lý OA, xem URL:
```
https://oa.zalo.me/home?id=1234567890
```
Số sau `id=` chính là **OA_ID** của bạn.

**✅ Lưu lại:** 
```
ZALO_OA_ID=1234567890123456789
```

---

## 🎯 BƯỚC 2: Tạo App và Lấy APP_ID + APP_SECRET

### 2.1. Truy cập Zalo Developer Portal

1. Mở trình duyệt mới
2. Truy cập: **https://developers.zalo.me/**
3. Đăng nhập bằng **cùng tài khoản Zalo** quản lý OA

### 2.2. Tạo App Mới

1. Sau khi đăng nhập, click **"Tạo ứng dụng"** hoặc **"Create App"**
   
2. Chọn loại app: **"Official Account"** (OA)
   - Nếu không thấy, chọn "Social API" rồi chọn OA bên trong

3. Điền thông tin app:
   ```
   Tên ứng dụng: Online Learning Platform
   Mô tả: Hệ thống quản lý lớp học và gửi thông báo
   Category: Education / Utility
   Website: (URL website của bạn hoặc để trống)
   ```

4. Click **"Tạo"** / **"Create"**

### 2.3. Lấy APP_ID và APP_SECRET

Sau khi tạo app thành công:

1. Bạn sẽ thấy trang **App Dashboard**
2. Tìm phần **"App Information"** hoặc **"Thông tin ứng dụng"**
3. Bạn sẽ thấy:
   ```
   App ID: 1234567890123456789
   App Secret: [Click "Show" để hiện] → abcdefghijklmnopqrstuvwxyz123456
   ```

4. **Click vào biểu tượng "Show"** hoặc "Hiện" bên cạnh App Secret để thấy giá trị

**⚠️ LƯU Ý QUAN TRỌNG:**
- **App Secret** rất nhạy cảm, KHÔNG share công khai
- Copy và lưu vào file `.env.local` ngay

**✅ Lưu lại:**
```
ZALO_APP_ID=1234567890123456789
ZALO_APP_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

---

## 🎯 BƯỚC 3: Liên kết OA với App

**Quan trọng:** Phải liên kết OA với App mới lấy được Access Token!

### 3.1. Trong App Dashboard

1. Vẫn ở trang App vừa tạo
2. Tìm menu **"Official Account"** hoặc **"Tài khoản OA"** bên trái
3. Click **"Liên kết OA"** / **"Link OA"**

### 3.2. Chọn OA

1. Sẽ hiện danh sách các OA mà bạn quản lý
2. **Chọn OA** của công ty
3. Click **"Liên kết"** / **"Link"**

### 3.3. Cấp quyền

1. Hệ thống sẽ hỏi cấp quyền cho app
2. **Tick chọn tất cả** các quyền, đặc biệt là:
   - ✅ Send messages
   - ✅ Manage followers
   - ✅ User information
3. Click **"Đồng ý"** / **"Agree"**

**✅ Kết quả:** App đã được liên kết với OA!

---

## 🎯 BƯỚC 4: Lấy ACCESS_TOKEN

Có 2 cách để lấy Access Token:

### Cách 1: Lấy Token Thủ công (RECOMMENDED cho FREE OA)

**Dành cho testing và FREE OA:**

1. Trong App Dashboard, tìm menu **"Tools & Resources"** hoặc **"Công cụ"**
2. Click **"Access Token"** hoặc **"Lấy Token"**
3. Chọn loại token:
   - **OA Access Token** (cho OA)
   - Chọn OA bạn vừa liên kết
4. Click **"Lấy Token"** / **"Get Token"**
5. Copy token hiện ra (dạng rất dài: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

**⚠️ LƯU Ý:**
- Token FREE OA thường **hết hạn sau 90 ngày**
- Khi hết hạn, quay lại đây lấy token mới
- Lưu token vào file `.env.local`

**✅ Lưu lại:**
```
ZALO_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL29hdXRoLnphbG8ubWUiLCJhdWQiOiJodHRwczovL29hdXRoLnphbG8ubWUiLCJleHAiOjE3MDk4NzY1NDMsImlhdCI6MTcwOTc5MDE0MywianRpIjoiMTIzNDU2Nzg5MCJ9.abcdefghijklmnopqrstuvwxyz1234567890
```

### Cách 2: OAuth Flow (Advanced - cho Production)

**Dành cho Premium OA và tự động refresh token:**

Tôi đã chuẩn bị code OAuth flow nếu bạn muốn implement sau. Nhưng với FREE OA testing, **dùng Cách 1 là đủ**.

---

## 📝 BƯỚC 5: Cập nhật .env.local

1. Mở file `.env.local` trong project
2. Thêm các dòng sau (thay YOUR_VALUE bằng giá trị thật):

```env
# Zalo OA Configuration
ZALO_OA_ID=1234567890123456789
ZALO_APP_ID=9876543210987654321
ZALO_APP_SECRET=abcdefghijklmnopqrstuvwxyz123456
ZALO_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional - thêm sau nếu cần webhook
# ZALO_WEBHOOK_SIGN_KEY=
# ZALO_WEBHOOK_VERIFY_TOKEN=

# For cron jobs
CRON_SECRET=your-random-secret-key-here-123456
```

3. **Save file** `.env.local`
4. **Restart dev server** nếu đang chạy:
   ```bash
   # Ctrl+C để stop
   npm run dev
   ```

---

## ✅ BƯỚC 6: Test Kết nối

### 6.1. Chạy server

```bash
npm run dev
```

### 6.2. Vào trang demo

Mở trình duyệt, truy cập:
```
http://localhost:3000/zalo-demo
```

### 6.3. Test Connection

1. Scroll xuống phần **"Tính năng cho Admin"**
2. Tìm component **"Test Zalo OA Connection"**
3. Click nút **"Test Connection"**
4. Đợi vài giây...

**Kết quả mong đợi:**
- ✅ Màu xanh: "Zalo OA connection successful"
- ❌ Màu đỏ: "Connection failed" → kiểm tra lại credentials

---

## 🎊 BƯỚC 7: Hoàn tất!

Nếu test thành công, bạn đã sẵn sàng:

1. ✅ Gửi tin nhắn Zalo đến học viên
2. ✅ Học viên kết nối tài khoản Zalo
3. ✅ Gửi broadcast đến cả lớp
4. ✅ Tự động gửi thông báo

---

## 🆘 Troubleshooting

### ❌ Lỗi: "Invalid App ID or Secret"
→ Kiểm tra lại APP_ID và APP_SECRET có đúng không
→ Đảm bảo không có khoảng trắng thừa khi copy

### ❌ Lỗi: "Invalid Access Token"
→ Token có thể đã hết hạn
→ Quay lại Developer Console lấy token mới

### ❌ Lỗi: "OA not linked"
→ Chưa liên kết OA với App
→ Quay lại Bước 3 để liên kết

### ❌ Lỗi: "Permission denied"
→ Chưa cấp đủ quyền cho App
→ Vào App Settings → Permissions → Cấp quyền Send Messages

---

## 📸 Screenshots Path Reference

Nếu cần thêm hình ảnh minh họa:

1. **OA Dashboard**: oa.zalo.me → Settings → OA Information
2. **Developer Portal**: developers.zalo.me → My Apps
3. **Create App**: developers.zalo.me → Create Application
4. **App Dashboard**: developers.zalo.me/app/[app_id]
5. **Link OA**: App Dashboard → Official Account → Link OA
6. **Get Token**: App Dashboard → Tools → Access Token

---

## 📞 Bước tiếp theo

Sau khi có đủ 4 credentials:

1. ✅ Test connection thành công
2. ✅ Tích hợp UI vào các trang (xem `ZALO-INTEGRATION-GUIDE.md`)
3. ✅ Hướng dẫn học viên follow OA
4. ✅ Bắt đầu sử dụng!

---

**Có vướng mắc ở bước nào? Hãy cho tôi biết! 💪**
