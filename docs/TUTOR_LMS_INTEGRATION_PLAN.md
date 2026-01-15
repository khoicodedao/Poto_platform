# 🔄 KẾ HOẠCH TÍCH HỢP TUTOR LMS → POTO PLATFORM

## 📋 TỔNG QUAN

### Mục tiêu
Đồng bộ kết quả học tập (điểm số, tiến độ, bài tập) từ **Tutor LMS** về **POTO Platform** để quản lý tập trung.

### Phạm vi
- **Từ**: Tutor LMS (WordPress plugin)
- **Đến**: POTO Platform (Next.js application)
- **Dữ liệu**: Courses, Lessons, Quizzes, Assignment Results, Student Progress

---

## 🎯 PHẦN 1: PHÂN TÍCH YÊU CẦU

### 1.1 Dữ liệu cần đồng bộ

| Loại dữ liệu | Từ Tutor LMS | Sang POTO Platform |
|--------------|--------------|---------------------|
| **Người dùng** | Students | users (role: student) |
| **Khóa học** | Courses | classes |
| **Bài học** | Lessons | classSessions hoặc learningUnits |
| **Bài tập** | Assignments | assignments |
| **Kết quả bài tập** | Assignment Submissions | assignmentSubmissions |
| **Quiz** | Quiz Results | assignments (quiz type) |
| **Tiến độ** | Course Progress | custom table hoặc analytics |
| **Điểm số** | Grades | assignmentSubmissions.score |

### 1.2 Hướng đồng bộ

```
┌─────────────┐         API          ┌──────────────┐
│ Tutor LMS   │ ──────────────────> │ POTO Platform│
│ (WordPress) │                      │ (Next.js)    │
└─────────────┘                      └──────────────┘
   
   - Webhook (real-time)
   - Scheduled Sync (batch)
   - Manual Import
```

### 1.3 Tần suất đồng bộ

- **Real-time**: Khi có submission mới, grade mới (via webhook)
- **Scheduled**: Mỗi 1 giờ sync toàn bộ (cron job)
- **Manual**: Admin có thể trigger sync thủ công

---

## 🏗️ PHẦN 2: KIẾN TRÚC GIẢI PHÁP

### 2.1 Tổng quan kiến trúc

```
┌──────────────────────────────────────────────────┐
│            TUTOR LMS (WordPress)                  │
│                                                   │
│  ┌────────────┐  ┌────────────┐  ┌─────────────┐│
│  │  Courses   │  │ Assignments│  │   Quizzes   ││
│  └────────────┘  └────────────┘  └─────────────┘│
│         │                │                │       │
│         └────────────────┴────────────────┘       │
│                          │                        │
│                    ┌─────▼──────┐                 │
│                    │  REST API  │                 │
│                    │  /Webhooks │                 │
│                    └─────┬──────┘                 │
└──────────────────────────┼────────────────────────┘
                           │ HTTPS
                           │
            ┌──────────────▼───────────────┐
            │   POTO Platform Integration  │
            │                              │
            │  ┌───────────────────────┐  │
            │  │  Sync Service         │  │
            │  │  - Fetch data         │  │
            │  │  - Transform          │  │
            │  │  - Validate           │  │
            │  │  - Store              │  │
            │  └───────────┬───────────┘  │
            │              │               │
            │  ┌───────────▼───────────┐  │
            │  │  Database (Postgres)  │  │
            │  │  - assignments        │  │
            │  │  - submissions        │  │
            │  │  - users              │  │
            │  │  - sync_logs          │  │
            │  └───────────────────────┘  │
            └──────────────────────────────┘
```

### 2.2 Components cần xây dựng

#### A. Tutor LMS Side (WordPress)
1. **REST API Endpoints** (sử dụng Tutor LMS API hoặc custom)
2. **Webhook System** để notify POTO khi có thay đổi

#### B. POTO Platform Side (Next.js)
1. **API Endpoints** để nhận webhook và sync data
2. **Sync Service** để xử lý đồng bộ
3. **Data Transformer** để map dữ liệu
4. **Sync Logs** để tracking

---

## 🔧 PHẦN 3: CHI TIẾT IMPLEMENTATION

### 3.1 Database Schema Updates

#### Bảng mới: `tutor_sync_logs`
```sql
CREATE TABLE tutor_sync_logs (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'course', 'assignment', 'submission', etc.
  tutor_id VARCHAR(255), -- ID trong Tutor LMS
  poto_id INTEGER, -- ID trong POTO
  status VARCHAR(20), -- 'success', 'failed', 'pending'
  error_message TEXT,
  sync_direction VARCHAR(20), -- 'tutor_to_poto'
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Bảng mới: `tutor_mapping`
```sql
CREATE TABLE tutor_mapping (
  id SERIAL PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'course', 'assignment'
  tutor_id VARCHAR(255) NOT NULL,
  poto_id INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity_type, tutor_id)
);
```

#### Cập nhật bảng hiện có
```sql
-- Thêm cột vào assignments
ALTER TABLE assignments 
ADD COLUMN tutor_assignment_id VARCHAR(255),
ADD COLUMN source VARCHAR(20) DEFAULT 'poto'; -- 'poto' hoặc 'tutor'

-- Thêm cột vào assignment_submissions
ALTER TABLE assignment_submissions 
ADD COLUMN tutor_submission_id VARCHAR(255),
ADD COLUMN synced_from_tutor BOOLEAN DEFAULT false;

-- Thêm cột vào users
ALTER TABLE users 
ADD COLUMN tutor_user_id VARCHAR(255);
```

### 3.2 API Endpoints (POTO Platform)

#### A. Webhook Receivers
```typescript
// app/api/tutor-webhook/assignment-submitted/route.ts
POST /api/tutor-webhook/assignment-submitted
Body: {
  assignment_id: string,
  student_id: string,
  submission_data: {...},
  score: number,
  submitted_at: string
}

// app/api/tutor-webhook/quiz-completed/route.ts
POST /api/tutor-webhook/quiz-completed

// app/api/tutor-webhook/grade-updated/route.ts
POST /api/tutor-webhook/grade-updated
```

#### B. Sync Endpoints
```typescript
// app/api/tutor-sync/courses/route.ts
GET  /api/tutor-sync/courses        // Lấy danh sách courses từ Tutor
POST /api/tutor-sync/courses        // Sync courses về POTO

// app/api/tutor-sync/assignments/route.ts
POST /api/tutor-sync/assignments    // Sync assignments

// app/api/tutor-sync/submissions/route.ts
POST /api/tutor-sync/submissions    // Sync submissions

// app/api/tutor-sync/full-sync/route.ts
POST /api/tutor-sync/full-sync      // Full sync toàn bộ

// app/api/tutor-sync/status/route.ts
GET  /api/tutor-sync/status         // Xem trạng thái sync
```

#### C. Admin Dashboard Endpoints
```typescript
// app/api/admin/tutor-sync/logs/route.ts
GET /api/admin/tutor-sync/logs      // Xem logs

// app/api/admin/tutor-sync/mapping/route.ts
GET /api/admin/tutor-sync/mapping   // Xem mapping table

// app/api/admin/tutor-sync/trigger/route.ts
POST /api/admin/tutor-sync/trigger  // Trigger sync thủ công
```

### 3.3 Core Sync Service

```typescript
// lib/services/tutor-sync.ts

export class TutorSyncService {
  private tutorApiUrl: string;
  private tutorApiKey: string;

  constructor() {
    this.tutorApiUrl = process.env.TUTOR_LMS_API_URL!;
    this.tutorApiKey = process.env.TUTOR_LMS_API_KEY!;
  }

  /**
   * Fetch courses from Tutor LMS
   */
  async fetchTutorCourses(): Promise<TutorCourse[]> {
    const response = await fetch(`${this.tutorApiUrl}/courses`, {
      headers: {
        'Authorization': `Bearer ${this.tutorApiKey}`,
      },
    });
    return response.json();
  }

  /**
   * Sync single course
   */
  async syncCourse(tutorCourse: TutorCourse): Promise<SyncResult> {
    // 1. Check if course already exists (via mapping)
    const mapping = await this.findMapping('course', tutorCourse.id);
    
    let classId: number;
    
    if (mapping) {
      // Update existing class
      classId = mapping.poto_id;
      await db.update(classes)
        .set({
          name: tutorCourse.title,
          description: tutorCourse.description,
          updatedAt: new Date(),
        })
        .where(eq(classes.id, classId));
    } else {
      // Create new class
      const [newClass] = await db.insert(classes)
        .values({
          name: tutorCourse.title,
          description: tutorCourse.description,
          teacherId: await this.getDefaultTeacherId(),
          // ... other fields
        })
        .returning();
      
      classId = newClass.id;
      
      // Create mapping
      await this.createMapping('course', tutorCourse.id, classId);
    }
    
    // Log sync
    await this.logSync('course', tutorCourse.id, classId, 'success');
    
    return {
      success: true,
      tutorId: tutorCourse.id,
      potoId: classId,
    };
  }

  /**
   * Sync assignment submission
   */
  async syncSubmission(tutorSubmission: TutorSubmission): Promise<SyncResult> {
    // 1. Find assignment mapping
    const assignmentMapping = await this.findMapping(
      'assignment', 
      tutorSubmission.assignment_id
    );
    
    if (!assignmentMapping) {
      throw new Error(`Assignment ${tutorSubmission.assignment_id} not found in mapping`);
    }
    
    // 2. Find student mapping
    const studentMapping = await this.findMapping(
      'user', 
      tutorSubmission.student_id
    );
    
    if (!studentMapping) {
      throw new Error(`Student ${tutorSubmission.student_id} not found in mapping`);
    }
    
    // 3. Check if submission already exists
    const existingSubmission = await db.query.assignmentSubmissions.findFirst({
      where: and(
        eq(assignmentSubmissions.tutor_submission_id, tutorSubmission.id),
      ),
    });
    
    if (existingSubmission) {
      // Update existing submission
      await db.update(assignmentSubmissions)
        .set({
          score: tutorSubmission.score,
          feedback: tutorSubmission.feedback,
          status: this.mapStatus(tutorSubmission.status),
          gradedAt: tutorSubmission.graded_at ? new Date(tutorSubmission.graded_at) : null,
          syncedFromTutor: true,
        })
        .where(eq(assignmentSubmissions.id, existingSubmission.id));
      
      return {
        success: true,
        tutorId: tutorSubmission.id,
        potoId: existingSubmission.id,
      };
    } else {
      // Create new submission
      const [newSubmission] = await db.insert(assignmentSubmissions)
        .values({
          assignmentId: assignmentMapping.poto_id,
          studentId: studentMapping.poto_id,
          content: tutorSubmission.content || '',
          score: tutorSubmission.score,
          feedback: tutorSubmission.feedback,
          status: this.mapStatus(tutorSubmission.status),
          submittedAt: new Date(tutorSubmission.submitted_at),
          gradedAt: tutorSubmission.graded_at ? new Date(tutorSubmission.graded_at) : null,
          tutorSubmissionId: tutorSubmission.id,
          syncedFromTutor: true,
        })
        .returning();
      
      return {
        success: true,
        tutorId: tutorSubmission.id,
        potoId: newSubmission.id,
      };
    }
  }

  /**
   * Full sync all data
   */
  async fullSync(): Promise<FullSyncResult> {
    const results = {
      courses: 0,
      assignments: 0,
      submissions: 0,
      errors: [],
    };
    
    try {
      // 1. Sync courses
      const courses = await this.fetchTutorCourses();
      for (const course of courses) {
        try {
          await this.syncCourse(course);
          results.courses++;
        } catch (error) {
          results.errors.push({
            type: 'course',
            id: course.id,
            error: String(error),
          });
        }
      }
      
      // 2. Sync assignments
      const assignments = await this.fetchTutorAssignments();
      for (const assignment of assignments) {
        try {
          await this.syncAssignment(assignment);
          results.assignments++;
        } catch (error) {
          results.errors.push({
            type: 'assignment',
            id: assignment.id,
            error: String(error),
          });
        }
      }
      
      // 3. Sync submissions
      const submissions = await this.fetchTutorSubmissions();
      for (const submission of submissions) {
        try {
          await this.syncSubmission(submission);
          results.submissions++;
        } catch (error) {
          results.errors.push({
            type: 'submission',
            id: submission.id,
            error: String(error),
          });
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Full sync failed: ${error}`);
    }
  }

  // Helper methods
  private async findMapping(entityType: string, tutorId: string) {
    return db.query.tutorMapping.findFirst({
      where: and(
        eq(tutorMapping.entityType, entityType),
        eq(tutorMapping.tutorId, tutorId),
      ),
    });
  }

  private async createMapping(entityType: string, tutorId: string, potoId: number) {
    return db.insert(tutorMapping).values({
      entityType,
      tutorId,
      potoId,
    });
  }

  private async logSync(
    syncType: string,
    tutorId: string,
    potoId: number,
    status: 'success' | 'failed',
    errorMessage?: string
  ) {
    return db.insert(tutorSyncLogs).values({
      syncType,
      tutorId,
      potoId,
      status,
      errorMessage,
      syncDirection: 'tutor_to_poto',
    });
  }

  private mapStatus(tutorStatus: string): 'pending' | 'submitted' | 'graded' {
    const statusMap: Record<string, 'pending' | 'submitted' | 'graded'> = {
      'submitted': 'submitted',
      'graded': 'graded',
      'pending': 'pending',
    };
    return statusMap[tutorStatus] || 'pending';
  }
}
```

### 3.4 Data Transformers

```typescript
// lib/transformers/tutor-to-poto.ts

export class TutorToPotoTransformer {
  /**
   * Transform Tutor course to POTO class
   */
  static transformCourse(tutorCourse: TutorCourse): Partial<Class> {
    return {
      name: tutorCourse.post_title,
      description: tutorCourse.post_content,
      // Map other fields as needed
    };
  }

  /**
   * Transform Tutor assignment to POTO assignment
   */
  static transformAssignment(tutorAssignment: TutorAssignment): Partial<Assignment> {
    return {
      title: tutorAssignment.post_title,
      description: tutorAssignment.post_content,
      maxScore: tutorAssignment.total_mark || 100,
      dueDate: tutorAssignment.deadline ? new Date(tutorAssignment.deadline) : null,
      // Map other fields
    };
  }

  /**
   * Transform Tutor submission to POTO submission
   */
  static transformSubmission(tutorSub: TutorSubmission): Partial<AssignmentSubmission> {
    return {
      content: tutorSub.comment_content,
      score: tutorSub.earned_mark,
      feedback: tutorSub.instructor_note,
      submittedAt: new Date(tutorSub.comment_date),
      status: this.mapSubmissionStatus(tutorSub.comment_approved),
    };
  }

  private static mapSubmissionStatus(approved: string): 'pending' | 'submitted' | 'graded' {
    if (approved === '1') return 'graded';
    if (approved === '0') return 'submitted';
    return 'pending';
  }
}
```

---

## 📅 PHẦN 4: KẾ HOẠCH TRIỂN KHAI

### Phase 1: Setup & Infrastructure (1 tuần)

**Week 1:**
- [ ] **Day 1-2**: Nghiên cứu Tutor LMS API
  - Đọc documentation
  - Test API endpoints
  - Xác định data structure
  
- [ ] **Day 3-4**: Setup database
  - Tạo migration cho `tutor_sync_logs`
  - Tạo migration cho `tutor_mapping`
  - Update existing tables (add tutor_*_id columns)
  
- [ ] **Day 5**: Setup environment
  - Add `TUTOR_LMS_API_URL` to `.env`
  - Add `TUTOR_LMS_API_KEY` to `.env`
  - Setup network/firewall rules

### Phase 2: Core Sync Service (2 tuần)

**Week 2:**
- [ ] **Day 1-2**: Implement TutorSyncService
  - fetchTutorCourses()
  - fetchTutorAssignments()
  - fetchTutorSubmissions()
  
- [ ] **Day 3-4**: Implement sync methods
  - syncCourse()
  - syncAssignment()
  - syncSubmission()
  
- [ ] **Day 5**: Implement mapping & logging
  - findMapping()
  - createMapping()
  - logSync()

**Week 3:**
- [ ] **Day 1-2**: Implement transformers
  - TutorToPotoTransformer
  - Data validation
  
- [ ] **Day 3-4**: Implement full sync
  - fullSync() method
  - Error handling
  - Retry logic
  
- [ ] **Day 5**: Unit testing

### Phase 3: API Endpoints (1 tuần)

**Week 4:**
- [ ] **Day 1-2**: Webhook endpoints
  - `/api/tutor-webhook/assignment-submitted`
  - `/api/tutor-webhook/quiz-completed`
  - `/api/tutor-webhook/grade-updated`
  
- [ ] **Day 3-4**: Sync endpoints
  - `/api/tutor-sync/courses`
  - `/api/tutor-sync/assignments`
  - `/api/tutor-sync/submissions`
  - `/api/tutor-sync/full-sync`
  
- [ ] **Day 5**: Admin endpoints
  - `/api/admin/tutor-sync/logs`
  - `/api/admin/tutor-sync/trigger`

### Phase 4: UI Dashboard (1 tuần)

**Week 5:**
- [ ] **Day 1-2**: Admin sync dashboard
  - Sync status overview
  - Logs table
  - Mapping table
  
- [ ] **Day 3-4**: Sync controls
  - Trigger full sync button
  - Sync individual entity
  - Filter/search logs
  
- [ ] **Day 5**: Error notifications
  - Toast notifications
  - Email alerts for admins

### Phase 5: Automation & Scheduling (1 tuần)

**Week 6:**
- [ ] **Day 1-2**: Cron jobs setup
  - Hourly sync cron
  - Daily full sync cron
  
- [ ] **Day 3-4**: Webhook setup on Tutor LMS
  - Configure webhooks
  - Test webhook delivery
  
- [ ] **Day 5**: Monitoring
  - Setup logging
  - Setup alerts

### Phase 6: Testing & Deployment (1 tuần)

**Week 7:**
- [ ] **Day 1-2**: Integration testing
  - Test full sync flow
  - Test webhook flow
  - Test edge cases
  
- [ ] **Day 3-4**: Performance testing
  - Load testing với large dataset
  - Optimize queries
  
- [ ] **Day 5**: Documentation & deployment
  - Write user documentation
  - Deploy to production

---

## 🧪 PHẦN 5: TESTING STRATEGY

### 5.1 Unit Tests

```typescript
// __tests__/lib/services/tutor-sync.test.ts

describe('TutorSyncService', () => {
  describe('syncCourse', () => {
    it('should create new class if not exists', async () => {
      // Test implementation
    });
    
    it('should update existing class if mapping exists', async () => {
      // Test implementation
    });
  });
  
  describe('syncSubmission', () => {
    it('should sync submission with correct score', async () => {
      // Test implementation
    });
  });
});
```

### 5.2 Integration Tests

```typescript
// __tests__/api/tutor-sync/full-sync.test.ts

describe('POST /api/tutor-sync/full-sync', () => {
  it('should sync all courses, assignments, and submissions', async () => {
    // Mock Tutor LMS API
    // Call full sync
    // Verify data in database
  });
});
```

### 5.3 Manual Testing Checklist

- [ ] Sync 1 course từ Tutor → verify trong POTO
- [ ] Sync 1 assignment → verify trong POTO
- [ ] Submit bài trên Tutor → webhook → verify trong POTO
- [ ] Grade bài trên Tutor → webhook → verify trong POTO
- [ ] Full sync 100+ records → verify performance
- [ ] Test error handling khi Tutor API down
- [ ] Test duplicate prevention

---

## 📊 PHẦN 6: MONITORING & MAINTENANCE

### 6.1 Metrics cần track

- **Sync success rate**: % syncs thành công
- **Sync duration**: Thời gian mỗi lần sync
- **Error rate**: Số lỗi / tổng số syncs
- **Data volume**: Số records sync được
- **Last sync time**: Lần sync cuối

### 6.2 Logging

```typescript
// Mỗi sync operation cần log:
{
  timestamp: '2026-01-15T11:00:00Z',
  operation: 'sync_submission',
  tutor_id: 'assignment_123',
  poto_id: 456,
  status: 'success',
  duration_ms: 250,
  metadata: {...}
}
```

### 6.3 Alerts

- Email admin khi sync failed > 10% trong 1 giờ
- Slack notification khi full sync completed
- SMS alert khi Tutor API không response quá 5 phút

---

## 🔒 PHẦN 7: BẢO MẬT

### 7.1 API Security

```typescript
// Webhook authentication
const signature = req.headers['x-tutor-signature'];
const isValid = verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### 7.2 Rate Limiting

```typescript
// Limit sync requests
const rateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
});
```

### 7.3 Data Validation

```typescript
// Validate incoming data
const submissionSchema = z.object({
  assignment_id: z.string(),
  student_id: z.string(),
  score: z.number().min(0).max(100),
  submitted_at: z.string().datetime(),
});

const validated = submissionSchema.parse(req.body);
```

---

## 📝 PHẦN 8: DOCUMENTATION

### 8.1 User Guide

**File**: `docs/TUTOR_SYNC_USER_GUIDE.md`
- Cách trigger manual sync
- Cách xem logs
- Cách troubleshoot khi có lỗi

### 8.2 Developer Guide

**File**: `docs/TUTOR_SYNC_DEV_GUIDE.md`
- API endpoints reference
- Data mapping tables
- Code examples

### 8.3 API Documentation

**File**: `docs/TUTOR_SYNC_API.md`
- Webhook specifications
- Request/Response formats
- Error codes

---

## ✅ CHECKLIST TỔNG THỂ

### Database
- [ ] Migration `tutor_sync_logs` created
- [ ] Migration `tutor_mapping` created
- [ ] Existing tables updated with `tutor_*_id` columns

### Backend Services
- [ ] `TutorSyncService` implemented
- [ ] `TutorToPotoTransformer` implemented
- [ ] Error handling & retry logic
- [ ] Logging system

### API Endpoints
- [ ] Webhook receivers
- [ ] Sync endpoints
- [ ] Admin endpoints

### Frontend
- [ ] Admin sync dashboard
- [ ] Sync logs viewer
- [ ] Manual sync trigger UI

### Automation
- [ ] Cron jobs setup
- [ ] Webhook configured on Tutor LMS

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing completed

### Documentation
- [ ] User guide
- [ ] Developer guide
- [ ] API documentation

### Deployment
- [ ] Environment variables configured
- [ ] Production deployment
- [ ] Monitoring & alerts setup

---

## 🎯 KẾT LUẬN

**Thời gian dự kiến**: 7 tuần (1.5 tháng)  
**Độ phức tạp**: Trung bình - Cao  
**Rủi ro chính**: 
- Tutor LMS API thay đổi
- Data inconsistency
- Performance với large dataset

**Lợi ích**:
- Quản lý tập trung kết quả học tập
- Tự động hóa đồng bộ
- Báo cáo và analytics thống nhất

---

📅 **Ngày tạo**: 2026-01-15  
📌 **Version**: 1.0  
✍️ **Tác giả**: AI Assistant (Antigravity)
