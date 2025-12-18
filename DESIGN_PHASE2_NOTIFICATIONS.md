# Phase 2: Notification System & Zalo Integration

## Overview

Phase 2 implements a comprehensive notification system with Zalo integration for the EduPlatform. This phase enables the platform to send automated reminders (4 hours before, 10 minutes before class) and report notifications to students and parents via Zalo, the primary messaging platform in Vietnam.

## Architecture

### Components

1. **Database Schema** (`db/schema.ts`)

   - `notifications` table: Core notification records
   - `notificationTemplates` table: Message templates for customization
   - Enums: `notificationType`, `notificationStatus`, `notificationChannel`
   - New fields: `zaloUserId` (users), `zaloGroupId` (classes)

2. **Server Actions** (`lib/actions/notifications.ts`)

   - `createNotification()` - Create notification record
   - `sendNotification()` - Mark sent and record Zalo message ID
   - `getPendingNotificationsToSend()` - Fetch for cron job
   - `getNotificationTemplate()` - Fetch template by type/channel
   - `formatNotificationTemplate()` - Variable substitution

3. **Zalo Integration** (`lib/zalo-integration.ts`)

   - `sendZaloMessage()` - Send to individual user
   - `sendZaloGroupMessage()` - Send to class group
   - `verifyZaloWebhookSignature()` - Webhook security
   - `parseZaloWebhook()` - Parse incoming events
   - `testZaloConnection()` - Diagnostic tool

4. **API Endpoints**

   - POST/GET `/api/notifications` - Create and list
   - GET/PATCH `/api/notifications/[id]` - Get and update status
   - POST `/api/webhooks/zalo` - Zalo webhook receiver
   - POST `/api/cron/send-reminders` - Scheduled notification dispatcher
   - POST `/api/cron/create-reminders` - Auto-reminder creator

5. **Scheduler Service** (`lib/schedulers/reminder-scheduler.ts`)
   - `createSessionReminders()` - Create reminders when session created
   - `cancelSessionReminders()` - Cancel on session cancellation
   - Integration hook for class session creation flow

## Database Schema

### notifications table

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type notification_type (reminder|report|assignment|attendance|general),
  title VARCHAR(255),
  message TEXT,
  recipient_id INTEGER REFERENCES users(id),
  class_id INTEGER REFERENCES classes(id),
  related_session_id INTEGER REFERENCES class_sessions(id),
  related_assignment_id INTEGER REFERENCES assignments(id),

  -- Zalo tracking
  zalo_message_id VARCHAR(255),
  sent_via notification_channel (app|zalo|email),
  sent_at TIMESTAMP,

  -- Scheduling
  scheduled_send_at TIMESTAMP,
  status notification_status (pending|sent|failed|delivered),
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW()
)
```

### notificationTemplates table

```sql
CREATE TABLE notification_templates (
  id SERIAL PRIMARY KEY,
  type notification_type,
  name VARCHAR(255),
  title_template VARCHAR(255),
  message_template TEXT,
  channel notification_channel,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(type, channel)
)
```

### Default Templates

**4-Hour Before Reminder:**

- Title: "🎓 Nhắc lịch học"
- Message: "Buổi học "{sessionTitle}" sẽ bắt đầu lúc {scheduledTime}. Các em hãy chuẩn bị kỹ!"

**10-Minute Before Reminder:**

- Title: "⏰ Chuẩn bị vào lớp"
- Message: "Buổi học sắp bắt đầu (10 phút nữa). Vào app EduPlatform ngay!"

**Session Report:**

- Title: "📊 Báo cáo buổi học"
- Message: "Báo cáo {sessionTitle}: {attendanceCount}/{totalStudents} học sinh có mặt"

## Workflow

### Creating Reminders for a Session

1. **Teacher creates class session** (Phase 1)

   ```
   POST /api/class-sessions
   ```

2. **Reminder scheduler triggered** (automatically)

   ```typescript
   createSessionReminders({
     id: 123,
     classId: 5,
     title: "Toán học buổi 1",
     scheduledAt: "2024-03-15 14:00",
   });
   ```

3. **Creates 2 notification records**

   - Notification 1: 4h before (2024-03-15 10:00)
   - Notification 2: 10m before (2024-03-15 13:50)

4. **Cron job sends at scheduled time**

   ```
   POST /api/cron/send-reminders?x-cron-secret=secret
   ```

5. **Notification sent via Zalo**

   ```
   POST https://graph.zalo.me/v3.0/me/message
   {
     "recipient_id": "user_zalo_id",
     "message": { "text": "Buổi học sắp bắt đầu..." }
   }
   ```

6. **Zalo webhook confirms delivery**
   ```
   POST /api/webhooks/zalo
   {
     "event": "notification_delivered",
     "message_id": "zalo_msg_123"
   }
   ```

## Environment Configuration

```env
# Zalo Integration
ZALO_ACCESS_TOKEN=your-zalo-oa-access-token
ZALO_OA_ID=your-zalo-oa-id
ZALO_WEBHOOK_SIGN_KEY=your-webhook-sign-key
ZALO_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token

# Cron Jobs
CRON_SECRET=your-cron-secret-key
```

## Setup Instructions

### 1. Database Migration

```bash
# Apply schema changes
psql -U admin -d eduplatform_local -f db/migrations/002_add_phase2_notifications.sql

# Apply Zalo fields
psql -U admin -d eduplatform_local -f db/migrations/003_add_zalo_fields.sql
```

### 2. Zalo OA Setup

1. Create Official Account (OA) on Zalo
2. Get Access Token from Zalo Developer Console
3. Configure webhook in Zalo Dashboard:
   - URL: `https://yourdomain.com/api/webhooks/zalo`
   - Verify token: Generate random string
4. Add `ZALO_ACCESS_TOKEN`, `ZALO_OA_ID`, etc. to `.env.local`

### 3. Cron Job Setup

**Option A: Vercel Cron Functions**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/create-reminders",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

**Option B: External Cron Service**

```bash
# Using cron-job.org or similar
# Every 5 minutes
curl -H "x-cron-secret: your-secret" https://yourdomain.com/api/cron/send-reminders
```

**Option C: GitHub Actions**

```yaml
# .github/workflows/send-reminders.yml
name: Send Notifications
on:
  schedule:
    - cron: "*/5 * * * *"
jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            https://yourdomain.com/api/cron/send-reminders
```

## API Documentation

### POST /api/notifications

Create a new notification

```typescript
Request:
{
  type: "reminder" | "report" | "assignment" | "attendance" | "general",
  title: string,
  message: string,
  recipientId: number,
  classId: number,
  relatedSessionId?: number,
  relatedAssignmentId?: number,
  sentVia?: "app" | "zalo" | "email",
  scheduledSendAt?: ISO8601 date string
}

Response: 201
{
  id: number,
  type: string,
  title: string,
  message: string,
  recipientId: number,
  classId: number,
  status: "pending",
  scheduledSendAt: timestamp,
  createdAt: timestamp
}
```

### GET /api/notifications

List user's notifications (paginated)

```typescript
Query params:
- limit: number (default 20)
- offset: number (default 0)

Response: 200
{
  data: Notification[],
  total: number,
  limit: number,
  offset: number
}
```

### PATCH /api/notifications/[id]

Update notification status

```typescript
Request:
{
  status: "sent" | "failed",
  zaloMessageId?: string,
  errorMessage?: string
}

Response: 200 Notification
```

### POST /api/webhooks/zalo

Zalo webhook endpoint

```typescript
Events handled:
- notification_received: Message delivered
- notification_read: Message read by user
- user_send_message: User replied to OA
- user_send_attachment: User sent file
```

### POST /api/cron/send-reminders

Dispatch all pending notifications

```bash
curl -X POST \
  -H "x-cron-secret: your-secret" \
  https://yourdomain.com/api/cron/send-reminders

Response:
{
  success: true,
  processed: number,
  succeeded: number,
  failed: number,
  timestamp: ISO8601
}
```

## Notification Types

### Reminder (Type: reminder)

- **Trigger:** Automatically 4h and 10m before session
- **Recipients:** All students in class
- **Channel:** Zalo (primary), App (fallback)
- **Message:** Customized with session time

### Report (Type: report)

- **Trigger:** After session ends (manually by teacher)
- **Recipients:** All students in class
- **Channel:** Zalo (to group), App
- **Content:** Attendance count, summary, key points

### Assignment (Type: assignment)

- **Trigger:** When assignment created, 1 day before due, at due time
- **Recipients:** All students in class
- **Channel:** Zalo
- **Content:** Title, due date, submission link

### Attendance (Type: attendance)

- **Trigger:** If student marked absent, contact parent
- **Recipients:** Parent via their Zalo
- **Channel:** Zalo (direct), Email
- **Purpose:** Real-time alert for missing students

## Error Handling

### Failed Notification Retry

```typescript
// Automatic retry for failed notifications
// Retried after 1 hour if status is 'failed'
POST / api / cron / send - reminders;
```

### Logging

All notification operations are logged with `[Notification]` prefix:

```
[Notification] Created notification { id: 1, type: 'reminder' }
[Notification] Sent notification { id: 1, zaloId: '123' }
[Notification] Error: Zalo API error: Invalid access token
```

## Zalo Integration Details

### Message Format

```json
{
  "recipient_id": "0123456789",
  "message": {
    "text": "Buổi học sắp bắt đầu..."
  }
}
```

### Webhook Signature Verification

```typescript
// Header: x-zalo-signature
// Body: Raw request body
const hash = HMAC_SHA256(body, webhookSignKey);
```

### Webhook Events

- `notification_received`: Delivered to user device
- `notification_read`: User read message
- `user_send_message`: User replied
- `notification_failed`: Delivery failed

## Testing

### Manual Test: Send Reminder

```bash
# 1. Create session
curl -X POST http://localhost:5001/api/class-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "classId": 1,
    "title": "Math Class",
    "scheduledAt": "2024-03-15T14:00:00Z",
    "durationMinutes": 60,
    "sessionNumber": 1
  }'

# 2. Verify notifications created
curl http://localhost:5001/api/notifications

# 3. Trigger cron job
curl -X POST \
  -H "x-cron-secret: test-secret" \
  http://localhost:5001/api/cron/send-reminders

# 4. Check Zalo message logs
```

### Testing Zalo Connection

```typescript
import { testZaloConnection } from "@/lib/zalo-integration";

const result = await testZaloConnection();
console.log(result);
// { success: true, data: {...} }
```

### Testing Webhook

```bash
# Simulate Zalo webhook
curl -X POST http://localhost:5001/api/webhooks/zalo \
  -H "Content-Type: application/json" \
  -H "x-zalo-signature: your-signature" \
  -d '{
    "event": "notification_received",
    "message_id": "zalo_msg_123",
    "timestamp": 1710508800
  }'
```

## Monitoring

### Key Metrics

- Notifications created per day
- Notification success rate (sent/failed)
- Zalo API response times
- Failed notifications (for retry)
- Webhook delivery confirmation

### Logs to Monitor

```
[Notification] Created notification
[Notification] Sent notification
[Notification] Error
[Zalo] Message sent successfully
[Zalo] Error sending message
[Cron] Starting notification send job
[Webhook] Received Zalo webhook
```

## Known Limitations & Future Improvements

### Current Limitations

1. **No batching:** Sends individual messages (consider Zalo broadcast API)
2. **Single template per type:** Could support multiple variants
3. **No persistence of read status:** Only created/sent/failed tracked
4. **Manual webhook setup:** Could be automated in admin panel

### Future Enhancements

1. **Email integration** (SendGrid, AWS SES)
2. **SMS notifications** (Twilio) for critical alerts
3. **Rich media** in Zalo (cards, buttons, links)
4. **Notification preferences** per user (frequency, channels)
5. **Analytics dashboard** (delivery rates, engagement)
6. **Parent notification routing** (mom/dad/guardian)
7. **Bulk notifications** via Zalo broadcast API
8. **Message scheduling** (defer sends during non-business hours)

## Database Relationships

```
users (1) ──→ (∞) notifications
classes (1) ──→ (∞) notifications
classSessions (1) ──→ (∞) notifications
assignments (1) ──→ (∞) notifications
notificationTemplates ──→ type-based message formatting
```

## Files Created/Modified

### Created

- `db/schema.ts` - Added notification tables and enums
- `db/migrations/002_add_phase2_notifications.sql` - Migration script
- `db/migrations/003_add_zalo_fields.sql` - Zalo field migration
- `lib/actions/notifications.ts` - Server actions
- `lib/zalo-integration.ts` - Zalo API module
- `lib/schedulers/reminder-scheduler.ts` - Reminder creation service
- `app/api/notifications/route.ts` - Notification CRUD
- `app/api/notifications/[id]/route.ts` - Notification detail
- `app/api/webhooks/zalo/route.ts` - Webhook handler
- `app/api/cron/send-reminders/route.ts` - Notification dispatcher
- `app/api/cron/create-reminders/route.ts` - Auto-reminder creator

### Modified

- `.env.example` - Added Zalo config variables
- `db/schema.ts` - Added `zaloUserId` to users, `zaloGroupId` to classes

## Related Phases

- **Phase 1:** Class Management (sessions, attendance) ✅
- **Phase 2:** Notifications & Zalo (current) 🔄
- **Phase 3:** Assignment Auto-Release & Scheduling (pending)
- **Phase 4:** Analytics & Dashboard (pending)

---

**Status:** Phase 2 implementation complete. Ready for database migration and Zalo configuration.
