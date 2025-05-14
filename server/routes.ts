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
import multer from "multer";
import path from "path";
import fs from "fs";
import { parseResume } from "./resume-parser";
import { z } from "zod";
import { upsertUserSchema, insertJobPostingSchema, insertCandidateSchema, insertApplicationSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, getUser } from "./simpleReplitAuth";

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
  
  // Route for sending custom email to a candidate
  app.post("/api/applications/:id/send-email", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { subject, message } = req.body;
      
      if (!subject || !message) {
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
      
      // Import the email service
      const { sendCustomEmail } = await import('./email-service');
      
      // Send the custom email
      const emailSent = await sendCustomEmail(
        application.candidate.email,
        subject,
        message,
        Number(id)
      );
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send email" });
      }
      
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
          const { sendApplicationStatusEmail } = await import('./email-service');
          
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
      const stats = await storage.getDashboardStats();
      return res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      return res.status(500).json({ message: "Error fetching dashboard statistics" });
    }
  });
  
  app.get("/api/dashboard/recent-applications", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 5;
      const applications = await storage.getRecentApplications(limit);
      return res.json(applications);
    } catch (error) {
      console.error("Get recent applications error:", error);
      return res.status(500).json({ message: "Error fetching recent applications" });
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
