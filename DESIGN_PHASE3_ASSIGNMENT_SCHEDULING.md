# Phase 3: Assignment Auto-Release & Scheduling

## Overview

Phase 3 implements automatic assignment lifecycle management. Teachers can schedule assignments to be automatically released, closed, and remind students at optimal times. This eliminates manual tasks and ensures consistent student communication.

## Features

### 1. Auto-Release Assignments

- **Trigger:** Monday 8:00 AM (configurable)
- **Action:** Assignment becomes visible to students
- **Notification:** "📝 Bài tập tuần này - New assignment available"
- **Use Case:** Consistent weekly assignment schedule

### 2. Auto-Close Submissions

- **Trigger:** Friday 11:59 PM (configurable)
- **Action:** Stop accepting new submissions
- **Notification:** "⏰ Bài tập đã đóng - No more submissions accepted"
- **Use Case:** Prevent late submissions, enable weekend grading

### 3. Assignment Reminders

- **1 Day Before:** "Nhắc nộp bài tập - 1 day left to submit"
- **10 Minutes Before:** "⏰ Chuẩn bị nộp bài - 10 minutes left"
- **Use Case:** Reduce forgotten submissions

### 4. Auto-Grade Scheduling

- **Trigger:** Sunday evening (configurable)
- **Action:** Alert teachers that grading is ready
- **Notification:** "📊 Grading Ready - X assignments pending"
- **Use Case:** Organized grading workflow

## Database Schema

### assignments table (Extended)

```sql
ALTER TABLE assignments ADD COLUMNS:
  - created_by_id INTEGER (FK: users.id)
  - released_at TIMESTAMP
  - closed_at TIMESTAMP
  - scheduled_release_at TIMESTAMP (when auto-release will happen)
  - scheduled_close_at TIMESTAMP (when auto-close will happen)
  - scheduled_grade_at TIMESTAMP (when grading reminder fires)
  - auto_release_enabled BOOLEAN (default: false)
  - auto_close_enabled BOOLEAN (default: false)
  - allow_partial_submission BOOLEAN (allow late submissions with penalty)
  - is_visible BOOLEAN (currently visible to students)
```

### Example Records

**Weekly Schedule Assignment:**

```json
{
  "id": 1,
  "title": "Math Problem Set Week 1",
  "classId": 5,
  "createdById": 2,
  "scheduledReleaseAt": "2024-03-18T08:00:00Z",
  "dueDate": "2024-03-21T23:59:59Z",
  "scheduledCloseAt": "2024-03-21T23:59:59Z",
  "scheduledGradeAt": "2024-03-24T18:00:00Z",
  "autoReleaseEnabled": true,
  "autoCloseEnabled": true,
  "isVisible": false,
  "releasedAt": null,
  "closedAt": null,
  "maxScore": 100
}
```

## API Endpoints

### POST /api/assignments

Create new assignment with auto-scheduling

```typescript
Request:
{
  title: string,
  description?: string,
  classId: number,
  scheduledReleaseAt?: "2024-03-18T08:00:00Z",
  dueDate?: "2024-03-21T23:59:59Z",
  scheduledCloseAt?: "2024-03-21T23:59:59Z",
  maxScore?: 100,
  autoReleaseEnabled?: true,
  autoCloseEnabled?: true,
  allowPartialSubmission?: false
}

Response: 201 Created
{
  id: 1,
  title: string,
  isVisible: false,
  scheduledReleaseAt: timestamp,
  status: "pending" (scheduled)
}
```

### GET /api/assignments

List all assignments (teacher view shows hidden ones)

### GET /api/assignments/[id]

Get assignment details with submission stats

## Workflow Example

### Teacher Creates Weekly Assignment (Monday 8 AM Release)

```typescript
// Step 1: Teacher creates assignment
await createAssignment({
  title: "Math Problem Set - Week 1",
  classId: 5,
  description: "Chapters 1-3 problems",
  scheduledReleaseAt: new Date("2024-03-18T08:00:00"), // Monday 8 AM
  dueDate: new Date("2024-03-21T23:59:59"), // Friday 11:59 PM
  scheduledCloseAt: new Date("2024-03-21T23:59:59"),
  scheduledGradeAt: new Date("2024-03-24T18:00:00"), // Sunday 6 PM
  autoReleaseEnabled: true,
  autoCloseEnabled: true,
  maxScore: 100,
});
// Response: Assignment created with isVisible: false, status: pending
```

### Cron Job: Auto-Release (Every Monday 8 AM)

```
/api/cron/auto-release-assignments?x-cron-secret=secret
```

1. **Fetch:** Get all assignments where `scheduledReleaseAt <= NOW` and `isVisible = false`
2. **Release:** Update `isVisible = true`, set `releasedAt = NOW`
3. **Notify:** Send "📝 Assignment Released" via Zalo to all students
4. **Result:** Assignment appears on student dashboard

### Cron Job: Reminders (Every 30 minutes)

```
/api/cron/assignment-reminders?x-cron-secret=secret
```

For each assignment with `dueDate approaching`:

- **24 hours before:** "Nhắc nộp bài tập - 1 day left"
- **10 minutes before:** "⏰ Chuẩn bị nộp bài - 10 minutes"

### Cron Job: Auto-Close (Every Friday 11:59 PM)

```
/api/cron/auto-close-assignments?x-cron-secret=secret
```

1. **Fetch:** Get all assignments where `scheduledCloseAt <= NOW` and `closedAt = null`
2. **Close:** Update `closedAt = NOW`
3. **Notify:** "⏰ Assignment Closed" to students who haven't submitted
4. **Result:** No new submissions accepted

### Cron Job: Grading Notification (Every Sunday 6 PM)

```
/api/cron/assignment-grading-ready?x-cron-secret=secret
```

1. **Query:** Get assignments with `scheduledGradeAt <= NOW` and ungraded submissions
2. **Notify:** Alert teacher: "📊 Grading Ready - 25 submissions pending"
3. **Provide:** Direct link to grading dashboard

## Cron Job Schedule

### Vercel Deployment (vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/auto-release-assignments",
      "schedule": "0 8 * * 1",
      "description": "Release assignments Monday 8 AM"
    },
    {
      "path": "/api/cron/assignment-reminders",
      "schedule": "*/30 * * * *",
      "description": "Send assignment reminders every 30 min"
    },
    {
      "path": "/api/cron/auto-close-assignments",
      "schedule": "59 23 * * 5",
      "description": "Close assignments Friday 11:59 PM"
    },
    {
      "path": "/api/cron/assignment-grading-ready",
      "schedule": "0 18 * * 0",
      "description": "Grading notification Sunday 6 PM"
    }
  ]
}
```

### GitHub Actions (.github/workflows/)

```yaml
# Weekly assignment release
name: Release Assignments
on:
  schedule:
    - cron: "0 8 * * 1" # Monday 8 AM
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -H "x-cron-secret: ${{ secrets.CRON_SECRET }}" \
            ${{ secrets.API_URL }}/api/cron/auto-release-assignments
```

## Server Actions

### `getAssignmentsToRelease()`

```typescript
const toRelease = await getAssignmentsToRelease();
// Returns: Assignment[] where scheduledReleaseAt <= NOW and isVisible = false
```

### `releaseAssignment(assignmentId)`

```typescript
await releaseAssignment(1);
// Updates: isVisible = true, releasedAt = NOW
// Returns: Updated assignment record
```

### `getAssignmentsToClose()`

```typescript
const toClose = await getAssignmentsToClose();
// Returns: Assignment[] where scheduledCloseAt <= NOW and closedAt = null
```

### `closeAssignment(assignmentId)`

```typescript
await closeAssignment(1);
// Updates: closedAt = NOW
// Returns: Updated assignment record
```

### `getOverdueAssignments(classId?)`

```typescript
const overdue = await getOverdueAssignments(5);
// Returns: Assignment[] where dueDate < NOW and closedAt = null
```

### `getAssignmentStats(assignmentId)`

```typescript
const stats = await getAssignmentStats(1);
// Returns: {
//   totalSubmissions: 25,
//   submittedCount: 23,
//   gradedCount: 18,
//   averageScore: 85.5
// }
```

## Teacher Dashboard Integration

### Create Assignment Form

```typescript
// Teacher sees this form
<form onSubmit={handleCreateAssignment}>
  <input type="text" placeholder="Assignment Title" required />
  <textarea placeholder="Description" />

  <label>
    <input type="checkbox" name="autoRelease" />
    Auto-release on Monday 8 AM
  </label>

  <input type="datetime-local" name="scheduledReleaseAt" />
  <input type="datetime-local" name="dueDate" required />
  <input type="datetime-local" name="scheduledCloseAt" />

  <label>
    <input type="checkbox" name="autoClose" />
    Auto-close at deadline
  </label>

  <input type="number" placeholder="Max Score" defaultValue="100" />
  <button type="submit">Create Assignment</button>
</form>
```

### Assignment Status Timeline

```
CREATED → RELEASED → SUBMISSIONS OPEN → CLOSED → GRADING READY → GRADED
  |         |           |               |        |              |
  └─[Pending until      └─[Active]     └─[No more]    └─[Teacher grading]
    scheduledReleaseAt]                submissions]      └─[Auto-grade reminder]
```

## Notification Templates

Default templates for Phase 3:

```sql
INSERT INTO notification_templates (type, name, titleTemplate, messageTemplate, channel) VALUES
  ('assignment', 'Assignment released', '📝 Bài tập {week}',
   'Bài tập "{assignmentTitle}" đã được giao. Hạn nộp: {dueDate}'),

  ('assignment', 'Assignment due in 1 day', '⏰ Nhắc nộp bài tập',
   'Nhắc nhở: Còn 1 ngày để nộp bài "{assignmentTitle}". Hạn nộp: {dueDate}'),

  ('assignment', 'Assignment closing soon', '⏰ Cuối cùng - nộp bài ngay',
   'Cuối cùng: Bài tập "{assignmentTitle}" hạn nộp HÔM NAY!'),

  ('assignment', 'Assignment closed', '⏰ Bài tập đã đóng',
   'Bài tập "{assignmentTitle}" đã đóng. Không thể nộp thêm.'),

  ('report', 'Grading ready', '📊 Sẵn sàng chấm bài',
   'Có {submissionCount} bài tập "{assignmentTitle}" chờ chấm điểm');
```

## Error Handling & Retries

### Failed Release

If `auto-release` fails:

1. **Log:** Record error in `error_message` field
2. **Retry:** Cron job retries in 30 minutes
3. **Alert:** Notify teacher if still failed after 3 attempts

### Failed Close

If `auto-close` fails:

1. **Log:** Record in notification error tracking
2. **Manual Option:** Teacher can manually close from dashboard
3. **Grace Period:** Allow +1 hour submissions after close

## Testing

### Manual Test: Create Assignment

```bash
# 1. Create assignment with auto-release for 5 minutes from now
curl -X POST http://localhost:5001/api/assignments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Assignment",
    "classId": 1,
    "scheduledReleaseAt": "2024-03-18T14:35:00Z",
    "dueDate": "2024-03-21T23:59:59Z",
    "autoReleaseEnabled": true,
    "maxScore": 100
  }'

# 2. Verify assignment is hidden
curl http://localhost:5001/api/assignments/1

# 3. Wait 5 minutes or manually trigger cron
curl -X POST \
  -H "x-cron-secret: test-secret" \
  http://localhost:5001/api/cron/auto-release-assignments

# 4. Verify assignment is now visible
curl http://localhost:5001/api/assignments/1
```

## Monitoring & Analytics

### Key Metrics

- Assignments auto-released per week
- Submission rate before deadline vs after close
- Average time to close after deadline
- Failed release/close operations

### Logs

```
[Assignment] Created assignment { id: 1, title: 'Math', autoRelease: true }
[Cron] Found assignments to release { count: 5 }
[Cron] Released assignment { id: 1, title: 'Math' }
[Cron] Assignment auto-release job completed { released: 5, failed: 0 }
```

## Known Limitations

1. **No Partial Credit:** Current model doesn't support late submission penalties
2. **No Extension:** Teachers can't grant extensions without manual close/release
3. **Single Schedule:** All assignments follow same schedule (e.g., all released Monday 8 AM)
4. **No Timezone:** Uses server timezone, not student/class timezone

## Future Enhancements

1. **Custom Schedules:** Teachers pick multiple release/close times
2. **Extensions:** Extend deadline for individual students
3. **Late Penalty:** Auto-reduce score for late submissions
4. **Reopen:** Allow teachers to reopen for late submissions
5. **Weighted Schedule:** Different schedules for different classes
6. **Timezone Support:** Auto-adjust for student timezones
7. **Bulk Scheduling:** Create series of assignments (Week 1-12)
8. **Student Preferences:** Students can set personal reminders

## Integration Points

### Phase 1: Class Management

- Classes linked to assignments
- Session info used for context

### Phase 2: Notifications

- Notification templates for assignments
- Zalo message sending
- Auto-reminder scheduling

### Phase 4: Analytics (Next)

- Assignment performance analytics
- Student submission patterns
- Teacher grading efficiency

## Database Relationships

```
users (1) ──→ (∞) assignments (teacher creates)
classes (1) ──→ (∞) assignments
assignments (1) ──→ (∞) assignmentSubmissions
users (1) ──→ (∞) assignmentSubmissions (student)
```

## Files Created/Modified

### Created

- `db/migrations/004_add_phase3_assignment_scheduling.sql` - Schema migration
- `app/api/cron/auto-release-assignments/route.ts` - Auto-release cron
- `app/api/cron/auto-close-assignments/route.ts` - Auto-close cron
- `app/api/cron/assignment-reminders/route.ts` - Reminder cron
- `DESIGN_PHASE3_ASSIGNMENT_SCHEDULING.md` - This document

### Modified

- `db/schema.ts` - Added scheduling fields to assignments table
- `lib/actions/assignments.ts` - Added 6 server action functions

## Related Phases

- **Phase 1:** Class Management ✅
- **Phase 2:** Notifications & Zalo ✅
- **Phase 3:** Assignment Scheduling 🔄 (Current)
- **Phase 4:** Analytics Dashboard (Next)

---

**Status:** Phase 3 implementation complete. Ready for database migration and cron configuration.
