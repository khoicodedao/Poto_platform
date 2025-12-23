# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG ONLINE LEARNING PLATFORM

## 📋 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Đăng nhập và Xác thực](#đăng-nhập-và-xác-thực)
3. [Trang chủ Dashboard](#trang-chủ-dashboard)
4. [Quản lý Lớp học](#quản-lý-lớp-học)
5. [Phòng học Trực tuyến](#phòng-học-trực-tuyến)
6. [Quản lý Bài tập](#quản-lý-bài-tập)
7. [Quản lý Tài liệu](#quản-lý-tài-liệu)
8. [Phân quyền và Vai trò](#phân-quyền-và-vai-trò)

---

## Giới thiệu

**Online Learning Platform** là hệ thống học trực tuyến toàn diện, hỗ trợ giảng dạy và học tập từ xa với các tính năng:

- 🎥 **Video Conference**: Học trực tuyến với LiveKit
- 📚 **Quản lý lớp học**: Tạo, quản lý và tham gia lớp học
- 📝 **Bài tập**: Giao bài, nộp bài và chấm điểm
- 📁 **Tài liệu**: Chia sẻ và quản lý tài liệu học tập
- 💬 **Chat**: Trao đổi trực tiếp trong lớp học
- 🎨 **Whiteboard**: Bảng vẽ tương tác (Excalidraw)
- 📊 **Báo cáo**: Theo dõi tiến độ và kết quả học tập

---

## Đăng nhập và Xác thực

### 1. Trang Đăng nhập (`/auth/signin`)

#### Cách đăng nhập:

**Phương pháp 1: Đăng nhập thủ công**
1. Truy cập trang đăng nhập
2. Nhập **Email** và **Mật khẩu**
3. Nhấn nút **"Đăng nhập"**

**Phương pháp 2: Đăng nhập nhanh**
- Nhấn nút **"Học viên"** để đăng nhập với tài khoản học sinh mẫu
- Nhấn nút **"Giáo viên"** để đăng nhập với tài khoản giáo viên mẫu

#### Tài khoản Demo:

```
Giáo viên:
- Email: teacher1@example.com
- Mật khẩu: 123456

Học viên:
- Email: student1@example.com
- Mật khẩu: 123456
```

#### Tính năng:
- ✅ Hiển thị/ẩn mật khẩu
- ✅ Thông báo lỗi khi đăng nhập sai
- ✅ Chuyển hướng tự động sau khi đăng nhập thành công
- ✅ Link đến trang đăng ký và quên mật khẩu

### 2. Trang Đăng ký (`/auth/signup`)

1. Nhập thông tin cá nhân: Tên, Email, Mật khẩu
2. Chọn vai trò: Học viên hoặc Giáo viên
3. Nhấn **"Đăng ký"**
4. Hệ thống tự động chuyển đến trang đăng nhập

### 3. Quên mật khẩu (`/auth/forgot-password`)

1. Nhập email đã đăng ký
2. Nhấn **"Gửi link đặt lại mật khẩu"**
3. Kiểm tra email và làm theo hướng dẫn

---

## Trang chủ Dashboard

### Truy cập: `/` (Trang chủ sau khi đăng nhập)

### Giao diện Dashboard

#### 1. **Banner Chào mừng**
- Hiển thị tên người dùng
- Thông điệp cá nhân hóa theo vai trò
- Thống kê tổng quan:
  - Số lớp học (tham gia/phụ trách)
  - Số bài tập
  - Số tài liệu

#### 2. **Thao tác Nhanh** (Quick Actions)

| Thao tác | Mô tả | Đối tượng |
|----------|-------|-----------|
| **Lớp học** | Truy cập danh sách lớp học | Tất cả |
| **Bài tập** | Xem và quản lý bài tập | Tất cả |
| **Tài liệu** | Kho tài liệu học tập | Tất cả |
| **Tạo lớp** | Tạo lớp học mới | Chỉ Giáo viên |

#### 3. **Lớp học của bạn**
- Hiển thị 3 lớp học gần đây nhất
- Thông tin mỗi lớp:
  - Tên lớp học
  - Giảng viên
  - Lịch học
  - Số học viên
- Nút **"Vào lớp"**: Tham gia phòng học trực tuyến

#### 4. **Bài tập nổi bật**
- Hiển thị 3 bài tập gần đây
- Thông tin:
  - Tiêu đề bài tập
  - Lớp học
  - Hạn nộp
  - Điểm tối đa
- Nút **"Chi tiết"**: Xem chi tiết bài tập

#### 5. **Sidebar Phải**

**Hoạt động gần đây:**
- Tin nhắn mới
- Tài liệu mới
- Bài tập mới

**Tài liệu mới chia sẻ:**
- 5 tài liệu gần nhất
- Nút **"Xem"**: Mở tài liệu

**Liên kết nhanh:**
- Trung tâm trợ giúp
- Cài đặt tài khoản
- Gửi phản hồi

---

## Quản lý Lớp học

### 1. Danh sách Lớp học (`/classes`)

#### Giao diện chính:

**Header:**
- Tiêu đề: "Lớp học của tôi"
- Mô tả theo vai trò:
  - Giáo viên: "Các lớp bạn đang giảng dạy"
  - Học viên: "Các lớp bạn đang tham gia"

**Thanh tìm kiếm và lọc:**
- 🔍 Ô tìm kiếm lớp học
- 🔽 Nút bộ lọc

**Danh sách lớp học (Grid):**

Mỗi thẻ lớp học hiển thị:
- **Banner gradient** với tên lớp và giảng viên
- **Badge trạng thái**:
  - "Đang hoạt động" (màu xanh)
  - "Đang tuyển sinh" (màu xám)
- **Thông tin chi tiết**:
  - Mô tả lớp học
  - 📅 Lịch học
  - 👥 Số học viên / Số lượng tối đa
  - 🕐 Ngày tạo
- **Nút hành động**:
  - **"Tham gia"** (màu xanh): Vào phòng học trực tuyến
  - **"Chi tiết"**: Xem thông tin chi tiết lớp

#### Trạng thái trống:
- Hiển thị khi chưa có lớp học
- Nút **"Tạo lớp học"** (chỉ Giáo viên/Admin)

### 2. Chi tiết Lớp học (`/classes/[id]`)

#### Thông tin hiển thị:
- Tên lớp học
- Mô tả chi tiết
- Giảng viên phụ trách
- Lịch học
- Danh sách học viên
- Bài tập của lớp
- Tài liệu của lớp
- Lịch sử buổi học

#### Tính năng (Giáo viên):
- ✏️ Chỉnh sửa thông tin lớp
- 👥 Quản lý học viên
- 📝 Tạo bài tập mới
- 📁 Upload tài liệu
- 📊 Xem báo cáo lớp học

### 3. Tạo Lớp học (`/classes/create`)

**Chỉ dành cho Giáo viên và Admin**

#### Các bước tạo lớp:

1. **Thông tin cơ bản:**
   - Tên lớp học (bắt buộc)
   - Mô tả lớp học
   - Lịch học (ví dụ: "Thứ 2, 4, 6 - 19:00-21:00")

2. **Cấu hình:**
   - Số học viên tối đa (mặc định: 20)
   - Mã phòng (tùy chọn)
   - Zalo Group ID (tùy chọn)

3. **Nhấn "Tạo lớp học"**

#### Sau khi tạo:
- Chuyển đến trang chi tiết lớp
- Có thể thêm học viên
- Có thể tạo bài tập và upload tài liệu

---

## Phòng học Trực tuyến

### Truy cập: `/classroom/[id]`

### Giao diện Phòng học

#### 1. **Header**
- Tên phòng học: "Lớp học trực tuyến - Phòng [ID]"
- Badge **"LIVE"** (đỏ, nhấp nháy)
- Số người tham gia

#### 2. **Khu vực Video (Bên trái)**

**Video Grid:**
- Hiển thị video của tất cả người tham gia
- Video của bạn (có nhãn "Bạn")
- Video của người khác
- Hiển thị trạng thái:
  - 🎤 Mic bật/tắt
  - 📹 Camera bật/tắt
  - 🖥️ Đang chia sẻ màn hình

**Thanh điều khiển (Control Bar):**

| Nút | Chức năng | Icon |
|-----|-----------|------|
| **Mic** | Bật/tắt microphone | 🎤 |
| **Camera** | Bật/tắt camera | 📹 |
| **Share Screen** | Chia sẻ màn hình | 🖥️ |
| **Record** | Ghi màn hình | ⏺️ |
| **Fullscreen** | Toàn màn hình | ⛶ |
| **Sidebar** | Mở/đóng sidebar | 📋 |
| **Leave** | Rời khỏi phòng | 📞 (đỏ) |

#### 3. **Sidebar (Bên phải)**

**4 Tab chính:**

##### Tab 1: **Chat** 💬
- Hiển thị tin nhắn theo thời gian thực
- Mỗi tin nhắn gồm:
  - Avatar người gửi
  - Tên người gửi
  - Badge "Giáo viên" (nếu là giáo viên)
  - Thời gian gửi
  - Nội dung tin nhắn
- Ô nhập tin nhắn ở dưới cùng
- Nút **"Gửi"** (Send)

**Cách gửi tin nhắn:**
1. Nhập nội dung vào ô chat
2. Nhấn **Enter** hoặc nút **"Gửi"**
3. Tin nhắn hiển thị ngay lập tức

##### Tab 2: **Participants** 👥
- Danh sách người tham gia
- Thông tin mỗi người:
  - Avatar
  - Tên
  - Vai trò (Giáo viên/Học viên)
  - Trạng thái kết nối (chấm xanh)
  - Nhãn "(Bạn)" cho chính mình

##### Tab 3: **Files** 📁
- Danh sách tài liệu của lớp
- Mỗi file có link để tải về
- Hiển thị "Chưa có tài liệu nào" nếu trống

##### Tab 4: **Whiteboard** 🎨
- Nhấn để mở bảng trắng toàn màn hình
- Sử dụng Excalidraw để vẽ
- Có thể chia sẻ bảng trắng qua Share Screen

### Tính năng Whiteboard

**Khi mở Whiteboard:**
1. Bảng trắng mở toàn màn hình
2. Công cụ vẽ Excalidraw:
   - ✏️ Bút vẽ
   - 📐 Hình học (vuông, tròn, mũi tên)
   - 📝 Văn bản
   - 🎨 Màu sắc
   - ↩️ Undo/Redo
3. Nút **"Thoát bảng trắng"** để đóng

**Chia sẻ Whiteboard:**
1. Mở Whiteboard
2. Nhấn nút **"Share Screen"** trong Control Bar
3. Chọn cửa sổ Whiteboard
4. Học viên sẽ thấy bảng trắng của bạn

### Ghi màn hình (Recording)

**Cách ghi màn hình:**
1. Nhấn nút **Record** (⏺️)
2. Chọn màn hình/cửa sổ muốn ghi
3. Nút chuyển sang màu đỏ khi đang ghi
4. Nhấn lại để dừng ghi
5. File video tự động tải về (.webm)

**Lưu ý:**
- Chỉ ghi được màn hình bạn chia sẻ
- File lưu với tên: `class-[ID]-[timestamp].webm`

### Rời khỏi Phòng học

1. Nhấn nút **"Leave"** (màu đỏ)
2. Tự động ngắt kết nối
3. Chuyển về trang danh sách lớp học

---

## Quản lý Bài tập

### 1. Danh sách Bài tập (`/assignments`)

#### Thống kê Tổng quan (4 Card)

| Thẻ | Ý nghĩa | Icon |
|-----|---------|------|
| **Tổng bài tập** | Tổng số bài tập | 📄 |
| **Chưa nộp** | Bài tập chưa làm | ⏰ |
| **Đã hoàn thành** | Bài đã nộp | ✅ |
| **Quá hạn** | Bài quá deadline | ⚠️ |

#### Tabs Phân loại

**Học viên có 4 tabs:**
1. **Tất cả**: Tất cả bài tập
2. **Chưa nộp**: Bài chưa làm, chưa quá hạn
3. **Đã nộp**: Bài đã submit
4. **Quá hạn**: Bài chưa nộp và đã quá hạn

**Giáo viên có 1 tab:**
- **Tất cả**: Tất cả bài tập đã giao

#### Thẻ Bài tập

Mỗi thẻ hiển thị:
- **Tiêu đề bài tập** (có link đến chi tiết)
- **Tên lớp học**
- **Badge trạng thái**:
  - 🔵 "Đã giao" (Giáo viên)
  - 🟢 "Đã chấm" (Học viên - đã có điểm)
  - 🟡 "Đã nộp" (Học viên - chưa chấm)
  - ⚪ "Chưa nộp" (Học viên)
  - 🔴 "Quá hạn" (Học viên)
- **Badge điểm**: Điểm tối đa (ví dụ: "100 điểm")
- **Mô tả bài tập**
- **Thông tin thời gian**:
  - 📅 Hạn nộp
  - ✅ Thời gian đã nộp (nếu có)

**Nút hành động:**

**Học viên:**
- **"Nộp bài"** (xanh): Nếu chưa nộp
- **"Nộp muộn"** (đỏ): Nếu quá hạn
- **"Xem bài đã nộp"**: Nếu đã nộp

**Giáo viên:**
- **"Chỉnh sửa"**: Sửa bài tập

### 2. Chi tiết Bài tập (`/assignments/[id]`)

#### Thông tin hiển thị:
- Tiêu đề bài tập
- Mô tả chi tiết
- Lớp học
- Hạn nộp
- Điểm tối đa
- File đính kèm (nếu có)

#### Tính năng Học viên:
- Xem yêu cầu bài tập
- Nộp bài (nếu chưa nộp)
- Xem bài đã nộp
- Xem điểm và nhận xét (nếu đã chấm)

#### Tính năng Giáo viên:
- Xem danh sách nộp bài
- Chấm điểm từng bài
- Viết nhận xét
- Thống kê số lượng đã nộp/chưa nộp

### 3. Nộp Bài tập (`/assignments/[id]/submit`)

**Chỉ dành cho Học viên**

#### Các bước nộp bài:

1. **Nhập nội dung:**
   - Viết câu trả lời vào ô văn bản
   - Hoặc upload file

2. **Upload file (tùy chọn):**
   - Nhấn nút **"Chọn file"**
   - Chọn file từ máy tính
   - Hỗ trợ: PDF, Word, Excel, ảnh, v.v.

3. **Xem lại:**
   - Kiểm tra nội dung
   - Kiểm tra file đính kèm

4. **Nộp bài:**
   - Nhấn nút **"Nộp bài"**
   - Xác nhận nộp bài
   - Không thể sửa sau khi nộp

#### Thông báo:
- ✅ "Nộp bài thành công"
- ⚠️ "Bài nộp muộn" (nếu quá hạn)

### 4. Xem Bài đã nộp (`/assignments/[id]/view`)

**Học viên xem:**
- Nội dung đã nộp
- File đã upload
- Thời gian nộp
- Điểm số (nếu đã chấm)
- Nhận xét của giáo viên

### 5. Chỉnh sửa Bài tập (`/assignments/[id]/edit`)

**Chỉ dành cho Giáo viên**

#### Các trường có thể sửa:
- Tiêu đề
- Mô tả
- Hạn nộp
- Điểm tối đa
- File đính kèm
- Trạng thái hiển thị

#### Lưu thay đổi:
- Nhấn **"Lưu"**
- Thông báo thành công
- Học viên thấy thay đổi ngay lập tức

---

## Quản lý Tài liệu

### Truy cập: `/files`

### Giao diện Tài liệu

#### 1. **Header**
- Tiêu đề: "Tài liệu học tập"
- Mô tả: "Quản lý và truy cập tài liệu từ các lớp học"

#### 2. **Thanh Tìm kiếm và Lọc**
- 🔍 Ô tìm kiếm tài liệu
- 🔽 Nút bộ lọc

#### 3. **Thống kê (4 Card)**

| Thẻ | Ý nghĩa | Icon |
|-----|---------|------|
| **Tổng tài liệu** | Số lượng file | 📄 |
| **Lượt tải** | Tổng lượt download | ⬇️ |
| **Video** | Số video | 🎥 |
| **Dung lượng** | Tổng dung lượng | 📁 |

#### 4. **Tabs Phân loại**

| Tab | Nội dung |
|-----|----------|
| **Tất cả** | Tất cả tài liệu |
| **Bài giảng** | Slide, tài liệu giảng |
| **Bài tập** | File bài tập |
| **Video** | Video bài giảng |
| **Audio** | File âm thanh |

#### 5. **Grid Tài liệu**

Mỗi thẻ file hiển thị:
- **Icon theo loại file**:
  - 🎥 Video (màu tím)
  - 🎵 Audio (màu xanh lá)
  - 🖼️ Hình ảnh (màu hồng)
  - 📄 PDF (màu đỏ)
  - 📝 Word (màu cam)
  - 📦 Nén (màu xanh)
  - 📄 Khác (màu xám)
- **Tên file**
- **Lớp học** • **Người upload**
- **Dung lượng** • **Ngày upload**
- **Badge danh mục**: Bài giảng, Bài tập, Video, Audio, Tài liệu tham khảo
- **Số lượt tải**

**Nút hành động:**
- **"Tải về"** (xanh): Download file
- **👁️ "Xem"**: Mở file trong tab mới
- **🔗 "Chia sẻ"**: Copy link chia sẻ

### Upload Tài liệu

**Chỉ dành cho Giáo viên và Admin**

#### Các bước upload:

1. **Nhấn nút "Upload"** (nếu có)
2. **Chọn lớp học** (dropdown)
3. **Chọn danh mục**:
   - Bài giảng
   - Bài tập
   - Video
   - Audio
   - Tài liệu tham khảo
4. **Chọn file** từ máy tính
5. **Nhấn "Upload"**

#### Sau khi upload:
- File hiển thị trong danh sách
- Học viên có thể tải về ngay

---

## Phân quyền và Vai trò

### 1. Học viên (Student)

#### Quyền hạn:
- ✅ Xem danh sách lớp học đã tham gia
- ✅ Tham gia phòng học trực tuyến
- ✅ Chat trong lớp học
- ✅ Xem bài tập
- ✅ Nộp bài tập
- ✅ Xem điểm và nhận xét
- ✅ Tải tài liệu
- ❌ Không thể tạo lớp học
- ❌ Không thể tạo bài tập
- ❌ Không thể upload tài liệu
- ❌ Không thể chấm điểm

#### Trang có thể truy cập:
- `/` - Dashboard
- `/classes` - Danh sách lớp học
- `/classes/[id]` - Chi tiết lớp học
- `/classroom/[id]` - Phòng học trực tuyến
- `/assignments` - Danh sách bài tập
- `/assignments/[id]` - Chi tiết bài tập
- `/assignments/[id]/submit` - Nộp bài
- `/assignments/[id]/view` - Xem bài đã nộp
- `/files` - Tài liệu

### 2. Giáo viên (Teacher)

#### Quyền hạn:
- ✅ Tất cả quyền của Học viên
- ✅ Tạo lớp học mới
- ✅ Quản lý lớp học
- ✅ Tạo bài tập
- ✅ Chấm điểm bài tập
- ✅ Upload tài liệu
- ✅ Xem báo cáo lớp học
- ✅ Quản lý học viên trong lớp

#### Trang bổ sung:
- `/classes/create` - Tạo lớp học
- `/assignments/[id]/edit` - Sửa bài tập
- `/assignments/[id]/grade` - Chấm điểm

### 3. Admin

#### Quyền hạn:
- ✅ Tất cả quyền của Giáo viên
- ✅ Quản lý tất cả lớp học
- ✅ Quản lý người dùng
- ✅ Xem tất cả báo cáo
- ✅ Cấu hình hệ thống

---

## Lưu ý Sử dụng

### 1. Yêu cầu Hệ thống

**Trình duyệt:**
- Chrome (khuyến nghị)
- Firefox
- Edge
- Safari (có thể có hạn chế về video)

**Kết nối Internet:**
- Tối thiểu: 2 Mbps
- Khuyến nghị: 5 Mbps trở lên (cho video HD)

**Thiết bị:**
- Máy tính: Windows, macOS, Linux
- Tablet: iPad, Android
- Điện thoại: iOS, Android (hạn chế một số tính năng)

### 2. Quyền Truy cập Camera và Mic

**Lần đầu tham gia phòng học:**
1. Trình duyệt sẽ hỏi quyền truy cập camera và mic
2. Nhấn **"Cho phép"** (Allow)
3. Nếu từ chối, có thể bật lại trong cài đặt trình duyệt

**Cách bật lại quyền:**
- Chrome: Nhấn icon 🔒 bên trái URL → Cài đặt trang web
- Firefox: Nhấn icon 🔒 → Quyền → Camera/Microphone

### 3. Khắc phục Sự cố

#### Không kết nối được phòng học:
1. Kiểm tra kết nối Internet
2. Tải lại trang (F5)
3. Xóa cache trình duyệt
4. Thử trình duyệt khác

#### Không thấy video của người khác:
1. Kiểm tra kết nối Internet
2. Yêu cầu người đó bật camera
3. Tải lại trang

#### Không gửi được tin nhắn:
1. Kiểm tra kết nối Internet
2. Tải lại trang
3. Đăng nhập lại

#### Không tải được tài liệu:
1. Kiểm tra kết nối Internet
2. Thử lại sau vài giây
3. Liên hệ giáo viên nếu vẫn lỗi

### 4. Mẹo Sử dụng

**Tối ưu Video:**
- Tắt camera khi không cần thiết để tiết kiệm băng thông
- Sử dụng tai nghe để tránh echo
- Đảm bảo ánh sáng tốt khi bật camera

**Quản lý Bài tập:**
- Đặt nhắc nhở cho deadline
- Nộp bài sớm để tránh quá hạn
- Kiểm tra kỹ trước khi nộp

**Tổ chức Tài liệu:**
- Đặt tên file rõ ràng
- Phân loại theo danh mục
- Tải về và lưu trữ local

---

## Hỗ trợ và Liên hệ

### Trung tâm Trợ giúp
- Truy cập: `/help` (nếu có)
- Tìm câu hỏi thường gặp (FAQ)
- Hướng dẫn video

### Gửi Phản hồi
- Truy cập: `/feedback` (nếu có)
- Báo lỗi
- Đề xuất tính năng mới

### Liên hệ Quản trị viên
- Email: admin@example.com
- Zalo: [Số điện thoại]

---

## Cập nhật và Phiên bản

**Phiên bản hiện tại:** 1.0.0

**Tính năng đang phát triển:**
- 📊 Analytics Dashboard (Báo cáo chi tiết)
- 🔔 Thông báo Zalo
- 📅 Lịch học tự động
- 🎯 Bài tập tự động chấm điểm

---

**© 2024 Online Learning Platform. All rights reserved.**
