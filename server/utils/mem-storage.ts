import { 
  type User, type UpsertUser,
  type JobPosting, type InsertJobPosting,
  type Candidate, type InsertCandidate,
  type Application, type InsertApplication,
  type Location, type InsertLocation,
  type Interview, type InsertInterview,
  type CommunicationLog, type InsertCommunicationLog,
  type AuditLog, type InsertAuditLog
} from "@shared/schema";

import { IStorage } from "../storage";

/**
 * In-memory storage implementation that mimics the behavior of the database
 * Used as a fallback when the database connection is not available
 */
class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private locations: Map<number, Location> = new Map();
  private jobPostings: Map<number, JobPosting> = new Map();
  private candidates: Map<number, Candidate> = new Map();
  private applications: Map<number, Application> = new Map();
  private interviews: Map<number, Interview> = new Map();
  private communicationLogs: Map<number, CommunicationLog> = new Map();
  private auditLogs: Map<number, AuditLog> = new Map();

  // Mock ID counters
  private locationId = 1;
  private jobPostingId = 1;
  private candidateId = 1;
  private applicationId = 1;
  private interviewId = 1;
  private communicationLogId = 1;
  private auditLogId = 1;

  constructor() {
    // Initialize with default HR admin user
    this.users.set('123456789', {
      id: '123456789',
      email: 'hr-admin@groearlylearning.com',
      firstName: 'HR',
      lastName: 'Admin',
      profileImageUrl: 'https://ui-avatars.com/api/?name=HR+Admin&background=0052CC&color=fff',
      role: 'hr_admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add sample locations
    const locations = [
      { name: 'Gold Coast Centre', city: 'Gold Coast', state: 'QLD' },
      { name: 'Brisbane North', city: 'Brisbane', state: 'QLD' },
      { name: 'Brisbane South', city: 'Brisbane', state: 'QLD' },
      { name: 'Sunshine Coast', city: 'Sunshine Coast', state: 'QLD' }
    ];
    
    locations.forEach(loc => {
      this.locations.set(this.locationId, {
        id: this.locationId,
        name: loc.name,
        city: loc.city,
        state: loc.state,
        createdAt: new Date()
      });
      this.locationId++;
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    this.users.set(user.id, user);
    return user;
  }

  // Location methods
  async getLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const id = this.locationId++;
    const newLocation = {
      id,
      ...location,
      createdAt: new Date()
    } as Location;

    this.locations.set(id, newLocation);
    return newLocation;
  }

  // Job posting methods
  async getJobPostings(filters?: { status?: string, locationId?: number }): Promise<(JobPosting & { locationName?: string, applicationCount?: number })[]> {
    let jobPostings = Array.from(this.jobPostings.values());

    if (filters) {
      if (filters.status) {
        jobPostings = jobPostings.filter(jp => jp.status === filters.status);
      }
      if (filters.locationId) {
        jobPostings = jobPostings.filter(jp => jp.locationId === filters.locationId);
      }
    }

    // Enhance with location name
    return jobPostings.map(jp => {
      const location = this.locations.get(jp.locationId);
      // Count applications for this job posting
      const applicationCount = Array.from(this.applications.values())
        .filter(app => app.jobPostingId === jp.id)
        .length;

      return {
        ...jp,
        locationName: location?.name,
        applicationCount
      };
    });
  }

  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }

  async createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting> {
    const id = this.jobPostingId++;
    const newJobPosting = {
      id,
      ...jobPosting,
      createdAt: new Date(),
      updatedAt: new Date()
    } as JobPosting;

    this.jobPostings.set(id, newJobPosting);
    return newJobPosting;
  }

  async updateJobPosting(id: number, jobPosting: Partial<InsertJobPosting>): Promise<JobPosting> {
    const existing = this.jobPostings.get(id);
    if (!existing) {
      throw new Error(`Job posting with id ${id} not found`);
    }

    const updated = {
      ...existing,
      ...jobPosting,
      updatedAt: new Date()
    };

    this.jobPostings.set(id, updated);
    return updated;
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    return this.jobPostings.delete(id);
  }

  // Candidate methods
  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async getCandidateByEmail(email: string): Promise<Candidate | undefined> {
    return Array.from(this.candidates.values()).find(c => c.email === email);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = this.candidateId++;
    const newCandidate = {
      id,
      ...candidate,
      createdAt: new Date()
    } as Candidate;

    this.candidates.set(id, newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate> {
    const existing = this.candidates.get(id);
    if (!existing) {
      throw new Error(`Candidate with id ${id} not found`);
    }

    const updated = {
      ...existing,
      ...candidate
    };

    this.candidates.set(id, updated);
    return updated;
  }

  // Application methods
  async getApplications(filters?: { status?: string, jobPostingId?: number, locationId?: number }): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } })[]> {
    let applications = Array.from(this.applications.values());

    if (filters) {
      if (filters.status) {
        applications = applications.filter(app => app.status === filters.status);
      }
      if (filters.jobPostingId) {
        applications = applications.filter(app => app.jobPostingId === filters.jobPostingId);
      }
      if (filters.locationId) {
        applications = applications.filter(app => {
          const jobPosting = this.jobPostings.get(app.jobPostingId);
          return jobPosting && jobPosting.locationId === filters.locationId;
        });
      }
    }

    return applications.map(app => {
      const candidate = this.candidates.get(app.candidateId);
      const jobPosting = this.jobPostings.get(app.jobPostingId);
      const location = jobPosting ? this.locations.get(jobPosting.locationId) : undefined;

      return {
        ...app,
        candidate,
        jobPosting: jobPosting ? {
          ...jobPosting,
          location
        } : undefined
      };
    });
  }

  async getApplication(id: number): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } }) | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;

    const candidate = this.candidates.get(app.candidateId);
    const jobPosting = this.jobPostings.get(app.jobPostingId);
    const location = jobPosting ? this.locations.get(jobPosting.locationId) : undefined;

    return {
      ...app,
      candidate,
      jobPosting: jobPosting ? {
        ...jobPosting,
        location
      } : undefined
    };
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationId++;
    const now = new Date();
    const newApplication = {
      id,
      ...application,
      applicationDate: now,
      lastStatusChangeDate: now
    } as Application;

    this.applications.set(id, newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application & { previousStatus?: string }> {
    const existing = this.applications.get(id);
    if (!existing) {
      throw new Error(`Application with id ${id} not found`);
    }

    const previousStatus = existing.status;
    const updated = {
      ...existing,
      status,
      lastStatusChangeDate: new Date()
    };

    this.applications.set(id, updated);
    return {
      ...updated,
      previousStatus
    };
  }

  // Interview methods
  async getInterviews(filters?: { applicationId?: number, status?: string, type?: string }): Promise<(Interview & { application?: Application & { candidate?: Candidate } })[]> {
    let interviews = Array.from(this.interviews.values());

    if (filters) {
      if (filters.applicationId) {
        interviews = interviews.filter(i => i.applicationId === filters.applicationId);
      }
      if (filters.status) {
        interviews = interviews.filter(i => i.status === filters.status);
      }
      if (filters.type) {
        interviews = interviews.filter(i => i.interviewType === filters.type);
      }
    }

    return interviews.map(interview => {
      const application = this.applications.get(interview.applicationId);
      const candidate = application ? this.candidates.get(application.candidateId) : undefined;

      return {
        ...interview,
        application: application ? {
          ...application,
          candidate
        } : undefined
      };
    });
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const id = this.interviewId++;
    const newInterview = {
      id,
      ...interview,
      createdAt: new Date()
    } as Interview;

    this.interviews.set(id, newInterview);
    return newInterview;
  }

  async updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview> {
    const existing = this.interviews.get(id);
    if (!existing) {
      throw new Error(`Interview with id ${id} not found`);
    }

    const updated = {
      ...existing,
      ...interview
    };

    this.interviews.set(id, updated);
    return updated;
  }

  // Communication log methods
  async getCommunicationLogs(candidateId: number): Promise<(CommunicationLog & { candidate?: Candidate })[]> {
    const logs = Array.from(this.communicationLogs.values())
      .filter(log => log.candidateId === candidateId);

    return logs.map(log => ({
      ...log,
      candidate: this.candidates.get(log.candidateId)
    }));
  }

  async getApplicationCommunicationLogs(applicationId: number): Promise<(CommunicationLog & { candidate?: Candidate })[]> {
    const logs = Array.from(this.communicationLogs.values())
      .filter(log => log.applicationId === applicationId);

    return logs.map(log => ({
      ...log,
      candidate: this.candidates.get(log.candidateId)
    }));
  }

  async createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    const id = this.communicationLogId++;
    const newLog = {
      id,
      ...log,
      timestamp: new Date()
    } as CommunicationLog;

    this.communicationLogs.set(id, newLog);
    return newLog;
  }

  // Audit log methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = this.auditLogId++;
    const newLog = {
      id,
      ...log,
      timestamp: new Date()
    } as AuditLog;

    this.auditLogs.set(id, newLog);
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
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    // Count active jobs
    const activeJobs = Array.from(this.jobPostings.values())
      .filter(job => job.status === 'active').length;

    // Count new applications in the last week
    const newApplications = Array.from(this.applications.values())
      .filter(app => new Date(app.applicationDate) >= oneWeekAgo).length;

    // Count upcoming interviews
    const interviews = Array.from(this.interviews.values())
      .filter(interview => 
        new Date(interview.scheduledDate) >= today && 
        ['scheduled', 'confirmed'].includes(interview.status)
      ).length;

    // Count filled positions
    const filled = Array.from(this.applications.values())
      .filter(app => app.status === 'hired').length;

    // Group applications by location
    const applicationsByLocation = Array.from(this.locations.values()).map(location => {
      const count = Array.from(this.applications.values())
        .filter(app => {
          const jobPosting = this.jobPostings.get(app.jobPostingId);
          return jobPosting && jobPosting.locationId === location.id;
        }).length;

      return {
        location: location.name,
        count
      };
    });

    // Group applications by position/job title
    const applicationsByPosition = Array.from(this.jobPostings.values()).map(job => {
      const count = Array.from(this.applications.values())
        .filter(app => app.jobPostingId === job.id).length;

      return {
        position: job.title,
        count
      };
    });

    return {
      activeJobs,
      newApplications,
      interviews,
      filled,
      applicationsByLocation,
      applicationsByPosition
    };
  }

  async getRecentApplications(limit: number = 5): Promise<(Application & { candidate?: Candidate, jobPosting?: JobPosting & { location?: Location } })[]> {
    const applications = Array.from(this.applications.values())
      .sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime())
      .slice(0, limit);

    return applications.map(app => {
      const candidate = this.candidates.get(app.candidateId);
      const jobPosting = this.jobPostings.get(app.jobPostingId);
      const location = jobPosting ? this.locations.get(jobPosting.locationId) : undefined;

      return {
        ...app,
        candidate,
        jobPosting: jobPosting ? {
          ...jobPosting,
          location
        } : undefined
      };
    });
  }

  // Video interview methods
  async scheduleVideoInterview(applicationId: number, interview: InsertInterview): Promise<Interview> {
    // Simulate scheduling a video interview
    return this.createInterview({
      ...interview,
      applicationId,
      videoLink: 'https://meet.google.com/mock-video-link',
      interviewType: 'video',
    });
  }

  async sendInterviewReminder(interviewId: number): Promise<boolean> {
    const interview = this.interviews.get(interviewId);
    if (!interview) {
      return false;
    }

    // Update the reminder sent status
    const updated = {
      ...interview,
      reminderSent: true
    };

    this.interviews.set(interviewId, updated);
    return true;
  }
}

export default MemStorage;