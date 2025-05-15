import type { Express, Request as ExpressRequest, Response } from "express";

// Extended Request type to include user
interface Request extends ExpressRequest {
  user?: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    role?: string;
  };
  isAuthenticated(): boolean;
}
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { databaseConnected } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { parseResume } from "./resume-parser";
import { z } from "zod";
import { upsertUserSchema, insertJobPostingSchema, insertCandidateSchema, insertApplicationSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, getUser } from "./simpleReplitAuth";
import {
  getAvailableTimeSlots,
  createInterviewEvent,
  updateInterviewEvent,
  cancelInterview,
  getInterviewEvent
} from './calendar-service';

// Define upload directory and setup multer
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ 
  storage: resumeStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // TEMPORARILY DISABLED AUTHENTICATION
      // Use mock user if not logged in
      const mockUser = {
        id: "123456789",
        email: "hr-admin@groearlylearning.com",
        firstName: "HR",
        lastName: "Admin",
        profileImageUrl: "https://ui-avatars.com/api/?name=HR+Admin&background=0052CC&color=fff",
        role: "hr_admin"
      };
      
      const user = req.user || mockUser;
      console.log("Authenticated user request, user:", user);
      
      // Create audit log (this is optional)
      try {
        await storage.createAuditLog({
          userId: user.id,
          action: "auto_login",
          details: "User automatically authenticated due to disabled auth",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });
      } catch (logError) {
        console.warn("Failed to create audit log:", logError);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error handling user request:", error);
      res.status(500).json({ 
        message: "Failed to fetch user", 
        error: String(error) 
      });
    }
  });
  
  // Location routes
  app.get("/api/locations", async (req: Request, res: Response) => {
    try {
      const locations = await storage.getLocations();
      return res.json(locations);
    } catch (error) {
      console.error("Get locations error:", error);
      return res.status(500).json({ message: "Error fetching locations" });
    }
  });
  
  // Job posting routes
  app.get("/api/job-postings", async (req: Request, res: Response) => {
    try {
      const { status, locationId } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (locationId) filters.locationId = Number(locationId);
      
      const jobPostings = await storage.getJobPostings(filters);
      return res.json(jobPostings);
    } catch (error) {
      console.error("Get job postings error:", error);
      return res.status(500).json({ message: "Error fetching job postings" });
    }
  });
  
  app.get("/api/job-postings/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const jobPosting = await storage.getJobPosting(Number(id));
      
      if (!jobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      return res.json(jobPosting);
    } catch (error) {
      console.error("Get job posting error:", error);
      return res.status(500).json({ message: "Error fetching job posting" });
    }
  });
  
  app.post("/api/job-postings", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const jobPostingData = insertJobPostingSchema.parse(req.body);
      
      // Add the current user as the creator
      const jobPostingWithUser = {
        ...jobPostingData,
        createdById: req.user?.id,
      };
      
      const newJobPosting = await storage.createJobPosting(jobPostingWithUser);
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "create_job_posting",
        details: `Created job posting ID: ${newJobPosting.id}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.status(201).json(newJobPosting);
    } catch (error) {
      console.error("Create job posting error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job posting data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating job posting" });
    }
  });
  
  app.put("/api/job-postings/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const jobPostingData = req.body;
      
      // Validate job posting exists
      const existingJob = await storage.getJobPosting(Number(id));
      if (!existingJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      const updatedJobPosting = await storage.updateJobPosting(Number(id), jobPostingData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "update_job_posting",
        details: `Updated job posting ID: ${id}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.json(updatedJobPosting);
    } catch (error) {
      console.error("Update job posting error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job posting data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error updating job posting" });
    }
  });
  
  app.delete("/api/job-postings/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Validate job posting exists
      const existingJob = await storage.getJobPosting(Number(id));
      if (!existingJob) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      await storage.deleteJobPosting(Number(id));
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "delete_job_posting",
        details: `Deleted job posting ID: ${id}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.json({ message: "Job posting deleted successfully" });
    } catch (error) {
      console.error("Delete job posting error:", error);
      return res.status(500).json({ message: "Error deleting job posting" });
    }
  });
  
  // Candidate and application routes
  
  // Get all candidates
  app.get("/api/candidates", async (req: Request, res: Response) => {
    try {
      const candidates = await storage.getCandidates();
      return res.json(candidates);
    } catch (error) {
      console.error("Get candidates error:", error);
      return res.status(500).json({ message: "Error fetching candidates" });
    }
  });
  
  // Get specific candidate
  app.get("/api/candidates/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const candidate = await storage.getCandidate(Number(id));
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      return res.json(candidate);
    } catch (error) {
      console.error("Get candidate error:", error);
      return res.status(500).json({ message: "Error fetching candidate" });
    }
  });
  
  app.post("/api/candidates", upload.single("resume"), async (req: Request, res: Response) => {
    try {
      // Cast req to any to access file property from multer
      const file = (req as any).file;
      let candidateData = req.body;
      
      if (file) {
        const resumePath = file.path;
        // Extract information from resume
        const resumeData = await parseResume(resumePath);
        
        candidateData = {
          ...candidateData,
          resumePath,
          ...resumeData,
        };
      }
      
      // Validate and create candidate
      const candidateToCreate = insertCandidateSchema.parse({
        ...candidateData,
        consentDate: new Date(),
        consentPolicyVersion: "1.0",
      });
      
      // Check if candidate already exists
      const existingCandidate = await storage.getCandidateByEmail(candidateToCreate.email);
      let candidate;
      
      if (existingCandidate) {
        // Update existing candidate
        candidate = await storage.updateCandidate(existingCandidate.id, candidateToCreate);
      } else {
        // Create new candidate
        candidate = await storage.createCandidate(candidateToCreate);
      }
      
      // Create audit log for GDPR compliance
      await storage.createAuditLog({
        action: "create_candidate",
        details: `Candidate ID: ${candidate.id}, Email: ${candidate.email}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.status(201).json(candidate);
    } catch (error) {
      console.error("Create candidate error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating candidate" });
    }
  });
  
  app.post("/api/applications", async (req: Request, res: Response) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      
      // Validate job posting exists
      const jobPosting = await storage.getJobPosting(applicationData.jobPostingId);
      if (!jobPosting) {
        return res.status(400).json({ message: "Job posting not found" });
      }
      
      // Validate candidate exists
      const candidate = await storage.getCandidate(applicationData.candidateId);
      if (!candidate) {
        return res.status(400).json({ message: "Candidate not found" });
      }
      
      const newApplication = await storage.createApplication(applicationData);
      
      // Create audit log
      await storage.createAuditLog({
        action: "create_application",
        details: `Application ID: ${newApplication.id}, Candidate ID: ${applicationData.candidateId}, Job ID: ${applicationData.jobPostingId}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.status(201).json(newApplication);
    } catch (error) {
      console.error("Create application error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating application" });
    }
  });
  
  app.get("/api/applications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { status, jobPostingId, locationId } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (jobPostingId) filters.jobPostingId = Number(jobPostingId);
      if (locationId) filters.locationId = Number(locationId);
      
      const applications = await storage.getApplications(filters);
      return res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      return res.status(500).json({ message: "Error fetching applications" });
    }
  });
  
  app.get("/api/applications/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const application = await storage.getApplication(Number(id));
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      return res.json(application);
    } catch (error) {
      console.error("Get application error:", error);
      return res.status(500).json({ message: "Error fetching application" });
    }
  });
  
  // Interview routes
  app.get("/api/interviews", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const interviews = await storage.getInterviews();
      return res.json(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      return res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.get("/api/interviews/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const interviewId = parseInt(req.params.id);
      const interview = await storage.getInterview(interviewId);
      
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      return res.json(interview);
    } catch (error) {
      console.error("Error fetching interview:", error);
      return res.status(500).json({ message: "Failed to fetch interview" });
    }
  });
  
  // Schedule a video interview for an application
  // Get available time slots for interview scheduling
  app.get("/api/calendar/available-slots", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const dateParam = req.query.date as string;
      
      if (!dateParam) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const timeSlots = await getAvailableTimeSlots(date);
      return res.json(timeSlots);
    } catch (error) {
      console.error("Error getting available time slots:", error);
      return res.status(500).json({ message: "Failed to get available time slots" });
    }
  });

  app.post("/api/applications/:id/schedule-interview", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        scheduledDate,
        duration,
        interviewType,
        location,
        recordingPermission,
        notes,
        interviewerEmail,
      } = req.body;
      
      // Basic validation
      if (!scheduledDate || !duration || !interviewType) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Verify the application exists
      const application = await storage.getApplication(Number(id));
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const isVideoInterview = interviewType === "video";
      const startDateTime = new Date(scheduledDate);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + Number(duration));
      
      // Create calendar event if the application has a candidate and job posting
      let eventId = '';
      let videoLink;
      
      if (application.candidate && application.jobPosting) {
        try {
          // Create calendar event
          const calendarResult = await createInterviewEvent({
            candidateId: application.candidate.id,
            applicationId: application.id,
            candidateName: application.candidate.name,
            candidateEmail: application.candidate.email,
            interviewerName: req.user?.firstName && req.user?.lastName 
              ? `${req.user.firstName} ${req.user.lastName}` 
              : 'HR Admin',
            interviewerEmail: interviewerEmail || req.user?.email || 'hr-admin@groearlylearning.com',
            position: application.jobPosting.title,
            startDateTime,
            endDateTime,
            location: location || (isVideoInterview ? undefined : 'GRO Early Learning Office'),
            isVideoInterview,
            notes: notes || '',
          });
          
          eventId = calendarResult.eventId;
          videoLink = calendarResult.videoLink;
          
          console.log(`Created calendar event: ${eventId} with video link: ${videoLink || 'N/A'}`);
        } catch (calendarError) {
          console.error("Error creating calendar event:", calendarError);
          // Continue with the interview scheduling even if calendar creation fails
        }
      }
      
      // Schedule the interview
      const interview = await storage.scheduleVideoInterview(Number(id), {
        applicationId: Number(id),
        scheduledDate: startDateTime,
        duration: Number(duration),
        interviewType: interviewType,
        interviewerId: req.user?.id,
        videoLink: videoLink || (isVideoInterview ? req.body.videoLink : undefined),
        recordingPermission: recordingPermission,
        location: isVideoInterview ? "Video Conference" : (location || "GRO Early Learning Office"),
        notes: notes || "",
        status: "scheduled",
        calendarEventId: eventId || undefined
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "schedule_interview",
        details: `Scheduled ${interviewType} interview for application ID: ${id}${eventId ? ' with calendar event' : ''}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.json(interview);
    } catch (error) {
      console.error("Schedule interview error:", error);
      return res.status(500).json({ message: "Error scheduling interview" });
    }
  });
  
  // Retrieve communications for an application
  app.get("/api/applications/:id/communications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const logs = await storage.getApplicationCommunicationLogs(Number(id));
      return res.json(logs);
    } catch (error) {
      console.error("Get application communications error:", error);
      return res.status(500).json({ message: "Error fetching communication logs" });
    }
  });
  
  // Retrieve communications for a candidate
  app.get("/api/candidates/:id/communications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const logs = await storage.getCommunicationLogs(Number(id));
      return res.json(logs);
    } catch (error) {
      console.error("Get candidate communications error:", error);
      return res.status(500).json({ message: "Error fetching communication logs" });
    }
  });
  
  // Route for sending custom email to a candidate
  app.post("/api/applications/:id/send-email", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { subject, message, useAI, status, additionalContext } = req.body;
      
      // If useAI is false or not provided, subject and message are required
      if (!useAI && (!subject || !message)) {
        return res.status(400).json({ message: "Subject and message are required" });
      }
      
      // Get application with candidate details
      const application = await storage.getApplication(Number(id));
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      if (!application.candidate?.email) {
        return res.status(400).json({ message: "Candidate email not found" });
      }
      
      let emailSubject = subject;
      let emailMessage = message;
      
      // If useAI is true and OpenAI API key is available, generate email content
      if (useAI && process.env.OPENAI_API_KEY) {
        try {
          console.log("Generating AI email response...");
          // Import the OpenAI service
          const { generatePersonalizedEmail } = await import('./openai-service');
          
          // Generate personalized email
          const generatedEmail = await generatePersonalizedEmail(
            application.candidate?.name || "Candidate",
            application.jobPosting?.title || "Position",
            status || application.status,
            additionalContext
          );
          
          emailSubject = generatedEmail.subject;
          emailMessage = generatedEmail.body;
          console.log("AI email generation successful");
        } catch (aiError) {
          console.error("AI email generation error:", aiError);
          // If AI generation fails and no fallback content is provided
          if (!subject || !message) {
            return res.status(500).json({ 
              message: "Failed to generate email with AI and no fallback content provided" 
            });
          }
          // Continue with provided subject and message as fallback
        }
      }
      
      // Import the Gmail service 
      const { sendCustomEmail } = await import('./gmail-service');
      
      // Send the custom email
      const emailSent = await sendCustomEmail(
        application.candidate.email,
        emailSubject,
        emailMessage,
        Number(id)
      );
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send email" });
      }
      
      // Log the communication in the database
      await storage.createCommunicationLog({
        candidateId: application.candidateId,
        applicationId: Number(id),
        type: "email",
        subject: emailSubject,
        message: emailMessage,
        direction: "outbound",
        initiatedBy: req.user?.id,
        metadata: { 
          deliveryStatus: "sent",
          aiGenerated: useAI && process.env.OPENAI_API_KEY ? true : false
        }
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "send_custom_email",
        details: `Sent custom email to candidate for application ID: ${id}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Send custom email error:", error);
      return res.status(500).json({ message: "Error sending custom email" });
    }
  });
  
  app.patch("/api/applications/:id/status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Validate application exists
      const application = await storage.getApplication(Number(id));
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Update the application status and get the previous status
      const updatedApplication = await storage.updateApplicationStatus(Number(id), status);
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "update_application_status",
        details: `Updated application ID: ${id} status to: ${status}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      // Import the email service and attempt to send a notification email
      try {
        // Get fresh application data with all relationships loaded
        const fullApplication = await storage.getApplication(Number(id));
        
        if (fullApplication && fullApplication.candidate?.email) {
          const { sendApplicationStatusEmail } = await import('./gmail-service');
          
          // Send status update email
          await sendApplicationStatusEmail(
            fullApplication, 
            updatedApplication.previousStatus || ''
          );
          
          console.log(`Email notification sent for application ${id} status change to ${status}`);
        }
      } catch (emailError) {
        // Log email error but don't fail the API response
        console.error("Error sending status update email:", emailError);
      }
      
      return res.json(updatedApplication);
    } catch (error) {
      console.error("Update application status error:", error);
      return res.status(500).json({ message: "Error updating application status" });
    }
  });
  
  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Check for status filter in query param
      const statusFilter = req.query.status as string;
      const stats = await storage.getDashboardStats(statusFilter ? { status: statusFilter } : undefined);
      return res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return res.status(500).json({ message: "Error fetching dashboard statistics" });
    }
  });
  
  app.get("/api/dashboard/recent-applications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const statusFilter = req.query.status as string;

      // Apply status filter if provided
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const applications = await storage.getRecentApplications(limit, filters);
      
      return res.json(applications);
    } catch (error) {
      console.error("Get recent applications error:", error);
      return res.status(500).json({ message: "Error fetching recent applications" });
    }
  });
  
  // Test route for Gmail integration
  app.get("/api/test/gmail", isAuthenticated, async (req: Request, res: Response) => {
    try {
      if (!req.user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      
      // Import the Gmail service
      const { sendCustomEmail } = await import('./gmail-service');
      
      // Send a test email to the current user
      const emailSent = await sendCustomEmail(
        req.user.email,
        "ATS Email System Test",
        "<p>This is a test email from your GRO Early Learning ATS system.</p><p>If you received this email, Gmail integration is working correctly!</p>"
      );
      
      if (emailSent) {
        // Create audit log
        await storage.createAuditLog({
          userId: req.user?.id,
          action: "test_gmail",
          details: "Sent test email via Gmail",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        });
        
        // Log the communication if there are candidates in the system
        try {
          const candidates = await storage.getCandidates();
          if (candidates.length > 0) {
            await storage.createCommunicationLog({
              candidateId: candidates[0].id,
              type: "test_email",
              subject: "ATS Email System Test",
              message: "This is a test email from your GRO Early Learning ATS system. If you received this email, Gmail integration is working correctly!",
              direction: "outbound",
              initiatedBy: req.user?.id,
              metadata: { 
                test: true,
                deliveryStatus: "sent" 
              }
            });
          }
        } catch (logError) {
          console.error("Could not log test communication:", logError);
        }
        
        return res.json({ message: "Test email sent successfully" });
      } else {
        return res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Gmail test error:", error);
      return res.status(500).json({ message: "Error testing Gmail integration", error: String(error) });
    }
  });

  // Route for matching a candidate to a specific job posting with AI
  app.get("/api/candidates/:candidateId/match/:jobPostingId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { candidateId, jobPostingId } = req.params;
      
      // Get candidate details
      const candidate = await storage.getCandidate(Number(candidateId));
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Get job posting details
      const jobPosting = await storage.getJobPosting(Number(jobPostingId));
      if (!jobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "OpenAI API key not configured. Unable to perform candidate matching." });
      }

      // Get location info for job posting
      let locationName;
      if (jobPosting.locationId) {
        const location = await storage.getLocation(jobPosting.locationId);
        locationName = location?.name;
      }
      
      // Prepare candidate resume/profile data
      const candidateResume = `
Name: ${candidate.name}
Email: ${candidate.email}
Phone: ${candidate.phone || "Not provided"}
Location: ${candidate.location || "Not specified"}
Skills: ${candidate.skills || "Not specified"}
Experience: ${candidate.experience || "Not specified"}
Education: ${candidate.education || "Not specified"}
Certifications: ${candidate.certifications || "Not specified"}
Resume Summary: ${candidate.summary || "Not provided"}
`;
      
      // Prepare job requirements
      const jobRequirements = `
Job Title: ${jobPosting.title}
Location: ${locationName || "Not specified"}
Description: ${jobPosting.description}
Requirements: ${jobPosting.requirements}
Qualifications: ${jobPosting.qualifications || "Not specified"}
Employment Type: ${jobPosting.employmentType}
`;
      
      // Import OpenAI service
      const { matchCandidateToJob } = await import('./openai-service');
      
      // Get the match analysis
      console.log(`Analyzing match between candidate ${candidateId} and job posting ${jobPostingId}`);
      const matchResult = await matchCandidateToJob(candidateResume, jobRequirements);
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CANDIDATE_JOB_MATCH",
        entityType: "candidate",
        entityId: Number(candidateId),
        details: {
          candidateId: Number(candidateId),
          jobPostingId: Number(jobPostingId),
          matchScore: matchResult.score,
          timestamp: new Date().toISOString()
        }
      });
      
      // Enhance the result with additional context
      const enhancedResult = {
        ...matchResult,
        candidateName: candidate.name,
        jobTitle: jobPosting.title,
        jobLocation: locationName,
      };
      
      return res.json(enhancedResult);
    } catch (error) {
      console.error("Error matching candidate to job:", error);
      return res.status(500).json({ message: "Error analyzing candidate match", error: error.message });
    }
  });

  // Route for AI-powered candidate recommendations
  app.post("/api/job-postings/:id/recommend-candidates", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { count = 5 } = req.body;
      
      // Get job posting details
      const jobPosting = await storage.getJobPosting(Number(id));
      
      if (!jobPosting) {
        return res.status(404).json({ message: "Job posting not found" });
      }
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ message: "OpenAI API key not configured. Unable to perform candidate matching." });
      }
      
      // Get all candidates from the database
      const candidates = await storage.getCandidates();
      
      if (!candidates || candidates.length === 0) {
        return res.json({ 
          recommendations: [], 
          analysisInsights: "No candidates available in the system for analysis."
        });
      }
      
      // Prepare location name for the job posting
      let locationName;
      if (jobPosting.locationId) {
        const location = await storage.getLocation(jobPosting.locationId);
        locationName = location?.name;
      }
      
      // Format job and candidate data for the AI recommendation engine
      const jobData = {
        id: jobPosting.id,
        title: jobPosting.title,
        description: jobPosting.description,
        requirements: jobPosting.requirements,
        locationName: locationName
      };
      
      const candidateData = candidates.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        profile: candidate.summary || "",
        skills: candidate.skills ? (typeof candidate.skills === 'string' ? 
          candidate.skills.split(',').map(s => s.trim()) : 
          candidate.skills) : [],
        experience: candidate.experience || "",
        resume: candidate.resume || ""
      }));
      
      // Import the OpenAI service
      const { recommendCandidates } = await import('./openai-service');
      
      // Get AI recommendations
      console.log("Getting AI recommendations for job posting:", jobPosting.title);
      const recommendations = await recommendCandidates(candidateData, jobData, Number(count));
      
      // Log recommendation for audit purposes
      await storage.createAuditLog({
        userId: req.user?.id,
        action: "CANDIDATE_RECOMMENDATION",
        entityType: "job_posting",
        entityId: jobPosting.id,
        details: {
          jobPostingId: jobPosting.id,
          jobTitle: jobPosting.title,
          candidateCount: candidates.length,
          recommendationCount: recommendations.recommendations.length,
          timestamp: new Date().toISOString()
        }
      });
      
      return res.json(recommendations);
    } catch (error) {
      console.error("Error recommending candidates:", error);
      res.status(500).json({ 
        message: "Error generating candidate recommendations", 
        error: error.message 
      });
    }
  });

  // GDPR routes for data access and deletion
  app.post("/api/data-access-request", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const candidate = await storage.getCandidateByEmail(email);
      
      if (!candidate) {
        return res.status(404).json({ message: "No data found for this email address" });
      }
      
      // In a real application, you would send this data via email to verify identity
      // For now, we'll just return it directly with a warning
      
      // Create audit log
      await storage.createAuditLog({
        action: "data_access_request",
        details: `Data access request for email: ${email}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.json({
        message: "Data access request received. In a production environment, this data would be sent securely to your email after verification.",
        data: candidate,
      });
    } catch (error) {
      console.error("Data access request error:", error);
      return res.status(500).json({ message: "Error processing data access request" });
    }
  });
  
  app.post("/api/data-deletion-request", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const candidate = await storage.getCandidateByEmail(email);
      
      if (!candidate) {
        return res.status(404).json({ message: "No data found for this email address" });
      }
      
      // In a real application, you would initiate a validation process before deletion
      // For now, we'll just acknowledge the request
      
      // Create audit log
      await storage.createAuditLog({
        action: "data_deletion_request",
        details: `Data deletion request for email: ${email}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
      
      return res.json({
        message: "Data deletion request received. In a production environment, this would initiate a verification process before actual deletion.",
        requestId: Date.now(),
      });
    } catch (error) {
      console.error("Data deletion request error:", error);
      return res.status(500).json({ message: "Error processing data deletion request" });
    }
  });

  return httpServer;
}
