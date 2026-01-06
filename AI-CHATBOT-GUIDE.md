# AI Chatbot Integration Guide

## Tổng quan

Hệ thống AI Chatbot cho phép:
- **Giáo viên**: Tạo và quản lý các chủ đề để học sinh trao đổi với AI
- **Học sinh**: Trò chuyện với AI về các chủ đề, có thể gõ chat hoặc sử dụng giọng nói

## Cấu hình

### 1. Thêm Google AI API Key

Thêm API key vào file `.env.local`:

```env
GOOGLE_AI_API_KEY=your_google_ai_studio_api_key
```

Lấy API key tại: https://makersuite.google.com/app/apikey

### 2. Database Schema

Đã tạo 2 bảng mới:
- `ai_chat_topics`: Lưu các chủ đề do giáo viên tạo
- `ai_chat_messages`: Lưu lịch sử chat giữa học sinh và AI

Migration đã được chạy với `npm run db:push`

## Tính năng

### Cho Giáo viên

#### Trang quản lý chủ đề: `/classes/[id]/ai-topics`

Giáo viên có thể:
1. **Tạo chủ đề mới**
   - Tiêu đề: Tên chủ đề
   - Mô tả: Mô tả ngắn gọn
   - System Prompt: Hướng dẫn cho AI cách trả lời

2. **Chỉnh sửa chủ đề**
   - Cập nhật tiêu đề, mô tả, system prompt
   - Bật/tắt hiển thị chủ đề

3. **Xóa chủ đề**
   - Xóa vĩnh viễn chủ đề và tất cả tin nhắn liên quan

#### Ví dụ System Prompt

**Luyện tập tiếng Anh:**
```
Bạn là một giáo viên tiếng Anh. Hãy giúp học sinh luyện tập từ vựng bằng cách:
- Đưa ra từ mới và giải thích nghĩa
- Tạo ví dụ minh họa
- Hỏi học sinh để kiểm tra hiểu biết
- Luôn kiên nhẫn và khuyến khích
```

**Giải toán:**
```
Bạn là một gia sư toán học. Hãy:
- Giải thích từng bước giải bài toán
- Không đưa ra đáp án ngay, mà hướng dẫn học sinh tự tìm ra
- Sử dụng ví dụ đơn giản để minh họa
- Khuyến khích tư duy logic
```

### Cho Học sinh

#### Chat Bubble (Nút chat ở góc phải màn hình)

Học sinh có thể:

1. **Chọn chủ đề** để trò chuyện
2. **Nhập tin nhắn bằng:**
   - Gõ text vào ô input
   - Bấm nút Mic để nói (voice input)
3. **Nghe phản hồi:**
   - AI tự động đọc câu trả lời
   - Bấm nút Volume để dừng/phát lại

#### Các nút chức năng:

- **Mic (🎤)**: Thu âm giọng nói → tự động chuyển thành text → gửi
- **Volume (🔊)**: Phát/dừng giọng đọc của AI
- **Send (➤)**: Gửi tin nhắn text

## API Endpoints

### Topics Management

#### GET `/api/ai-chat/topics?classId={id}`
Lấy danh sách chủ đề của lớp

**Response:**
```json
{
  "topics": [
    {
      "id": 1,
      "title": "Luyện tập từ vựng",
      "description": "...",
      "systemPrompt": "...",
      "isActive": true
    }
  ]
}
```

#### POST `/api/ai-chat/topics`
Tạo chủ đề mới

**Body:**
```json
{
  "classId": 1,
  "title": "Tên chủ đề",
  "description": "Mô tả",
  "systemPrompt": "Hướng dẫn cho AI"
}
```

#### PUT `/api/ai-chat/topics`
Cập nhật chủ đề

**Body:**
```json
{
  "id": 1,
  "title": "Tên mới",
  "description": "Mô tả mới",
  "systemPrompt": "Prompt mới",
  "isActive": true
}
```

#### DELETE `/api/ai-chat/topics?id={id}`
Xóa chủ đề

### Chat Messages

#### GET `/api/ai-chat/messages?topicId={id}`
Lấy lịch sử chat

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "role": "user",
      "content": "Hello",
      "createdAt": "..."
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Hi there!",
      "createdAt": "..."
    }
  ]
}
```

#### POST `/api/ai-chat/messages`
Gửi tin nhắn và nhận phản hồi từ AI

**Body:**
```json
{
  "topicId": 1,
  "content": "Câu hỏi của học sinh"
}
```

**Response:**
```json
{
  "message": {
    "id": 3,
    "role": "assistant",
    "content": "Câu trả lời từ AI",
    "createdAt": "..."
  }
}
```

### Text-to-Speech

#### POST `/api/ai-chat/tts`
Chuyển text thành giọng nói

**Body:**
```json
{
  "text": "Nội dung cần đọc"
}
```

**Response:**
```json
{
  "audioContent": "base64_audio_data",
  "useClientTTS": false
}
```

## Cách tích hợp Chat Bubble

### Thêm vào layout của học sinh

Tìm file layout hoặc component chính cho học sinh và thêm:

```tsx
import { AIChatBubble } from "@/components/ai-chat-bubble";

export default function StudentLayout() {
  const classId = getCurrentClassId(); // Lấy class ID hiện tại
  const studentId = getCurrentUserId(); // Lấy user ID

  return (
    <div>
      {/* Nội dung trang */}
      
      {/* Chat Bubble - sẽ hiện ở góc dưới bên phải */}
      <AIChatBubble classId={classId} studentId={studentId} />
    </div>
  );
}
```

## Ghi chú kỹ thuật

### Voice Recognition (Speech-to-Text)
- Sử dụng Web Speech API (`webkitSpeechRecognition`)
- Ngôn ngữ: `vi-VN` (tiếng Việt)
- Yêu cầu quyền truy cập microphone

### Text-to-Speech
- **Ưu tiên**: Google Cloud Text-to-Speech API
- **Fallback**: Web Speech Synthesis API (nếu API không khả dụng)
- Giọng đọc: `vi-VN-Standard-A` (giọng nữ)

### Google AI (Gemini)
- Model: `gemini-pro`
- Temperature: 0.7 (cân bằng giữa sáng tạo và chính xác)
- Lưu 10 tin nhắn gần nhất làm context

## Troubleshooting

### Lỗi "Google AI API key not configured"
→ Kiểm tra `.env.local` có chứa `GOOGLE_AI_API_KEY`

### Microphone không hoạt động
→ Kiểm tra quyền truy cập trình duyệt
→ Chỉ hoạt động trên HTTPS hoặc localhost

### Không nghe được giọng đọc
→ Kiểm tra volume trình duyệt
→ Một số trình duyệt có thể chặn auto-play audio

### Nhận dạng giọng nói không chính xác
→ Nói rõ ràng, tốc độ vừa phải
→ Môi trường ít tiếng ồn

## TODO / Cải tiến

- [ ] Thêm tính năng upload audio file
- [ ] Hỗ trợ nhiều ngôn ngữ
- [ ] Thêm emoji reactions cho tin nhắn
- [ ] Export lịch sử chat ra PDF
- [ ] Thống kê thời gian chat của học sinh
- [ ] Rating câu trả lời của AI (thumbs up/down)
