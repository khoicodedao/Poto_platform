# Phase 3: Setup & Deployment Guide

## Quick Start

### 1. Database Migration

```bash
# Apply Phase 3 schema changes
psql -U admin -d eduplatform_local -f db/migrations/004_add_phase3_assignment_scheduling.sql

# Verify
psql -U admin -d eduplatform_local -c \
  "SELECT id, title, is_visible, auto_release_enabled, scheduled_release_at FROM assignments LIMIT 5;"
```

### 2. Cron Job Configuration

Choose **one** of the following options:

#### Option A: Vercel (Recommended for Vercel Deployments)

Create/update `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-release-assignments",
      "schedule": "0 8 * * 1",
      "description": "Release assignments every Monday at 8 AM"
    },
    {
      "path": "/api/cron/auto-close-assignments",
      "schedule": "59 23 * * 5",
      "description": "Close assignments every Friday at 11:59 PM"
    },
    {
      "path": "/api/cron/assignment-reminders",
      "schedule": "*/30 * * * *",
      "description": "Send assignment reminders every 30 minutes"
    },
    {
      "path": "/api/cron/send-reminders",
      "schedule": "*/5 * * * *",
      "description": "Send pending notifications every 5 minutes"
    },
    {
      "path": "/api/cron/create-reminders",
      "schedule": "*/10 * * * *",
      "description": "Create session reminders every 10 minutes"
    }
  ]
}
```

Deploy:

```bash
vercel deploy
```

#### Option B: GitHub Actions

Create `.github/workflows/scheduled-tasks.yml`:

```yaml
name: Scheduled Tasks
on:
  schedule:
    # Release assignments Monday 8 AM
    - cron: "0 8 * * 1"
    # Close assignments Friday 11:59 PM
    - cron: "59 23 * * 5"
    # Send reminders every 5 minutes
    - cron: "*/5 * * * *"

jobs:
  release-assignments:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            ${{ secrets.API_URL }}/api/cron/auto-release-assignments

  close-assignments:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            ${{ secrets.API_URL }}/api/cron/auto-close-assignments

  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST \
            -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            ${{ secrets.API_URL }}/api/cron/send-reminders
```

#### Option C: External Cron Service (cron-job.org, EasyCron, etc.)

1. Go to https://cron-job.org/en/
2. Create account
3. Add new cron jobs:

| Name                | URL                                                                                  | Schedule           | Interval     |
| ------------------- | ------------------------------------------------------------------------------------ | ------------------ | ------------ |
| Release Assignments | `https://yourdomain.com/api/cron/auto-release-assignments?x-cron-secret=YOUR_SECRET` | Monday 8:00 AM UTC | Weekly       |
| Close Assignments   | `https://yourdomain.com/api/cron/auto-close-assignments?x-cron-secret=YOUR_SECRET`   | Friday 23:59 UTC   | Weekly       |
| Send Reminders      | `https://yourdomain.com/api/cron/send-reminders?x-cron-secret=YOUR_SECRET`           | Every 5 minutes    | Every 5 mins |

#### Option D: Self-Hosted Docker/Linux (crontab)

```bash
# Edit crontab
crontab -e

# Add these lines (adjust times for your timezone):

# Release assignments every Monday at 8 AM
0 8 * * 1 curl -H "x-cron-secret: $CRON_SECRET" http://localhost:5001/api/cron/auto-release-assignments

# Close assignments every Friday at 11:59 PM
59 23 * * 5 curl -H "x-cron-secret: $CRON_SECRET" http://localhost:5001/api/cron/auto-close-assignments

# Send reminders every 5 minutes
*/5 * * * * curl -H "x-cron-secret: $CRON_SECRET" http://localhost:5001/api/cron/send-reminders

# Create session reminders every 10 minutes
*/10 * * * * curl -H "x-cron-secret: $CRON_SECRET" http://localhost:5001/api/cron/create-reminders
```

### 3. Environment Variables

Ensure `.env.local` has:

```env
# Must be set for cron to work
CRON_SECRET=your-super-secret-cron-key-here

# Zalo integration (already configured in Phase 2)
ZALO_ACCESS_TOKEN=your-token
ZALO_OA_ID=your-oa-id
```

## Testing

### Test 1: Create Assignment with Auto-Release

```bash
# 1. Create assignment scheduled to release in 2 minutes
ASSIGNMENT_TIME=$(date -u -d "+2 minutes" +%Y-%m-%dT%H:%M:%SZ)
DUE_TIME=$(date -u -d "+5 days" +%Y-%m-%dT%H:%M:%SZ)

curl -X POST http://localhost:5001/api/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Auto-Release Assignment",
    "classId": 1,
    "description": "This assignment will auto-release in 2 minutes",
    "scheduledReleaseAt": "'$ASSIGNMENT_TIME'",
    "dueDate": "'$DUE_TIME'",
    "autoReleaseEnabled": true,
    "maxScore": 100
  }'

# Note the returned assignment ID
# Response: { "id": 123, "isVisible": false, "scheduledReleaseAt": ... }
```

### Test 2: Verify Auto-Release Works

```bash
# Wait ~2 minutes, then trigger cron manually
curl -X POST \
  -H "x-cron-secret: your-test-secret" \
  http://localhost:5001/api/cron/auto-release-assignments

# Check logs for:
# [Cron] Starting assignment auto-release job...
# [Cron] Found assignments to release: { count: 1 }
# [Cron] Released assignment { id: 123, ... }
```

### Test 3: Verify Assignment is Now Visible

```bash
curl http://localhost:5001/api/assignments/123

# Response should have:
# "isVisible": true,
# "releasedAt": "2024-03-18T...",
# "scheduledReleaseAt": "2024-03-18T..."
```

### Test 4: Test Auto-Close

```bash
# 1. Create assignment to close in 2 minutes
CLOSE_TIME=$(date -u -d "+2 minutes" +%Y-%m-%dT%H:%M:%SZ)

curl -X POST http://localhost:5001/api/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Auto-Close Assignment",
    "classId": 1,
    "scheduledCloseAt": "'$CLOSE_TIME'",
    "autoCloseEnabled": true
  }'

# 2. Wait 2 minutes and trigger
curl -X POST \
  -H "x-cron-secret: your-test-secret" \
  http://localhost:5001/api/cron/auto-close-assignments

# 3. Verify closed_at is set
curl http://localhost:5001/api/assignments/[id]
# Should show "closedAt": "2024-03-18T..."
```

## Troubleshooting

### Issue: Cron jobs not running

**Solution:**

1. Verify `CRON_SECRET` is set and matches in requests
2. Check endpoint is accessible: `curl http://localhost:5001/api/cron/auto-release-assignments`
3. Verify cron config is deployed: `vercel env list` (Vercel) or check GitHub workflows
4. Check logs for errors

### Issue: Assignments not auto-releasing

**Solution:**

1. Verify assignment has `autoReleaseEnabled: true`
2. Check `scheduledReleaseAt` time has passed
3. Verify `isVisible: false` before release time
4. Manually trigger: `curl -X POST -H "x-cron-secret: ..." /api/cron/auto-release-assignments`

### Issue: Wrong timezone for schedules

**Problem:** Assignments release at 8 AM UTC, but students expect 8 AM their timezone

**Solution:**

1. Update cron schedule to your timezone
2. Or add `TIMEZONE=Asia/Ho_Chi_Minh` to env and adjust in code:

```typescript
const now = new Date();
const adjusted = new Date(
  now.toLocaleString("en-US", { timeZone: process.env.TIMEZONE })
);
```

## Monitoring

### Check Cron Execution (Vercel)

```bash
vercel logs [deployment-url] --type lambda
```

### Check Cron Execution (GitHub Actions)

GitHub Actions tab → Scheduled Tasks → View logs

### Monitor via Logs

All cron activity is logged with `[Cron]` prefix:

```bash
# View real-time logs
tail -f logs/app.log | grep "\[Cron\]"
```

Expected logs:

```
[Cron] Starting assignment auto-release job...
[Cron] Found assignments to release: { count: 2 }
[Cron] Released assignment { id: 1, title: 'Math', classId: 5 }
[Cron] Released assignment { id: 2, title: 'Science', classId: 5 }
[Cron] Assignment auto-release job completed: { released: 2, failed: 0 }
```

## Configuration Examples

### Weekly Assignment Schedule

Teacher wants assignments released Monday 8 AM, due Friday 11:59 PM:

```typescript
await createAssignment({
  title: "Weekly Math Problems",
  classId: 5,
  scheduledReleaseAt: new Date("2024-03-18T08:00:00"), // Monday
  dueDate: new Date("2024-03-22T23:59:59"), // Friday
  scheduledCloseAt: new Date("2024-03-22T23:59:59"),
  autoReleaseEnabled: true,
  autoCloseEnabled: true,
  maxScore: 100,
});
```

### Immediate Assignment (No Auto-Release)

Teacher creates assignment available immediately:

```typescript
await createAssignment({
  title: "Reading Assignment",
  classId: 5,
  dueDate: new Date("2024-03-25T23:59:59"),
  autoReleaseEnabled: false, // Available now
  isVisible: true,
});
```

### Assignment with Manual Close

Teacher wants to review submissions before closing:

```typescript
await createAssignment({
  title: "Project Submission",
  classId: 5,
  dueDate: new Date("2024-03-25T23:59:59"),
  autoCloseEnabled: false, // Teacher closes manually
  allowPartialSubmission: false,
});
```

## Performance Optimization

### High Volume of Assignments

If system has 1000+ assignments:

1. **Add pagination** to cron queries (already in place: `LIMIT 100`)
2. **Distribute processing** across multiple cron jobs
3. **Use batch updates** instead of per-record updates

```typescript
// Batch update (more efficient)
await db
  .update(assignments)
  .set({ isVisible: true, releasedAt: new Date() })
  .where(conditions);
```

### High Volume of Students

If class has 500+ students:

1. **Batch notification creation** (current: creates one at a time)
2. **Use Zalo broadcast API** instead of individual messages
3. **Queue system** for sending (Bull, Bull MQ, Inngest)

## Next Steps

1. ✅ Database schema updated
2. ✅ Server actions implemented
3. ✅ Cron endpoints created
4. ⏳ **Deploy to production** (your next step)
5. ⏳ Configure cron scheduler (Vercel/GitHub/External)
6. ⏳ Test with real assignments
7. ⏳ Monitor and adjust schedules based on feedback

## Support

For issues:

- Check logs for `[Assignment]` and `[Cron]` prefixes
- Verify database migration ran successfully
- Test endpoints manually with `curl`
- Check `CRON_SECRET` environment variable

---

**Phase 3 Ready for Deployment! 🚀**
