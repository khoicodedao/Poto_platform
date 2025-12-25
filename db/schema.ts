import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "teacher",
  "admin",
]);
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "submitted",
  "graded",
]);

// === Phase 1: Class Management Enums ===
export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "in-progress",
  "completed",
  "cancelled",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "late",
  "early-leave",
]);

export const participationLevelEnum = pgEnum("participation_level", [
  "high",
  "medium",
  "low",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("student"),
  avatar: text("avatar"),
  zaloUserId: varchar("zalo_user_id", { length: 255 }), // For Zalo notifications
  classId: integer("class_id").references(() => classes.id, {
    onDelete: "set null",
  }), // Quick reference to current class
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// schema.ts
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  teacherId: integer("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  schedule: varchar("schedule", { length: 255 }),
  roomId: varchar("room_id", { length: 255 }),
  zaloGroupId: varchar("zalo_group_id", { length: 255 }), // Zalo group for this class
  maxStudents: integer("max_students").notNull().default(20),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classEnrollments = pgTable("class_enrollments", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  endDate: timestamp("end_date"), // Optional expiry date for enrollment
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),

  // Scheduling fields
  releasedAt: timestamp("released_at"), // When assignment becomes visible
  dueDate: timestamp("due_date"), // Submission deadline
  closedAt: timestamp("closed_at"), // When assignment stops accepting submissions
  scheduledReleaseAt: timestamp("scheduled_release_at"), // For auto-release
  scheduledCloseAt: timestamp("scheduled_close_at"), // For auto-close
  scheduledGradeAt: timestamp("scheduled_grade_at"), // For auto-grade reminder

  // Auto-release settings
  autoReleaseEnabled: boolean("auto_release_enabled").default(false),
  autoCloseEnabled: boolean("auto_close_enabled").default(false),

  // Scoring
  maxScore: integer("max_score").default(100),
  allowPartialSubmission: boolean("allow_partial_submission").default(false),

  // Status
  isVisible: boolean("is_visible").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content"),
  fileUrl: text("file_url"),
  status: assignmentStatusEnum("status").notNull().default("pending"),
  score: integer("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at"),
  gradedAt: timestamp("graded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 100 }),
  size: integer("size"),
  downloadCount: integer("download_count").notNull().default(0),
  classId: integer("class_id").references(() => classes.id, {
    onDelete: "cascade",
  }),
  uploadedById: integer("uploaded_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === Phase 1: ClassSession (Buổi học cụ thể) ===
export const classSessions = pgTable("class_sessions", {
  id: serial("id").primaryKey(),
  classId: integer("class_id")
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  sessionNumber: integer("session_number"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  roomId: varchar("room_id", { length: 255 }),
  platformUrl: text("platform_url"),
  status: sessionStatusEnum("status").notNull().default("scheduled"),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  guestTeacherId: integer("guest_teacher_id").references(() => users.id, {
    onDelete: "set null",
  }), // Optional substitute teacher for this session
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === Phase 1: Attendance (Điểm danh) ===
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => classSessions.id, { onDelete: "cascade" }),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: attendanceStatusEnum("status").notNull().default("absent"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  notes: text("notes"),
  markedBy: integer("marked_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === Phase 1: StudentFeedback (Nhận xét học sinh) ===
export const studentFeedbacks = pgTable("student_feedbacks", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => classSessions.id, { onDelete: "cascade" }),
  studentId: integer("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  feedbackText: text("feedback_text").notNull(),
  attitudeScore: integer("attitude_score"),
  participationLevel: participationLevelEnum("participation_level").default(
    "medium"
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === Phase 1: ClassReport (Báo cáo buổi học) ===
export const classReports = pgTable("class_reports", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => classSessions.id, { onDelete: "cascade" }),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  summary: text("summary").notNull(),
  totalStudents: integer("total_students"),
  attendanceCount: integer("attendance_count"),
  keyPoints: text("key_points"),
  nextSessionPreview: text("next_session_preview"),
  zaloMessageSent: boolean("zalo_message_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// === Phase 2: Notification Types & Status ===
export const notificationTypeEnum = pgEnum("notification_type", [
  "reminder",
  "report",
  "assignment",
  "attendance",
  "general",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
  "delivered",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "app",
  "zalo",
  "email",
]);

// === Phase 2: Notification (Thông báo & Zalo log) ===
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  recipientId: integer("recipient_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  classId: integer("class_id").references(() => classes.id, {
    onDelete: "cascade",
  }),
  relatedSessionId: integer("related_session_id").references(
    () => classSessions.id,
    { onDelete: "set null" }
  ),
  relatedAssignmentId: integer("related_assignment_id").references(
    () => assignments.id,
    { onDelete: "set null" }
  ),
  zaloMessageId: varchar("zalo_message_id", { length: 255 }),
  sentVia: notificationChannelEnum("sent_via").default("app"),
  sentAt: timestamp("sent_at"),
  scheduledSendAt: timestamp("scheduled_send_at"),
  status: notificationStatusEnum("status").default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === Phase 2: NotificationTemplate (Mẫu thông báo) ===
export const notificationTemplates = pgTable("notification_templates", {
  id: serial("id").primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  titleTemplate: varchar("title_template", { length: 255 }).notNull(),
  messageTemplate: text("message_template").notNull(),
  channel: notificationChannelEnum("channel").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classEnrollmentsRelations = relations(
  classEnrollments,
  ({ one }) => ({
    class: one(classes, {
      fields: [classEnrollments.classId],
      references: [classes.id],
    }),
    student: one(users, {
      fields: [classEnrollments.studentId],
      references: [users.id],
    }),
  })
);

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  class: one(classes, {
    fields: [assignments.classId],
    references: [classes.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(
  assignmentSubmissions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentSubmissions.assignmentId],
      references: [assignments.id],
    }),
    student: one(users, {
      fields: [assignmentSubmissions.studentId],
      references: [users.id],
    }),
  })
);

export const filesRelations = relations(files, ({ one }) => ({
  class: one(classes, {
    fields: [files.classId],
    references: [classes.id],
  }),
  uploadedBy: one(users, {
    fields: [files.uploadedById],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  class: one(classes, {
    fields: [messages.classId],
    references: [classes.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// === Phase 1: Relations cho ClassSession ===
export const classSessionsRelations = relations(
  classSessions,
  ({ one, many }) => ({
    class: one(classes, {
      fields: [classSessions.classId],
      references: [classes.id],
    }),
    createdByUser: one(users, {
      fields: [classSessions.createdBy],
      references: [users.id],
    }),
    attendances: many(attendance),
    feedbacks: many(studentFeedbacks),
    report: many(classReports),
  })
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
  session: one(classSessions, {
    fields: [attendance.sessionId],
    references: [classSessions.id],
  }),
  student: one(users, {
    fields: [attendance.studentId],
    references: [users.id],
  }),
  markedByUser: one(users, {
    fields: [attendance.markedBy],
    references: [users.id],
  }),
}));

export const studentFeedbacksRelations = relations(
  studentFeedbacks,
  ({ one }) => ({
    session: one(classSessions, {
      fields: [studentFeedbacks.sessionId],
      references: [classSessions.id],
    }),
    student: one(users, {
      fields: [studentFeedbacks.studentId],
      references: [users.id],
    }),
    createdByUser: one(users, {
      fields: [studentFeedbacks.createdBy],
      references: [users.id],
    }),
  })
);

export const classReportsRelations = relations(classReports, ({ one }) => ({
  session: one(classSessions, {
    fields: [classReports.sessionId],
    references: [classSessions.id],
  }),
  createdByUser: one(users, {
    fields: [classReports.createdBy],
    references: [users.id],
  }),
}));

// === Phase 2: Relations cho Notification ===
export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.id],
  }),
  class: one(classes, {
    fields: [notifications.classId],
    references: [classes.id],
  }),
  relatedSession: one(classSessions, {
    fields: [notifications.relatedSessionId],
    references: [classSessions.id],
  }),
  relatedAssignment: one(assignments, {
    fields: [notifications.relatedAssignmentId],
    references: [assignments.id],
  }),
}));

export const notificationTemplatesRelations = relations(
  notificationTemplates,
  ({ many }) => ({})
);

// Update existing relations to include new tables
export const usersRelations = relations(users, ({ many }) => ({
  teachingClasses: many(classes),
  enrollments: many(classEnrollments),
  submissions: many(assignmentSubmissions),
  uploadedFiles: many(files),
  messages: many(messages),
  createdSessions: many(classSessions),
  attendances: many(attendance),
  createdFeedbacks: many(studentFeedbacks),
  createdReports: many(classReports),
  receivedNotifications: many(notifications),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  enrollments: many(classEnrollments),
  assignments: many(assignments),
  files: many(files),
  messages: many(messages),
  sessions: many(classSessions),
  notifications: many(notifications),
}));
