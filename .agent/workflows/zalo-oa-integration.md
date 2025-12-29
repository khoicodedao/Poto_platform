---
description: Hướng dẫn tích hợp Zalo OA
---

# Hướng dẫn Tích hợp Zalo OA vào Online Learning Platform

## Phần 1: Chuẩn bị từ Zalo Developer

### Bước 1.1: Tạo App trên Zalo Developer Console

1. Truy cập https://developers.zalo.me/
2. Đăng nhập bằng tài khoản Zalo của bạn
3. Click **"Tạo ứng dụng"** hoặc **"Create App"**
4. Chọn loại ứng dụng: **"OA - Official Account"**
5. Điền thông tin:
   - **Tên ứng dụng**: Online Learning Platform
   - **Mô tả**: Hệ thống quản lý lớp học trực tuyến
   - **Website**: (URL hệ thống của bạn nếu có)
6. Sau khi tạo, bạn sẽ nhận được:
   - **App ID**: Ví dụ `1234567890123456789`
   - **App Secret**: Ví dụ `abcdefghijklmnopqrstuvwxyz`

### Bước 1.2: Liên kết OA với App

1. Trong Dashboard của App vừa tạo
2. Vào tab **"Official Account"** hoặc **"Tài khoản OA"**
3. Click **"Liên kết OA"**
4. Chọn OA của công ty bạn
5. Cấp quyền cho App

### Bước 1.3: Lấy Access Token

**Cách 1: Sử dụng OAuth (Khuyến nghị cho Production)**
- Implement OAuth flow để lấy access token tự động
- Token có thời hạn, cần refresh định kỳ

**Cách 2: Lấy Access Token thủ công (Dùng cho testing FREE OA)**
1. Trong Dashboard App, vào **"Tools & Resources"**
2. Chọn **"Get Token"** hoặc **"Lấy Access Token"**
3. Copy **Access Token** (có dạng: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
4. **Lưu ý**: Token này có hạn (thường 90 ngày cho Free OA)

### Bước 1.4: Lấy OA ID

1. Truy cập https://oa.zalo.me/
2. Chọn Official Account của bạn
3. Vào **"Cài đặt"** → **"Thông tin OA"**
4. Copy **OA ID** (dạng số, ví dụ: `1234567890123456789`)

## Phần 2: Thông tin cần cung cấp

Sau khi hoàn thành Phần 1, hãy cung cấp các thông tin sau:

```
ZALO_OA_ID=<OA_ID của bạn>
ZALO_APP_ID=<App_ID từ developer console>
ZALO_APP_SECRET=<App_Secret từ developer console>
ZALO_ACCESS_TOKEN=<Access_Token vừa lấy>
```

**Ghi chú quan trọng:**
- **FREE OA** chỉ gửi được tin nhắn đến user đã follow OA trong 7 ngày gần nhất
- **FREE OA** có giới hạn số lượng tin nhắn/ngày (thường 1000 tin/ngày)
- Để gửi tin nhắn không giới hạn, cần nâng cấp lên Premium OA

## Phần 3: Luồng hoạt động

### Để gửi tin nhắn từ hệ thống:

1. **Học viên follow OA trước**
   - Teacher/Admin gửi link OA cho học viên
   - Học viên click follow OA

2. **Lưu Zalo User ID**
   - Khi học viên follow OA, Zalo gửi webhook về hệ thống
   - Hệ thống lưu `zaloUserId` vào database (bảng `users`)

3. **Gửi thông báo**
   - Teacher/Admin tạo thông báo từ UI
   - Hệ thống gọi Zalo API để gửi tin nhắn
   - Lưu log vào bảng `notifications`

### Các loại tin nhắn có thể gửi:

1. **Thông báo buổi học sắp diễn ra**
   - Trước buổi học 1-2 giờ
   - Kèm link tham gia

2. **Thông báo bài tập mới**
   - Khi teacher tạo assignment mới
   - Nhắc deadline

3. **Thông báo kết quả**
   - Điểm danh
   - Điểm bài tập
   - Feedback

4. **Thông báo tài liệu mới**
   - Khi upload learning materials
   - Link download/xem

5. **Thông báo nhóm (broadcast)**
   - Gửi đến tất cả học viên trong lớp
   - Thông báo chung
