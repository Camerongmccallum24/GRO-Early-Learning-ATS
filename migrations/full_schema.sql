-- Create enums
CREATE TYPE "application_status" AS ENUM ('applied', 'in_review', 'interview', 'interviewed', 'offered', 'hired', 'rejected');
CREATE TYPE "job_status" AS ENUM ('draft', 'active', 'closed');
CREATE TYPE "employment_type" AS ENUM ('full_time', 'part_time', 'casual', 'contract');
CREATE TYPE "interview_type" AS ENUM ('in_person', 'phone', 'video', 'assessment', 'group');
CREATE TYPE "interview_status" AS ENUM ('scheduled', 'confirmed', 'canceled', 'completed', 'no_show');

-- Create tables
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY NOT NULL,
  "email" varchar UNIQUE,
  "first_name" varchar,
  "last_name" varchar,
  "profile_image_url" varchar,
  "role" text DEFAULT 'hr_admin' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "locations" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "city" text NOT NULL,
  "state" text DEFAULT 'QLD' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "job_postings" (
  "id" serial PRIMARY KEY,
  "title" text NOT NULL,
  "location_id" integer NOT NULL,
  "employment_type" employment_type NOT NULL,
  "salary_range" text,
  "qualifications" text NOT NULL,
  "description" text NOT NULL,
  "requirements" text,
  "benefits" text,
  "deadline" date,
  "status" job_status DEFAULT 'draft' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "created_by_id" varchar,
  FOREIGN KEY ("location_id") REFERENCES "locations" ("id"),
  FOREIGN KEY ("created_by_id") REFERENCES "users" ("id")
);

CREATE TABLE IF NOT EXISTS "candidates" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "phone" text,
  "resume_path" text,
  "skills" text,
  "experience" text,
  "education" text,
  "consent_date" timestamp DEFAULT now() NOT NULL,
  "consent_policy_version" text DEFAULT '1.0' NOT NULL,
  "ccpa_opt_out" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "applications" (
  "id" serial PRIMARY KEY,
  "candidate_id" integer NOT NULL,
  "job_posting_id" integer NOT NULL,
  "status" application_status DEFAULT 'applied' NOT NULL,
  "source" text DEFAULT 'direct' NOT NULL,
  "notes" text,
  "application_date" timestamp DEFAULT now() NOT NULL,
  "last_status_change_date" timestamp DEFAULT now() NOT NULL,
  FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id"),
  FOREIGN KEY ("job_posting_id") REFERENCES "job_postings" ("id")
);

CREATE TABLE IF NOT EXISTS "interviews" (
  "id" serial PRIMARY KEY,
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
  "calendar_event_id" text,
  "recording_permission" boolean DEFAULT false,
  "reminder_sent" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  FOREIGN KEY ("application_id") REFERENCES "applications" ("id"),
  FOREIGN KEY ("interviewer_id") REFERENCES "users" ("id")
);

CREATE TABLE IF NOT EXISTS "communication_logs" (
  "id" serial PRIMARY KEY,
  "candidate_id" integer NOT NULL,
  "application_id" integer,
  "type" text NOT NULL,
  "subject" text,
  "message" text,
  "direction" text DEFAULT 'outbound' NOT NULL,
  "initiated_by" varchar,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "metadata" jsonb,
  FOREIGN KEY ("candidate_id") REFERENCES "candidates" ("id"),
  FOREIGN KEY ("application_id") REFERENCES "applications" ("id"),
  FOREIGN KEY ("initiated_by") REFERENCES "users" ("id")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" serial PRIMARY KEY,
  "user_id" varchar,
  "action" text NOT NULL,
  "details" text,
  "ip_address" text,
  "user_agent" text,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);

-- Insert starter data
-- Insert a default HR Admin user
INSERT INTO "users" ("id", "email", "first_name", "last_name", "profile_image_url", "role") 
VALUES ('123456789', 'hr-admin@groearlylearning.com', 'HR', 'Admin', 'https://ui-avatars.com/api/?name=HR+Admin&background=0052CC&color=fff', 'hr_admin')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample locations
INSERT INTO "locations" ("name", "city", "state") 
VALUES 
('Gold Coast Centre', 'Gold Coast', 'QLD'),
('Brisbane North', 'Brisbane', 'QLD'),
('Brisbane South', 'Brisbane', 'QLD'),
('Sunshine Coast', 'Sunshine Coast', 'QLD')
ON CONFLICT DO NOTHING;