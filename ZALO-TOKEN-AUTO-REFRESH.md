# 🔄 Hướng dẫn Tự động Refresh Zalo Token

## 📋 Tổng quan

Hệ thống tự động quản lý và refresh Zalo access token để tránh hết hạn khi gọi API. Token sẽ được tự động refresh khi còn dưới 5 phút.

## 🎯 Các tính năng

### 1. **Tự động Refresh Token**
- Token được kiểm tra trước mỗi lần gọi Zalo API
- Tự động refresh khi còn dưới 5 phút
- Không cần can thiệp thủ công

### 2. **Token Manager**
- Singleton instance quản lý token
- Cache token trong memory
- Tránh gọi API refresh quá nhiều lần

### 3. **API Endpoints**

#### GET `/api/zalo/token-status`
Kiểm tra trạng thái token hiện tại

**Response:**
```json
{
  "success": true,
  "tokenInfo": {
    "hasToken": true,
    "expiresAt": "2026-01-08T20:00:00.000Z",
    "expiresInSeconds": 82800,
    "expiresInMinutes": 1380,
    "expiresInHours": 23
  },
  "message": "✅ Token hợp lệ, còn 1380 phút"
}
```

#### POST `/api/zalo/token-status`
Force refresh token ngay lập tức

**Response:**
```json
{
  "success": true,
  "message": "✅ Token đã được refresh thành công!",
  "accessToken": "KBDcL8cdTLHRi6HJWgLrLbMmPbEDlW...",
  "instructions": {
    "step1": "Token đã được cập nhật trong memory",
    "step2": "Kiểm tra console logs để lấy token mới",
    "step3": "Cập nhật .env.local với token mới để sử dụng sau khi restart",
    "note": "Token sẽ tự động refresh khi còn dưới 5 phút"
  }
}
```

## 🚀 Cách sử dụng

### 1. **Cấu hình .env.local**

Đảm bảo file `.env.local` có đầy đủ thông tin:

```env
ZALO_OA_ID=194643797257239355
ZALO_APP_ID=2284323715851765379
ZALO_APP_SECRET=zvNxF7y02XOI05kwZI6I
ZALO_ACCESS_TOKEN=<your_access_token>
ZALO_REFRESH_TOKEN=<your_refresh_token>
```

### 2. **Sử dụng trong code**

Hệ thống tự động hoạt động khi bạn gọi các hàm Zalo:

```typescript
import { sendZaloMessage } from "@/lib/zalo-integration";

// Token sẽ tự động được refresh nếu cần
await sendZaloMessage(zaloUserId, "Hello from Poto!");
```

### 3. **Theo dõi trạng thái token**

Thêm component `ZaloTokenMonitor` vào dashboard:

```tsx
import { ZaloTokenMonitor } from "@/components/zalo/token-monitor";

export default function DashboardPage() {
  return (
    <div>
      <ZaloTokenMonitor />
    </div>
  );
}
```

### 4. **Manual refresh token**

Nếu cần refresh thủ công, gọi API:

```bash
# Kiểm tra trạng thái
curl http://localhost:3000/api/zalo/token-status

# Force refresh
curl -X POST http://localhost:3000/api/zalo/token-status
```

## 🔧 Cơ chế hoạt động

### Flow tự động refresh:

```
1. Code gọi sendZaloMessage() hoặc hàm Zalo khác
   ↓
2. getZaloConfig() được gọi
   ↓
3. TokenManager.getValidAccessToken() kiểm tra token
   ↓
4. Nếu token còn > 5 phút → Trả về token hiện tại
   ↓
5. Nếu token còn < 5 phút → Gọi refresh API
   ↓
6. Lưu token mới vào memory + log ra console
   ↓
7. Trả về token mới cho API call
```

### Timing:

- **Token hết hạn sau:** 24 giờ (86400 giây)
- **Tự động refresh khi còn:** < 5 phút
- **Kiểm tra mỗi lần:** Gọi Zalo API

## 📝 Lưu ý quan trọng

### 1. **Token mới sau khi refresh**

Khi token được refresh, bạn sẽ thấy log trong console:

```
⚠️  LƯU Ý: Token mới đã được tạo. Cần cập nhật .env.local:
ZALO_ACCESS_TOKEN=<new_access_token>
ZALO_REFRESH_TOKEN=<new_refresh_token>
```

**Quan trọng:** Copy token mới và cập nhật vào `.env.local` để sử dụng sau khi restart server.

### 2. **Token trong memory vs .env**

- **Trong runtime:** Token được lưu trong memory, tự động refresh
- **Sau khi restart:** Token lấy từ `.env.local`

→ Cần cập nhật `.env.local` để tránh mất token mới sau khi restart.

### 3. **Multiple instances**

Nếu chạy nhiều instance của app (load balancer), mỗi instance sẽ có token manager riêng. Nên:
- Sử dụng centralized token storage (Redis, database)
- Hoặc chạy single instance cho development

### 4. **Error handling**

Nếu refresh thất bại:
- Token cũ vẫn được sử dụng
- Error được log ra console
- Cần kiểm tra lại ZALO_APP_SECRET và ZALO_REFRESH_TOKEN

## 🐛 Troubleshooting

### Token không tự động refresh?

1. Kiểm tra `.env.local` có đầy đủ thông tin:
   ```bash
   ZALO_APP_ID=<your_app_id>
   ZALO_APP_SECRET=<your_app_secret>
   ZALO_REFRESH_TOKEN=<your_refresh_token>
   ```

2. Kiểm tra console logs:
   ```
   [ZaloTokenManager] Token sắp hết hạn, đang refresh...
   [ZaloTokenManager] ✅ Token đã được refresh thành công!
   ```

3. Test refresh manually:
   ```bash
   curl -X POST http://localhost:3000/api/zalo/token-status
   ```

### Refresh token hết hạn?

Nếu ZALO_REFRESH_TOKEN hết hạn, cần lấy lại:

1. Truy cập Zalo OAuth: https://developers.zalo.me/
2. Login và authorize lại app
3. Copy access_token và refresh_token mới
4. Cập nhật vào `.env.local`
5. Restart server

## 📊 Monitoring

### Kiểm tra token status định kỳ:

```typescript
import { getZaloTokenManager } from "@/lib/zalo-token-manager";

const tokenManager = getZaloTokenManager();
const info = tokenManager.getTokenInfo();

console.log({
  hasToken: info.hasToken,
  expiresAt: info.expiresAt,
  expiresInMinutes: info.expiresInMinutes,
});
```

### Dashboard monitoring:

Thêm `ZaloTokenMonitor` component vào admin dashboard để theo dõi real-time.

## 🎓 Best Practices

1. **Luôn cập nhật .env.local sau khi refresh**
   - Copy token từ console logs
   - Paste vào `.env.local`
   - Commit vào git nếu cần (với .gitignore đúng)

2. **Monitor token status định kỳ**
   - Kiểm tra dashboard hàng ngày
   - Set up alerts khi token còn < 1 giờ

3. **Backup refresh token**
   - Lưu refresh token ở nơi an toàn
   - Có thể dùng để recover khi mất

4. **Test trước khi deploy**
   - Test refresh flow trong development
   - Đảm bảo token được refresh đúng

## 📚 Tài liệu liên quan

- [Zalo OAuth Documentation](https://developers.zalo.me/docs/api/official-account-api/xac-thuc-va-uy-quyen/cach-1-su-dung-ma-uy-quyen-code-lay-access-token-post-4307)
- [Zalo API v3.0 Migration](./ZALO-API-V3-MIGRATION.md)
- [Zalo Error Handling](./ZALO-ERROR-HANDLING.md)

---

**Tạo bởi:** Antigravity AI Assistant  
**Ngày:** 2026-01-07  
**Version:** 1.0
