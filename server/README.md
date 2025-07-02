# WebRTC Signaling Server

## Cài đặt

1. Di chuyển vào thư mục server:
\`\`\`bash
cd server
\`\`\`

2. Cài đặt dependencies:
\`\`\`bash
npm install
\`\`\`

3. Chạy server development:
\`\`\`bash
npm run dev
\`\`\`

4. Hoặc chạy production:
\`\`\`bash
npm start
\`\`\`

## Cấu hình

Server sẽ chạy trên port 3001 mặc định. Bạn có thể thay đổi bằng biến môi trường:

\`\`\`bash
PORT=8080 npm start
\`\`\`

## API Endpoints

- `GET /health` - Health check
- `GET /api/rooms` - Danh sách tất cả phòng
- `GET /api/rooms/:roomId` - Thông tin phòng cụ thể

## Socket Events

### Client gửi:
- `join-room` - Tham gia phòng
- `leave-room` - Rời phòng
- `offer` - Gửi WebRTC offer
- `answer` - Gửi WebRTC answer
- `ice-candidate` - Gửi ICE candidate
- `chat-message` - Gửi tin nhắn chat
- `toggle-audio` - Bật/tắt audio
- `toggle-video` - Bật/tắt video
- `start-screen-share` - Bắt đầu chia sẻ màn hình
- `stop-screen-share` - Dừng chia sẻ màn hình

### Server gửi:
- `room-users` - Danh sách user trong phòng
- `user-joined` - User mới tham gia
- `user-left` - User rời phòng
- `offer` - Nhận WebRTC offer
- `answer` - Nhận WebRTC answer
- `ice-candidate` - Nhận ICE candidate
- `chat-message` - Nhận tin nhắn chat
- `user-audio-toggled` - User bật/tắt audio
- `user-video-toggled` - User bật/tắt video
- `user-started-screen-share` - User bắt đầu chia sẻ màn hình
- `user-stopped-screen-share` - User dừng chia sẻ màn hình

## Production Deployment

Để deploy lên production, bạn cần:

1. Cấu hình CORS cho domain của bạn
2. Sử dụng HTTPS
3. Cấu hình TURN server cho NAT traversal
4. Sử dụng Redis cho scaling (nếu cần)
