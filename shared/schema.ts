import { pgTable, text, serial, integer, boolean, timestamp, date, pgEnum, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users (for HR admin accounts)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").default("hr_admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

// Job application status enum
export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "in_review",
  "interview",
  "interviewed",
  "offered",
  "hired",
  "rejected",
]);

// Job posting status enum
export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "active",
  "closed",
]);

// Employment type enum
export const employmentTypeEnum = pgEnum("employment_type", [
  "full_time",
  "part_time",
  "casual",
  "contract",
]);

// Locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").default("QLD").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Job Categories
export const jobCategories = pgTable("job_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobCategorySchema = createInsertSchema(jobCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertJobCategory = z.infer<typeof insertJobCategorySchema>;
export type JobCategory = typeof jobCategories.$inferSelect;

// Job Postings
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  requisitionId: text("requisition_id"),
  departmentId: integer("department_id"),
  hiringManagerId: varchar("hiring_manager_id").references(() => users.id),
  locationId: integer("location_id").notNull().references(() => locations.id),
  categoryId: integer("category_id").references(() => jobCategories.id),
  url_slug: text("url_slug"), // SEO-friendly URL component
  employmentType: employmentTypeEnum("employment_type").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currency: text("currency").default("AUD"),
  salaryRange: text("salary_range"),
  qualifications: text("qualifications").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  benefits: text("benefits"),
  applicationCount: integer("application_count").default(0),
  deadline: date("deadline"),
  status: jobStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: varchar("created_by_id").references(() => users.id),
});

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  location: one(locations, {
    fields: [jobPostings.locationId],
    references: [locations.id],
  }),
  category: one(jobCategories, {
    fields: [jobPostings.categoryId],
    references: [jobCategories.id],
  }),
  applications: many(applications),
  createdBy: one(users, {
    fields: [jobPostings.createdById],
    references: [users.id],
  }),
}));

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

// Candidates
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  resumePath: text("resume_path"),
  skills: text("skills"),
  experience: text("experience"),
  education: text("education"),
  consentDate: timestamp("consent_date").defaultNow().notNull(),
  consentPolicyVersion: text("consent_policy_version").default("1.0").notNull(),
  ccpaOptOut: boolean("ccpa_opt_out").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const candidatesRelations = relations(candidates, ({ many }) => ({
  applications: many(applications),
}));

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;

// Communications log
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  applicationId: integer("application_id").references(() => applications.id),
  type: text("type").notNull(), // email, call, video, in-person, note
  subject: text("subject"),
  message: text("message"),
  direction: text("direction").default("outbound").notNull(), // inbound or outbound
  initiatedBy: varchar("initiated_by").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"), // For additional data like call duration, email delivery status, etc.
});

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  candidate: one(candidates, {
    fields: [communicationLogs.candidateId],
    references: [candidates.id],
  }),
  application: one(applications, {
    fields: [communicationLogs.applicationId],
    references: [applications.id],
  }),
  initiator: one(users, {
    fields: [communicationLogs.initiatedBy],
    references: [users.id],
  }),
}));

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;

// Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull().references(() => candidates.id),
  jobPostingId: integer("job_posting_id").notNull().references(() => jobPostings.id),
  status: applicationStatusEnum("status").default("applied").notNull(),
  source: text("source").default("direct").notNull(),
  notes: text("notes"),
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  lastStatusChangeDate: timestamp("last_status_change_date").defaultNow().notNull(),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  candidate: one(candidates, {
    fields: [applications.candidateId],
    references: [candidates.id],
  }),
  jobPosting: one(jobPostings, {
    fields: [applications.jobPostingId],
    references: [jobPostings.id],
  }),
}));

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  applicationDate: true,
  lastStatusChangeDate: true,
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Interview type enum
export const interviewTypeEnum = pgEnum("interview_type", [
  "in_person", 
  "phone", 
  "video", 
  "assessment",
  "group"
]);

// Interview status enum
export const interviewStatusEnum = pgEnum("interview_status", [
  "scheduled",
  "confirmed",
  "canceled",
  "completed",
  "no_show"
]);

// Interviews
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applications.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60).notNull(), // in minutes
  interviewType: text("interview_type").default("in_person").notNull(), // Changed to text type for now
  location: text("location"), // Physical location or video conference link
  interviewerId: varchar("interviewer_id").references(() => users.id),
  notes: text("notes"),
  status: text("status").default("scheduled").notNull(), // Changed to text type for now
  feedback: text("feedback"),
  videoLink: text("video_link"), // For video interviews: link to join
  calendarEventId: text("calendar_event_id"), // Google Calendar event ID
  recordingPermission: boolean("recording_permission").default(false), // Consent to record
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviewsRelations = relations(interviews, ({ one }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
  interviewer: one(users, {
    fields: [interviews.interviewerId],
    references: [users.id],
  }),
}));

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
});

export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type Interview = typeof interviews.$inferSelect;

// Audit Logs for GDPR and security
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// Application Links for job applications
export const applicationLinks = pgTable("application_links", {
  id: serial("id").primaryKey(),
  jobPostingId: integer("job_posting_id").notNull().references(() => jobPostings.id),
  hash: text("hash").notNull().unique(),
  customUrlSlug: text("custom_url_slug"), // Optional custom URL slug override
  createdById: varchar("created_by_id").references(() => users.id),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").default(true).notNull(),
  clickCount: integer("click_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastClickedAt: timestamp("last_clicked_at"),
});

export const applicationLinksRelations = relations(applicationLinks, ({ one }) => ({
  jobPosting: one(jobPostings, {
    fields: [applicationLinks.jobPostingId],
    references: [jobPostings.id],
  }),
  createdBy: one(users, {
    fields: [applicationLinks.createdById],
    references: [users.id],
  }),
}));

export const insertApplicationLinkSchema = createInsertSchema(applicationLinks).omit({
  id: true,
  clickCount: true,
  createdAt: true,
  lastClickedAt: true,
});

export type InsertApplicationLink = z.infer<typeof insertApplicationLinkSchema>;
export type ApplicationLink = typeof applicationLinks.$inferSelect;
