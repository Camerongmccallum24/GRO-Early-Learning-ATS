CREATE TYPE "public"."application_status" AS ENUM('applied', 'in_review', 'interview', 'offered', 'hired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."employment_type" AS ENUM('full_time', 'part_time', 'casual', 'contract');--> statement-breakpoint
CREATE TYPE "public"."interview_status" AS ENUM('scheduled', 'confirmed', 'canceled', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."interview_type" AS ENUM('in_person', 'phone', 'video', 'assessment', 'group');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('draft', 'active', 'closed');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"job_posting_id" integer NOT NULL,
	"status" "application_status" DEFAULT 'applied' NOT NULL,
	"source" text DEFAULT 'direct' NOT NULL,
	"notes" text,
	"application_date" timestamp DEFAULT now() NOT NULL,
	"last_status_change_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"action" text NOT NULL,
	"details" text,
	"ip_address" text,
	"user_agent" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"resume_path" text,
	"skills" text,
	"experience" text,
	"education" text,
	"consent_date" timestamp DEFAULT now() NOT NULL,
	"consent_policy_version" text DEFAULT '1.0' NOT NULL,
	"ccpa_opt_out" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "candidates_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "communication_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidate_id" integer NOT NULL,
	"application_id" integer,
	"type" text NOT NULL,
	"subject" text,
	"message" text,
	"direction" text DEFAULT 'outbound' NOT NULL,
	"initiated_by" varchar,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "interviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"scheduled_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60 NOT NULL,
	"interview_type" text DEFAULT 'in_person' NOT NULL,
	"location" text,
	"interviewer_id" varchar,
	"notes" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"feedback" text,
	"video_link" text,
	"recording_permission" boolean DEFAULT false,
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"location_id" integer NOT NULL,
	"employment_type" "employment_type" NOT NULL,
	"salary_range" text,
	"qualifications" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"benefits" text,
	"deadline" date,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" varchar
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state" text DEFAULT 'QLD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" text DEFAULT 'hr_admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_logs" ADD CONSTRAINT "communication_logs_initiated_by_users_id_fk" FOREIGN KEY ("initiated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_id_users_id_fk" FOREIGN KEY ("interviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");