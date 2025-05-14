import { 
  users, type User, type UpsertUser,
  jobPostings, type JobPosting, type InsertJobPosting,
  candidates, type Candidate, type InsertCandidate,
  applications, type Application, type InsertApplication,
  locations, type Location, type InsertLocation,
  interviews, type Interview, type InsertInterview,
  communicationLogs, type CommunicationLog, type InsertCommunicationLog,
  auditLogs, type AuditLog, type InsertAuditLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, inArray, isNull, sql } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Location methods
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  
  // Job posting methods
  getJobPostings(filters?: { status?: string, locationId?: number }): Promise<(JobPosting & { locationName?: string, applicationCount?: number })[]>;
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, jobPosting: Partial<InsertJobPosting>): Promise<JobPosting>;
  deleteJobPosting(id: number): Promise<boolean>;
  
  // Candidate methods
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  getCandidateByEmail(email: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate>;
  
  // Application methods
  getApplications(filters?: { status?: string, jobPostingId?: number, locationId?: number }): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } })[]>;
  getApplication(id: number): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } }) | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  
  // Interview methods
  getInterviews(filters?: { applicationId?: number, status?: string, type?: string }): Promise<(Interview & { application?: Application & { candidate?: Candidate } })[]>;
  getInterview(id: number): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview>;
  scheduleVideoInterview(applicationId: number, interview: InsertInterview): Promise<Interview>;
  sendInterviewReminder(interviewId: number): Promise<boolean>;
  
  // Communication log methods
  getCommunicationLogs(candidateId: number): Promise<(CommunicationLog & { candidate?: Candidate })[]>;
  getApplicationCommunicationLogs(applicationId: number): Promise<(CommunicationLog & { candidate?: Candidate })[]>;
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  
  // Audit log methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Dashboard methods
  getDashboardStats(): Promise<{
    activeJobs: number;
    newApplications: number;
    interviews: number;
    filled: number;
    applicationsByLocation: Array<{ location: string; count: number }>;
    applicationsByPosition: Array<{ position: string; count: number }>;
  }>;
  getRecentApplications(limit?: number): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } })[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(asc(locations.name));
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location;
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  // Job posting methods
  async getJobPostings(filters?: { status?: string, locationId?: number }): Promise<(JobPosting & { locationName?: string, applicationCount?: number })[]> {
    const query = db
      .select({
        ...jobPostings,
        locationName: locations.name,
        applicationCount: sql<number>`(SELECT COUNT(*) FROM ${applications} WHERE ${applications.jobPostingId} = ${jobPostings.id})`,
      })
      .from(jobPostings)
      .leftJoin(locations, eq(jobPostings.locationId, locations.id))
      .orderBy(desc(jobPostings.createdAt));

    if (filters?.status) {
      query.where(eq(jobPostings.status, filters.status));
    }

    if (filters?.locationId) {
      query.where(eq(jobPostings.locationId, filters.locationId));
    }

    return await query;
  }

  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    const [jobPosting] = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, id));
    return jobPosting;
  }

  async createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting> {
    const [newJob] = await db.insert(jobPostings).values(jobPosting).returning();
    return newJob;
  }

  async updateJobPosting(id: number, jobPosting: Partial<InsertJobPosting>): Promise<JobPosting> {
    const [updatedJob] = await db
      .update(jobPostings)
      .set({ ...jobPosting, updatedAt: new Date() })
      .where(eq(jobPostings.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    await db.delete(jobPostings).where(eq(jobPostings.id, id));
    return true;
  }

  // Candidate methods
  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate;
  }

  async getCandidateByEmail(email: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.email, email));
    return candidate;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate> {
    const [updatedCandidate] = await db
      .update(candidates)
      .set(candidate)
      .where(eq(candidates.id, id))
      .returning();
    return updatedCandidate;
  }

  // Application methods
  async getApplications(filters?: { status?: string, jobPostingId?: number, locationId?: number }): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } })[]> {
    let query = db
      .select({
        ...applications,
        candidate: candidates,
        jobPosting: {
          ...jobPostings,
          location: locations,
        },
      })
      .from(applications)
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .leftJoin(jobPostings, eq(applications.jobPostingId, jobPostings.id))
      .leftJoin(locations, eq(jobPostings.locationId, locations.id))
      .orderBy(desc(applications.applicationDate));

    if (filters?.status) {
      query = query.where(eq(applications.status, filters.status));
    }

    if (filters?.jobPostingId) {
      query = query.where(eq(applications.jobPostingId, filters.jobPostingId));
    }

    if (filters?.locationId) {
      query = query.where(eq(jobPostings.locationId, filters.locationId));
    }

    return await query;
  }

  async getApplication(id: number): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } }) | undefined> {
    const [application] = await db
      .select({
        ...applications,
        candidate: candidates,
        jobPosting: {
          ...jobPostings,
          location: locations,
        },
      })
      .from(applications)
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .leftJoin(jobPostings, eq(applications.jobPostingId, jobPostings.id))
      .leftJoin(locations, eq(jobPostings.locationId, locations.id))
      .where(eq(applications.id, id));

    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application & { previousStatus?: string }> {
    // First get the current application to know its previous status
    const [currentApplication] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    
    if (!currentApplication) {
      throw new Error(`Application with ID ${id} not found`);
    }
    
    const previousStatus = currentApplication.status;
    
    // Update the application status
    const [updatedApplication] = await db
      .update(applications)
      .set({ 
        status: status as any, 
        lastStatusChangeDate: new Date() 
      })
      .where(eq(applications.id, id))
      .returning();
    
    // Log the status change in audit logs
    await this.createAuditLog({
      action: 'update_application_status',
      entityId: String(id),
      entityType: 'application',
      userId: '123456789', // Will be replaced with actual user ID
      details: JSON.stringify({ 
        previousStatus, 
        newStatus: status 
      }),
      createdAt: new Date()
    });

    // Return the updated application with previous status
    return { 
      ...updatedApplication, 
      previousStatus 
    };
  }

  // Interview methods
  async getInterviews(): Promise<(Interview & { application?: Application & { candidate?: Candidate } })[]> {
    return await db
      .select({
        ...interviews,
        application: {
          ...applications,
          candidate: candidates,
        },
      })
      .from(interviews)
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .orderBy(asc(interviews.scheduledDate));
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set(interview)
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  // Audit log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<{
    activeJobs: number;
    newApplications: number;
    interviews: number;
    filled: number;
    applicationsByLocation: Array<{ location: string; count: number }>;
    applicationsByPosition: Array<{ position: string; count: number }>;
  }> {
    // Count active jobs
    const [activeJobsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobPostings)
      .where(eq(jobPostings.status, 'active'));
    
    // Count applications submitted in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [newApplicationsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(sql`${applications.applicationDate} >= ${thirtyDaysAgo}`);
    
    // Count upcoming interviews and interview-related application statuses
    const [scheduledInterviewsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(interviews)
      .where(sql`${interviews.scheduledDate} >= now() AND ${interviews.status} = 'scheduled'`);
      
    const [interviewApplicationsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(
        sql`${applications.status}::text IN ('interview', 'interviewed')`
      );
    
    // Count positions filled (hired applications)
    const [filledResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, 'hired'));
    
    // Get applications by location
    const applicationsByLocation = await db
      .select({
        location: locations.name,
        count: sql<number>`count(*)`,
      })
      .from(applications)
      .leftJoin(jobPostings, eq(applications.jobPostingId, jobPostings.id))
      .leftJoin(locations, eq(jobPostings.locationId, locations.id))
      .groupBy(locations.name)
      .orderBy(desc(sql<number>`count(*)`));
    
    // Get applications by position/job title
    const applicationsByPosition = await db
      .select({
        position: jobPostings.title,
        count: sql<number>`count(*)`,
      })
      .from(applications)
      .leftJoin(jobPostings, eq(applications.jobPostingId, jobPostings.id))
      .groupBy(jobPostings.title)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(5);
    
    // Calculate total interview-related count (scheduled interviews + applications in interview process)
    const totalInterviewCount = 
      (scheduledInterviewsResult?.count || 0) + (interviewApplicationsResult?.count || 0);
      
    return {
      activeJobs: activeJobsResult?.count || 0,
      newApplications: newApplicationsResult?.count || 0,
      interviews: totalInterviewCount,
      filled: filledResult?.count || 0,
      applicationsByLocation,
      applicationsByPosition,
    };
  }

  async getRecentApplications(limit: number = 5): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } })[]> {
    return await db
      .select({
        ...applications,
        candidate: candidates,
        jobPosting: {
          ...jobPostings,
          location: locations,
        },
      })
      .from(applications)
      .leftJoin(candidates, eq(applications.candidateId, candidates.id))
      .leftJoin(jobPostings, eq(applications.jobPostingId, jobPostings.id))
      .leftJoin(locations, eq(jobPostings.locationId, locations.id))
      .orderBy(desc(applications.applicationDate))
      .limit(limit);
  }

  // Communication log methods
  async getCommunicationLogs(candidateId: number): Promise<(CommunicationLog & { candidate?: Candidate })[]> {
    const logs = await db
      .select({
        ...communicationLogs,
        candidate: candidates
      })
      .from(communicationLogs)
      .where(eq(communicationLogs.candidateId, candidateId))
      .leftJoin(candidates, eq(communicationLogs.candidateId, candidates.id))
      .orderBy(desc(communicationLogs.timestamp));
    return logs;
  }

  async getApplicationCommunicationLogs(applicationId: number): Promise<(CommunicationLog & { candidate?: Candidate })[]> {
    const logs = await db
      .select({
        ...communicationLogs,
        candidate: candidates
      })
      .from(communicationLogs)
      .where(eq(communicationLogs.applicationId, applicationId))
      .leftJoin(candidates, eq(communicationLogs.candidateId, candidates.id))
      .orderBy(desc(communicationLogs.timestamp));
    return logs;
  }

  async createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    const [communicationLog] = await db
      .insert(communicationLogs)
      .values(log)
      .returning();
    return communicationLog;
  }

  // Video interview methods
  async scheduleVideoInterview(applicationId: number, interview: InsertInterview): Promise<Interview> {
    // Ensure the interview is of video type
    const interviewData = {
      ...interview,
      applicationId,
      interviewType: 'video', 
      status: 'scheduled'
    };
    
    const [scheduledInterview] = await db
      .insert(interviews)
      .values(interviewData)
      .returning();
    
    // Get the application and candidate info for communication log
    const application = await this.getApplication(applicationId);
    
    if (application && application.candidate) {
      // Create a communication log for the scheduled interview
      await this.createCommunicationLog({
        candidateId: application.candidateId,
        applicationId,
        type: 'video_interview',
        subject: 'Video Interview Scheduled',
        message: `Video interview scheduled for ${new Date(interview.scheduledDate).toLocaleDateString()} at ${new Date(interview.scheduledDate).toLocaleTimeString()}`,
        direction: 'outbound',
        initiatedBy: interview.interviewerId,
        metadata: {
          interviewId: scheduledInterview.id,
          videoLink: interview.videoLink
        }
      });
    }
    
    return scheduledInterview;
  }

  async sendInterviewReminder(interviewId: number): Promise<boolean> {
    try {
      // Get the interview details
      const interviewData = await db
        .select({
          interview: interviews,
          application: applications,
          candidate: candidates
        })
        .from(interviews)
        .where(eq(interviews.id, interviewId))
        .leftJoin(applications, eq(interviews.applicationId, applications.id))
        .leftJoin(candidates, eq(applications.candidateId, candidates.id))
        .limit(1);
      
      if (!interviewData.length || !interviewData[0].candidate) {
        return false;
      }
      
      // Update the reminder status
      await db
        .update(interviews)
        .set({ reminderSent: true })
        .where(eq(interviews.id, interviewId));
      
      // Create a communication log for the reminder
      await this.createCommunicationLog({
        candidateId: interviewData[0].candidate.id,
        applicationId: interviewData[0].interview.applicationId,
        type: 'reminder',
        subject: 'Interview Reminder',
        message: `Reminder for your interview scheduled on ${new Date(interviewData[0].interview.scheduledDate).toLocaleDateString()} at ${new Date(interviewData[0].interview.scheduledDate).toLocaleTimeString()}`,
        direction: 'outbound',
        metadata: {
          interviewId,
          reminderType: 'automated',
          videoLink: interviewData[0].interview.videoLink
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error sending interview reminder:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
