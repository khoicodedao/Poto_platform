# 🎯 Smart Zalo OA Integration - Quick Reference

## 📦 Files Created/Modified

### Core Implementation
```
lib/
├── zalo-integration.ts              ✅ UPDATED
│   ├── sendSmartZaloMessage()       NEW - Smart send với auto-fallback
│   └── batchSmartSend()             NEW - Batch send với quota tracking
│
├── types/
│   └── zalo-smart-send.ts           NEW - TypeScript type definitions
│
└── constants/
    └── zalo.ts                      NEW - Error codes, messages, helpers
```

### API Endpoints
```
app/api/zalo/
└── smart-send/
    └── route.ts                     NEW - POST endpoint (single/batch modes)
```

### Components
```
components/zalo/
└── smart-send-demo.tsx              NEW - Demo UI component
```

### Documentation
```
docs/
├── ZALO_SMART_SEND.md               NEW - Full documentation (TS/Python/PHP)
└── SUMMARY_SMART_ZALO.md            NEW - Quick summary

.agent/workflows/
└── zalo-oa-integration.md           UPDATED - Added Part 4: Smart Messaging

scripts/
└── test-smart-zalo.ts               NEW - Test suite
```

---

## ⚡ Quick Start (3 bước)

### 1. Lấy Attachment ID
```bash
# Đăng nhập https://oa.zalo.me/
# Tạo Article/Banner → Copy ID
```

### 2. Config Environment
```env
# .env.local
ZALO_DEFAULT_ATTACHMENT_ID=abc123xyz
```

### 3. Sử dụng
```typescript
import { sendSmartZaloMessage } from "@/lib/zalo-integration";

const result = await sendSmartZaloMessage(
  zaloUserId,
  "Tin nhắn test",
  process.env.ZALO_DEFAULT_ATTACHMENT_ID
);

console.log(result.messageType);  // "consultation" | "promotion"
console.log(result.usedQuota);    // false | true
```

---

## 🔄 Luồng hoạt động

```
User Request
     ↓
sendSmartZaloMessage()
     ↓
[1] Try Consultation (FREE)
     ├─ Success → Return (usedQuota: false)
     └─ Error -213/-201 (48h rule)?
          ├─ YES → [2] Fallback to Promotion (PAID)
          │        └─ Return (usedQuota: true)
          └─ NO → Return error
```

---

## 📊 Usage Examples

### Single Send
```typescript
const result = await sendSmartZaloMessage(
  "1234567890",
  "📢 Thông báo",
  "attachment_id"
);
```

### Batch Send
```typescript
const result = await batchSmartSend(
  ["user1", "user2", "user3"],
  "📚 Bài tập mới",
  "attachment_id"
);

console.log(`Quota: ${result.quotaUsed}/2000`);
```

### API Call
```bash
curl -X POST /api/zalo/smart-send \
  -d '{"mode":"single","userId":"123","textContent":"Test"}'
```

---

## 🎨 Import cheat sheet

```typescript
// Main functions
import { 
  sendSmartZaloMessage, 
  batchSmartSend 
} from "@/lib/zalo-integration";

// Types
import type { 
  SmartZaloMessageResult,
  BatchSmartSendResult 
} from "@/lib/types/zalo-smart-send";

// Constants
import { 
  ZALO_ERROR_CODES,
  QUOTA_CONFIG,
  is48HourError 
} from "@/lib/constants/zalo";

// Demo component
import { SmartZaloSendDemo } from "@/components/zalo/smart-send-demo";
```

---

## 🚨 Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `-213` | 48h no interaction | → Auto fallback Promotion ✅ |
| `-201` | Not followed OA | → Return error ❌ |
| `-124` | Token expired | → Auto refresh 🔄 |
| `-216` | Quota exceeded | → Alert admin 🚨 |

---

## 📈 Monitoring

### Track quota usage
```typescript
import { QUOTA_CONFIG, formatQuotaDisplay } from "@/lib/constants/zalo";

// Lấy quota đã dùng
const used = await getQuotaUsed();
console.log(formatQuotaDisplay(used));
// Output: ✅ 150/2000 (8%)
```

### Alert khi gần hết
```typescript
import { isQuotaNearLimit } from "@/lib/constants/zalo";

if (isQuotaNearLimit(quotaUsed)) {
  await sendAdminAlert("⚠️ Quota gần hết!");
}
```

---

## ✅ Checklist

- [ ] Tạo Attachment ID trên Zalo OA Console
- [ ] Lưu vào `.env`: `ZALO_DEFAULT_ATTACHMENT_ID`
- [ ] Test single mode
- [ ] Test batch mode
- [ ] Setup quota monitoring
- [ ] Document cho team

---

## 📚 Docs

- **Workflow**: `.agent/workflows/zalo-oa-integration.md` (Phần 4)
- **Full Guide**: `docs/ZALO_SMART_SEND.md`
- **Summary**: `docs/SUMMARY_SMART_ZALO.md`
- **This file**: Quick reference

---

## 🎓 Next Steps

1. **Integrate vào existing endpoints**
   ```typescript
   // Thay thế sendZaloMessage() cũ
   const result = await sendSmartZaloMessage(...);
   ```

2. **Add quota tracking**
   ```typescript
   await logQuotaUsage(result);
   ```

3. **Setup alerts**
   ```typescript
   if (quotaUsed > 1800) alert("Quota gần hết!");
   ```

---

**Version:** 1.0  
**Date:** 2026-01-09  
**Ready:** ✅ Production ready
