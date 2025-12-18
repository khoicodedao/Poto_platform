# Phase 4: Analytics Dashboard

## Overview

Phase 4 implements comprehensive analytics and reporting for the EduPlatform. Teachers gain deep insights into class performance, student progress, and assignment effectiveness. Students can track their personal performance, grades, and attendance. Admins see platform-wide metrics.

## Architecture

### Analytics Layers

1. **Database Layer** - Optimized queries with indexes and views
2. **Server Actions** - Compute analytics from raw data
3. **API Routes** - RESTful endpoints for dashboard consumption
4. **React Hooks** - Declarative data fetching (`use-analytics`)
5. **Components** - Reusable dashboard widgets with charts
6. **Pages** - Teacher, student, and admin dashboards

## Server Actions (lib/actions/analytics.ts)

### Student Performance Analytics

```typescript
getStudentPerformanceStats(classId, studentId)
// Returns:
{
  assignments: {
    totalAssignments: 10,
    submittedCount: 9,
    gradedCount: 8,
    averageScore: 82.5,
    highestScore: 95,
    lowestScore: 65
  },
  attendance: {
    totalSessions: 20,
    presentCount: 18,
    lateCount: 1,
    absentCount: 1
  },
  overallScore: 82.5,
  attendanceRate: "90"
}
```

### Class Performance Analytics

```typescript
getClassPerformanceStats(classId)
// Returns:
{
  assignments: {
    totalAssignments: 12,
    totalSubmissions: 125,
    averageScore: 78.3,
    submissionRate: 92.5
  },
  attendance: {
    totalSessions: 20,
    averageAttendance: 88.5,
    lateRate: 5.2,
    absentRate: 6.3
  }
}
```

### Top & At-Risk Students

```typescript
getTopStudents(classId, (limit = 10));
// Returns: Top 10 performers with scores

getStudentsNeedingAttention(classId);
// Returns: Students with low scores or poor attendance
```

### Assignment Performance

```typescript
getAssignmentPerformance(assignmentId);
// Returns: Detailed breakdown of submission rates, scores, trends
```

### Trends & Timelines

```typescript
getSubmissionTimeline(classId, (days = 30));
// Returns: Daily submission counts and average scores

getAttendanceTrends(classId);
// Returns: Per-session attendance breakdown
```

### Platform Statistics

```typescript
getPlatformStats()
// Returns:
{
  totalUsers: 1250,
  totalClasses: 45,
  totalAssignments: 320,
  totalSubmissions: 5420
}
```

## API Endpoints

### GET /api/analytics

Query parameters:

- `type`: analytics type
- `classId`: class ID (required for most types)
- `studentId`: student ID (for student-performance)
- `assignmentId`: assignment ID (for assignment-performance)
- `days`: number of days for timeline (default: 30)

**Types:**

| Type                         | Params             | Returns                |
| ---------------------------- | ------------------ | ---------------------- |
| `student-performance`        | classId, studentId | Student stats          |
| `class-performance`          | classId            | Class stats            |
| `top-students`               | classId            | Top 10 students        |
| `students-needing-attention` | classId            | At-risk students       |
| `assignment-performance`     | assignmentId       | Assignment stats       |
| `submission-timeline`        | classId, days      | Submission trends      |
| `attendance-trends`          | classId            | Attendance per session |
| `platform-stats`             | -                  | Platform metrics       |
| `class-participation`        | classId            | Active/inactive count  |

### Examples

```bash
# Get student performance
curl /api/analytics?type=student-performance&classId=1&studentId=5

# Get class trends
curl /api/analytics?type=class-performance&classId=1

# Get at-risk students
curl /api/analytics?type=students-needing-attention&classId=1

# Get submission trends (last 60 days)
curl /api/analytics?type=submission-timeline&classId=1&days=60
```

## React Hooks (hooks/use-analytics.ts)

```typescript
// Generic hook
const { data, loading, error } = useAnalytics("student-performance", {
  classId: 1,
  studentId: 5,
});

// Specific hooks (convenience wrappers)
const { data: studentStats } = useStudentPerformance(classId, studentId);
const { data: classStats } = useClassPerformance(classId);
const { data: topStudents } = useTopStudents(classId);
const { data: atRiskStudents } = useStudentsNeedingAttention(classId);
const { data: timeline } = useSubmissionTimeline(classId, 30);
const { data: attendance } = useAttendanceTrends(classId);
const { data: platformStats } = usePlatformStats();
```

## Dashboard Components

### ClassPerformanceDashboard

Teacher view with KPI cards and charts:

```typescript
<ClassPerformanceDashboard classId={1} />

// Features:
// - Average score card
// - Submission rate card
// - Attendance rate card
// - Late rate card
// - Submission timeline line chart (last 30 days)
// - Attendance trends bar chart
```

### StudentDashboard

Student personal dashboard:

```typescript
<StudentDashboard classId={1} studentId={5} />

// Features:
// - Your average score
// - Attendance percentage
// - Assignments graded/total
```

### AtRiskStudentsAlert

Alert component showing students needing attention:

```typescript
<AtRiskStudentsAlert classId={1} />

// Shows:
// - Number of at-risk students
// - Student names and issues (low scores, poor attendance)
// - Color-coded alert
```

## Dashboard Pages

### Teacher Analytics Dashboard

**Route:** `/classes/[id]/analytics`

Shows:

- At-risk students alert
- Class performance KPIs
- Submission timeline
- Attendance trends
- Top performers
- Performance breakdown by assignment

### Student Performance Page

**Route:** `/classes/[id]/my-performance`

Shows:

- Personal average score
- Attendance tracking
- Assignment grades
- Progress over time
- Comparison to class average

### Admin Dashboard (Future)

**Route:** `/admin/analytics`

Shows:

- Platform statistics
- Class performance comparison
- Teacher effectiveness metrics
- Student enrollment trends

## Database Optimization

### Indexes

Created for fast queries:

```sql
-- Assignment submissions index
idx_assignment_submissions_composite
  (assignment_id, student_id, score, submitted_at)

-- Attendance index
idx_attendance_composite
  (session_id, student_id, status)

-- Class sessions index
idx_class_sessions_class_composite
  (class_id, scheduled_at, status)

-- Users to class mapping
idx_users_class_id

-- Date range queries
idx_assignment_submissions_submitted_at
```

### Database Views

Created for optimized aggregations:

```sql
-- student_performance_summary
-- Pre-aggregated student stats per class

-- class_performance_summary
-- Class-level metrics and trends

-- assignment_performance_summary
-- Per-assignment submission rates and scores

-- attendance_summary
-- Attendance breakdown per session
```

## KPIs Tracked

### Student Level

- Average assignment score
- Assignment submission rate
- Highest/lowest scores
- Attendance rate
- Sessions attended/missed/late

### Class Level

- Class average score
- Overall submission rate
- Attendance rate by class
- Participation distribution
- Assignment difficulty (by average score)

### Assignment Level

- Submission count/rate
- Average score distribution
- Grading completion
- On-time submission percentage
- Score range (min/max/average)

### Platform Level

- Total users (by role)
- Total classes
- Total assignments
- Total submissions
- Platform activity trends

## Data Privacy

Analytics queries only return data for:

- **Teachers:** Their own classes
- **Students:** Their own performance
- **Admins:** All platform data

Implemented via:

- `getCurrentSession()` auth check
- User role validation
- Class enrollment verification

## Performance Considerations

### Query Optimization

1. **Indexed columns** - All filtering/grouping uses indexed columns
2. **Date range filtering** - Limits data scope (e.g., last 30 days)
3. **Database views** - Pre-aggregated summary tables
4. **LIMIT clauses** - All queries limit result sets

### Caching Strategy

For high-volume queries:

```typescript
// Front-end caching (30 seconds)
const { data } = useAnalytics(...) // auto-refetch every 30s

// Back-end caching (could add Redis layer)
// Cache class performance stats for 1 hour
// Cache platform stats for 24 hours
```

## Example: Teacher Workflow

### 1. View Class Analytics

Teacher navigates to `/classes/5/analytics`

```
At-Risk Students Alert
├─ John Smith - Low Scores (45%)
├─ Sarah Lee - Poor Attendance (60%)
└─ Mike Johnson - Monitor

KPI Cards
├─ Average Score: 82.5/100
├─ Submission Rate: 92.5%
├─ Attendance Rate: 88.5%
└─ Late Rate: 5.2%

Submission Timeline (Chart)
├─ X-axis: Last 30 days
├─ Y-axis: Submission count + avg score trend

Attendance Trends (Chart)
├─ X-axis: Each session
├─ Y-axis: Present/Late/Absent stack
```

### 2. Click on At-Risk Student

Teacher clicks "John Smith" → Navigate to student performance page

Shows:

- John's average: 45/100
- John's attendance: 70%
- Failed assignments breakdown
- Contact parent via Zalo

### 3. Drill Into Assignment

Teacher clicks assignment in chart → See detailed breakdown

Shows:

- Submission rate: 90%
- Average score: 75
- Students who haven't submitted
- Score distribution histogram

## Implementation Details

### Recharts Integration

For charts, using open-source Recharts library:

```typescript
<LineChart data={timelineData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="submissionCount" stroke="#3b82f6" />
</LineChart>
```

### Data Fetching Pattern

```typescript
// In component
const { data, loading, error } = useClassPerformance(classId);

if (loading) return <Skeleton />;
if (error) return <ErrorAlert />;
return <Chart data={data} />;
```

## Files Created

- `lib/actions/analytics.ts` - 12 server action functions
- `app/api/analytics/route.ts` - API endpoint
- `hooks/use-analytics.ts` - 9 custom React hooks
- `components/analytics-dashboard.tsx` - Dashboard components
- `app/classes/[id]/analytics/page.tsx` - Teacher analytics page
- `app/classes/[id]/my-performance/page.tsx` - Student performance page
- `db/migrations/005_add_phase4_analytics.sql` - DB optimization

## Future Enhancements

1. **Export Reports** - PDF/Excel export of analytics
2. **Predictive Analytics** - ML-based student at-risk prediction
3. **Peer Comparison** - Compare class to similar classes
4. **Custom Reports** - Teachers create custom dashboards
5. **Parent Portal** - Parents view student performance
6. **Goal Setting** - Students set and track personal goals
7. **Real-time Alerts** - Notify teachers of at-risk students
8. **Learning Paths** - Recommended interventions for struggling students
9. **Cohort Analysis** - Track student cohorts over time
10. **Benchmarking** - Compare to industry/district benchmarks

## Monitoring & Logging

All analytics queries logged:

```
[Analytics] Fetching student performance { classId: 1, studentId: 5 }
[Analytics] Fetched class performance { classId: 1, duration: 245ms }
[Analytics] Error fetching analytics: Query timeout
```

## Testing

### Unit Tests

```typescript
// Test analytics calculations
test("calculates student average correctly", async () => {
  const stats = await getStudentPerformanceStats(1, 5);
  expect(stats.overallScore).toBe(82.5);
});
```

### Integration Tests

```typescript
// Test dashboard rendering
test("renders class performance dashboard", async () => {
  render(<ClassPerformanceDashboard classId={1} />);
  expect(screen.getByText("Average Score")).toBeVisible();
});
```

## Database Schema Extension

No schema changes required - uses existing tables:

- `users`
- `classes`
- `assignments`
- `assignment_submissions`
- `class_sessions`
- `attendance`

All analytics computed from existing data.

## Related Phases

- **Phase 1:** Class Management ✅
- **Phase 2:** Notifications & Zalo ✅
- **Phase 3:** Assignment Scheduling ✅
- **Phase 4:** Analytics Dashboard 🔄 (Current)

## Next Steps

1. Run database migration: `psql -f db/migrations/005_add_phase4_analytics.sql`
2. Deploy components and pages
3. Test with real class data
4. Configure caching (if needed)
5. Set up export functionality (optional)

---

**Phase 4 Ready for Deployment! 📊**
