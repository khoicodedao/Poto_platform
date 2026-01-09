# 🚀 Smart Zalo OA Messaging - Quota Optimization

## 📋 Tổng quan

Hệ thống gửi tin nhắn Zalo OA thông minh với tối ưu quota tự động:

```
1️⃣ Thử gửi Consultation (FREE) → ✅ Success → Done
                                → ❌ Error -213/-201 (48h rule)
                                   ↓
2️⃣ Tự động fallback sang Promotion (Trừ quota) → ✅ Success → Done
                                                 → ❌ Error → Return Error
```

### Lợi ích
- ✅ **Tiết kiệm quota**: Ưu tiên Consultation miễn phí
- ✅ **Tự động fallback**: Không cần xử lý thủ công
- ✅ **Theo dõi chi phí**: Track quota usage real-time
- ✅ **Batch processing**: Gửi hàng loạt với rate limiting

---

## 🔧 Implementation

### Node.js/TypeScript (Next.js)

#### Function: `sendSmartZaloMessage()`

```typescript
import { sendSmartZaloMessage } from "@/lib/zalo-integration";

async function sendToUser(zaloUserId: string) {
  const result = await sendSmartZaloMessage(
    zaloUserId,
    "📢 Xin chào! Đây là thông báo từ hệ thống",
    "attachment_abc123", // Promotion Attachment ID
    undefined // Optional custom access token
  );

  if (result.success) {
    console.log("✅ Message sent!");
    console.log("Type:", result.messageType); // "consultation" | "promotion"
    console.log("Quota used:", result.usedQuota); // false | true
    console.log("Message ID:", result.messageId);
  } else {
    console.error("❌ Failed:", result.error);
    console.error("Error code:", result.errorCode);
  }
}
```

#### Function: `batchSmartSend()`

```typescript
import { batchSmartSend } from "@/lib/zalo-integration";

async function sendToClass(studentZaloIds: string[]) {
  const result = await batchSmartSend(
    studentZaloIds,
    "📚 Bài tập mới đã được giao!",
    process.env.ZALO_ASSIGNMENT_ATTACHMENT_ID
  );

  console.log(`Total: ${result.total}`);
  console.log(`Success: ${result.success}/${result.total}`);
  console.log(`Failed: ${result.failed}`);
  console.log(`Consultation (FREE): ${result.consultationCount}`);
  console.log(`Promotion (PAID): ${result.promotionCount}`);
  console.log(`Quota Used: ${result.quotaUsed}/2000`);

  // Chi tiết từng user
  result.results.forEach((r) => {
    if (r.success) {
      console.log(`✅ ${r.userId}: ${r.messageType}`);
    } else {
      console.log(`❌ ${r.userId}: ${r.error}`);
    }
  });
}
```

---

### Python

```python
import requests
import json
from typing import Dict, List, Optional

class SmartZaloSender:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.consultation_endpoint = "https://openapi.zalo.me/v3.0/oa/message/cs"
        self.promotion_endpoint = "https://openapi.zalo.me/v2.0/oa/message"
    
    def send_smart_message(
        self, 
        user_id: str, 
        text_content: str, 
        promotion_attachment_id: Optional[str] = None
    ) -> Dict:
        """
        Gửi tin nhắn thông minh với auto-fallback
        
        Args:
            user_id: Zalo User ID
            text_content: Nội dung text
            promotion_attachment_id: Attachment ID cho Promotion fallback
            
        Returns:
            {
                'success': True/False,
                'message_id': 'xxx',
                'message_type': 'consultation' | 'promotion',
                'used_quota': True/False,
                'error': 'xxx' (if failed)
            }
        """
        
        # BƯỚC 1: Thử gửi Consultation
        print(f"[Smart Send] Step 1: Trying Consultation for {user_id}")
        
        consultation_payload = {
            "recipient": {"user_id": user_id},
            "message": {"text": text_content}
        }
        
        headers = {
            "Content-Type": "application/json",
            "access_token": self.access_token
        }
        
        try:
            response = requests.post(
                self.consultation_endpoint,
                headers=headers,
                json=consultation_payload
            )
            data = response.json()
            
            # Success
            if response.ok and data.get("error") == 0:
                print(f"✅ Consultation sent successfully!")
                return {
                    "success": True,
                    "message_id": data.get("data", {}).get("message_id"),
                    "message_type": "consultation",
                    "used_quota": False
                }
            
            # BƯỚC 2: Kiểm tra lỗi 48h
            error_code = data.get("error")
            is_48h_error = error_code in [-213, -201]
            
            print(f"⚠️ Consultation failed: Error {error_code}")
            
            if not is_48h_error:
                # Lỗi khác, không fallback
                return {
                    "success": False,
                    "message_type": "consultation",
                    "used_quota": False,
                    "error": data.get("message", f"Error {error_code}")
                }
            
            # BƯỚC 3: Fallback sang Promotion
            print(f"[Smart Send] Step 2: Falling back to Promotion")
            
            if not promotion_attachment_id:
                return {
                    "success": False,
                    "message_type": "consultation",
                    "used_quota": False,
                    "error": "Promotion requires attachment_id but none provided"
                }
            
            promotion_payload = {
                "recipient": {"user_id": user_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "promotion",
                            "elements": [
                                {"attachment_id": promotion_attachment_id}
                            ]
                        }
                    }
                }
            }
            
            promo_response = requests.post(
                self.promotion_endpoint,
                headers=headers,
                json=promotion_payload
            )
            promo_data = promo_response.json()
            
            if promo_response.ok and promo_data.get("error") == 0:
                print(f"✅ Promotion sent successfully!")
                return {
                    "success": True,
                    "message_id": promo_data.get("data", {}).get("message_id"),
                    "message_type": "promotion",
                    "used_quota": True  # Đã trừ quota
                }
            else:
                return {
                    "success": False,
                    "message_type": "promotion",
                    "used_quota": False,
                    "error": promo_data.get("message", f"Error {promo_data.get('error')}")
                }
                
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            return {
                "success": False,
                "message_type": "consultation",
                "used_quota": False,
                "error": str(e)
            }
    
    def batch_send(
        self, 
        user_ids: List[str], 
        text_content: str, 
        promotion_attachment_id: Optional[str] = None
    ) -> Dict:
        """Gửi hàng loạt với smart logic"""
        import time
        
        results = []
        stats = {
            "total": len(user_ids),
            "success": 0,
            "failed": 0,
            "consultation_count": 0,
            "promotion_count": 0,
            "quota_used": 0
        }
        
        for user_id in user_ids:
            result = self.send_smart_message(
                user_id, 
                text_content, 
                promotion_attachment_id
            )
            
            results.append({
                "user_id": user_id,
                **result
            })
            
            if result["success"]:
                stats["success"] += 1
                if result["message_type"] == "consultation":
                    stats["consultation_count"] += 1
                else:
                    stats["promotion_count"] += 1
                    stats["quota_used"] += 1
            else:
                stats["failed"] += 1
            
            # Rate limiting
            time.sleep(0.1)
        
        return {
            "summary": stats,
            "results": results
        }

# Usage
sender = SmartZaloSender(access_token="your_access_token")

# Single send
result = sender.send_smart_message(
    user_id="1234567890",
    text_content="📢 Thông báo từ hệ thống",
    promotion_attachment_id="abc123"
)
print(result)

# Batch send
batch_result = sender.batch_send(
    user_ids=["user1", "user2", "user3"],
    text_content="📚 Bài tập mới",
    promotion_attachment_id="abc123"
)
print(f"Quota used: {batch_result['summary']['quota_used']}/2000")
```

---

### PHP

```php
<?php

class SmartZaloSender {
    private $accessToken;
    private $consultationEndpoint = 'https://openapi.zalo.me/v3.0/oa/message/cs';
    private $promotionEndpoint = 'https://openapi.zalo.me/v2.0/oa/message';
    
    public function __construct($accessToken) {
        $this->accessToken = $accessToken;
    }
    
    /**
     * Gửi tin nhắn thông minh với auto-fallback
     * 
     * @param string $userId Zalo User ID
     * @param string $textContent Nội dung text
     * @param string|null $promotionAttachmentId Attachment ID cho Promotion
     * @return array Result array
     */
    public function sendSmartMessage($userId, $textContent, $promotionAttachmentId = null) {
        // BƯỚC 1: Thử gửi Consultation
        echo "[Smart Send] Step 1: Trying Consultation for {$userId}\n";
        
        $consultationPayload = [
            'recipient' => ['user_id' => $userId],
            'message' => ['text' => $textContent]
        ];
        
        $headers = [
            'Content-Type: application/json',
            'access_token: ' . $this->accessToken
        ];
        
        $ch = curl_init($this->consultationEndpoint);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($consultationPayload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $data = json_decode($response, true);
        
        // Success
        if ($httpCode == 200 && isset($data['error']) && $data['error'] === 0) {
            echo "✅ Consultation sent successfully!\n";
            return [
                'success' => true,
                'message_id' => $data['data']['message_id'] ?? null,
                'message_type' => 'consultation',
                'used_quota' => false
            ];
        }
        
        // BƯỚC 2: Kiểm tra lỗi 48h
        $errorCode = $data['error'] ?? -999;
        $is48hError = in_array($errorCode, [-213, -201]);
        
        echo "⚠️ Consultation failed: Error {$errorCode}\n";
        
        if (!$is48hError) {
            // Lỗi khác, không fallback
            return [
                'success' => false,
                'message_type' => 'consultation',
                'used_quota' => false,
                'error' => $data['message'] ?? "Error {$errorCode}"
            ];
        }
        
        // BƯỚC 3: Fallback sang Promotion
        echo "[Smart Send] Step 2: Falling back to Promotion\n";
        
        if (empty($promotionAttachmentId)) {
            return [
                'success' => false,
                'message_type' => 'consultation',
                'used_quota' => false,
                'error' => 'Promotion requires attachment_id but none provided'
            ];
        }
        
        $promotionPayload = [
            'recipient' => ['user_id' => $userId],
            'message' => [
                'attachment' => [
                    'type' => 'template',
                    'payload' => [
                        'template_type' => 'promotion',
                        'elements' => [
                            ['attachment_id' => $promotionAttachmentId]
                        ]
                    ]
                ]
            ]
        ];
        
        $ch2 = curl_init($this->promotionEndpoint);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($promotionPayload));
        curl_setopt($ch2, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        
        $promoResponse = curl_exec($ch2);
        $promoHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);
        
        $promoData = json_decode($promoResponse, true);
        
        if ($promoHttpCode == 200 && isset($promoData['error']) && $promoData['error'] === 0) {
            echo "✅ Promotion sent successfully!\n";
            return [
                'success' => true,
                'message_id' => $promoData['data']['message_id'] ?? null,
                'message_type' => 'promotion',
                'used_quota' => true // Đã trừ quota
            ];
        } else {
            return [
                'success' => false,
                'message_type' => 'promotion',
                'used_quota' => false,
                'error' => $promoData['message'] ?? "Error {$promoData['error']}"
            ];
        }
    }
    
    /**
     * Gửi hàng loạt với smart logic
     */
    public function batchSend($userIds, $textContent, $promotionAttachmentId = null) {
        $results = [];
        $stats = [
            'total' => count($userIds),
            'success' => 0,
            'failed' => 0,
            'consultation_count' => 0,
            'promotion_count' => 0,
            'quota_used' => 0
        ];
        
        foreach ($userIds as $userId) {
            $result = $this->sendSmartMessage($userId, $textContent, $promotionAttachmentId);
            
            $results[] = array_merge(['user_id' => $userId], $result);
            
            if ($result['success']) {
                $stats['success']++;
                if ($result['message_type'] === 'consultation') {
                    $stats['consultation_count']++;
                } else {
                    $stats['promotion_count']++;
                    $stats['quota_used']++;
                }
            } else {
                $stats['failed']++;
            }
            
            // Rate limiting
            usleep(100000); // 100ms
        }
        
        return [
            'summary' => $stats,
            'results' => $results
        ];
    }
}

// Usage
$sender = new SmartZaloSender('your_access_token');

// Single send
$result = $sender->sendSmartMessage(
    '1234567890',
    '📢 Thông báo từ hệ thống',
    'abc123'
);
print_r($result);

// Batch send
$batchResult = $sender->batchSend(
    ['user1', 'user2', 'user3'],
    '📚 Bài tập mới',
    'abc123'
);
echo "Quota used: {$batchResult['summary']['quota_used']}/2000\n";

?>
```

---

## 🔑 Lấy Attachment ID

### Cách 1: Tạo trên Zalo OA Console (GUI)

1. Truy cập https://oa.zalo.me/
2. Chọn OA của bạn
3. **Quản lý nội dung** → **Bài viết**
4. Click **Tạo bài viết mới**
5. Điền nội dung (tiêu đề, mô tả, hình ảnh)
6. Nhấn **Lưu**
7. Copy **Attachment ID** từ URL hoặc response

### Cách 2: API (Lấy danh sách attachments)

```bash
curl -X GET "https://openapi.zalo.me/v2.0/oa/article/getslice?offset=0&limit=10" \
  -H "access_token: YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "error": 0,
  "message": "Success",
  "data": {
    "articles": [
      {
        "id": "abc123xyz456",
        "title": "Thông báo quan trọng",
        "cover": "https://...",
        "description": "..."
      }
    ]
  }
}
```

### Cách 3: Tạo Article qua API

```typescript
const createArticle = async () => {
  const response = await fetch("https://openapi.zalo.me/v2.0/oa/article/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "access_token": process.env.ZALO_ACCESS_TOKEN!
    },
    body: JSON.stringify({
      title: "Thông báo từ hệ thống",
      description: "Nội dung thông báo",
      cover: "https://example.com/image.jpg",
      type: "promotion" // hoặc "normal"
    })
  });
  
  const data = await response.json();
  console.log("Attachment ID:", data.data.id);
};
```

---

## 🧪 Testing

### Test với cURL

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/zalo/smart-send \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "userId": "YOUR_ZALO_USER_ID",
    "textContent": "Test from cURL",
    "promotionAttachmentId": "YOUR_ATTACHMENT_ID"
  }'
```

### Test với Demo UI

1. Khởi động dev server: `npm run dev`
2. Import component:

```tsx
import { SmartZaloSendDemo } from "@/components/zalo/smart-send-demo";

export default function TestPage() {
  return <SmartZaloSendDemo />;
}
```

3. Truy cập `/your-test-page` trong browser

---

## 📊 Monitoring & Analytics

### Track Quota Usage

```typescript
// Tạo bảng để track quota
CREATE TABLE zalo_quota_logs (
  id SERIAL PRIMARY KEY,
  message_id VARCHAR(255),
  user_id VARCHAR(255),
  message_type VARCHAR(20), -- 'consultation' | 'promotion'
  used_quota BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

// Log mỗi lần gửi
await db.insert(zaloQuotaLogs).values({
  messageId: result.messageId,
  userId: zaloUserId,
  messageType: result.messageType,
  usedQuota: result.usedQuota,
});

// Query statistics
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN message_type = 'consultation' THEN 1 ELSE 0 END) as consultation_count,
  SUM(CASE WHEN message_type = 'promotion' THEN 1 ELSE 0 END) as promotion_count,
  SUM(CASE WHEN used_quota THEN 1 ELSE 0 END) as quota_used
FROM zalo_quota_logs
WHERE created_at >= NOW() - INTERVAL '30 days';
```

### Alert khi gần hết quota

```typescript
const checkQuota = async () => {
  const thisMonth = await db
    .select()
    .from(zaloQuotaLogs)
    .where(sql`EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())`)
    .where(eq(zaloQuotaLogs.usedQuota, true));
  
  const used = thisMonth.length;
  const limit = 2000;
  
  if (used > limit * 0.9) {
    // Alert admin
    await sendAlert(`⚠️ Zalo quota: ${used}/${limit} (${(used/limit*100).toFixed(1)}%)`);
  }
};
```

---

## ✅ Checklist

- [ ] Đã có Zalo OA (Free hoặc Premium)
- [ ] Đã có Access Token hợp lệ
- [ ] Đã tạo ít nhất 1 Article/Banner để lấy Attachment ID
- [ ] Đã lưu Attachment ID vào `.env`
- [ ] Test với 1 user trước (single mode)
- [ ] Test với 2-3 users (batch mode)
- [ ] Setup monitoring cho quota usage
- [ ] Document attachment IDs cho team

---

## 📚 References

- [Zalo OA Official Docs](https://developers.zalo.me/docs/official-account)
- [Zalo API v3.0 Migration Guide](https://developers.zalo.me/docs/api/official-account-api/api)
- [Error Codes Reference](https://developers.zalo.me/docs/api/official-account-api/phu-luc/ma-loi-post-3234)

---

**Author:** Antigravity AI  
**Date:** 2026-01-09  
**Version:** 1.0
