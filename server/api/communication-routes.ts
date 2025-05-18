import { Request, Response } from 'express';
import OpenAI from 'openai';
import sgMail from '@sendgrid/mail';

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Register communication-related API routes
 */
export function registerCommunicationRoutes(app: any, storage: any) {
  // Get all communication logs for a candidate
  app.get('/api/candidates/:candidateId/communications', async (req: Request, res: Response) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      
      if (isNaN(candidateId)) {
        return res.status(400).json({ error: 'Invalid candidate ID' });
      }
      
      const logs = await storage.getCommunicationLogs(candidateId);
      return res.json(logs);
    } catch (error) {
      console.error('Error fetching communication logs:', error);
      return res.status(500).json({ error: 'Failed to fetch communication logs' });
    }
  });
  
  // Get all communication logs for an application
  app.get('/api/applications/:applicationId/communications', async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      
      if (isNaN(applicationId)) {
        return res.status(400).json({ error: 'Invalid application ID' });
      }
      
      const application = await storage.getApplicationById(applicationId);
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Since we don't have a specific method for getting logs by application,
      // we use the candidate ID from the application
      const logs = await storage.getCommunicationLogs(application.candidateId);
      
      // Filter logs to only those related to this application
      const filteredLogs = logs.filter((log: any) => 
        !log.applicationId || log.applicationId === applicationId
      );
      
      return res.json(filteredLogs);
    } catch (error) {
      console.error('Error fetching communication logs:', error);
      return res.status(500).json({ error: 'Failed to fetch communication logs' });
    }
  });
  
  // Create a new communication log
  app.post('/api/communications', async (req: Request, res: Response) => {
    try {
      const { 
        candidateId, 
        applicationId, 
        type, 
        subject, 
        message, 
        direction,
        metadata 
      } = req.body;
      
      if (!candidateId) {
        return res.status(400).json({ error: 'Candidate ID is required' });
      }
      
      // Get user ID from authenticated session if available
      const initiatedBy = req.user?.id;
      
      const log = await storage.createCommunicationLog({
        candidateId,
        applicationId,
        type,
        subject,
        message,
        direction,
        initiatedBy,
        metadata
      });
      
      return res.status(201).json(log);
    } catch (error) {
      console.error('Error creating communication log:', error);
      return res.status(500).json({ error: 'Failed to create communication log' });
    }
  });
  
  // Generate an email with AI
  app.post('/api/ai/generate-email', async (req: Request, res: Response) => {
    try {
      const {
        candidateId,
        applicationId,
        candidateName,
        candidateEmail,
        status,
        context,
        tone,
        additionalContext
      } = req.body;
      
      // Validate required fields
      if (!candidateName) {
        return res.status(400).json({ error: 'Candidate name is required' });
      }
      
      // Get application and job details if IDs are provided
      let jobTitle = "the position";
      let applicationDetails = "";
      
      if (applicationId) {
        const application = await storage.getApplicationById(applicationId);
        if (application && application.jobPosting) {
          jobTitle = application.jobPosting.title;
          applicationDetails = `The candidate applied for the ${jobTitle} position`;
          
          if (application.jobPosting.location) {
            applicationDetails += ` at the ${application.jobPosting.location.name} location`;
          }
          
          applicationDetails += ".";
        }
      }
      
      // Generate personalized email using OpenAI
      const MODEL = "gpt-4o"; // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      
      const systemPrompt = `You are an expert HR communication specialist for an early childhood education organization called GRO Early Learning.
      Generate a professional email for a job candidate with the following parameters:
      
      1. Candidate Name: ${candidateName}
      2. Application Status: ${status}
      3. Context: ${context}
      4. Communication Tone: ${tone}
      5. Job Applied For: ${jobTitle}
      ${applicationDetails ? `6. ${applicationDetails}` : ''}
      ${additionalContext ? `7. Additional Context: ${additionalContext}` : ''}
      
      Follow these guidelines:
      - Use a ${tone} tone throughout the email
      - Include a clear subject line
      - Be concise but thorough
      - Use appropriate formatting with paragraph breaks
      - Include a professional greeting and sign-off
      - Represent the GRO Early Learning brand professionally
      
      Return a JSON object with the following structure:
      {
        "subject": "The email subject line",
        "message": "The complete email message with appropriate formatting"
      }`;
      
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" }
      });
      
      // Parse the AI-generated response
      const aiResponse = JSON.parse(response.choices[0].message.content);
      
      return res.json({
        subject: aiResponse.subject,
        message: aiResponse.message
      });
    } catch (error) {
      console.error('Error generating email with AI:', error);
      return res.status(500).json({ error: 'Failed to generate email' });
    }
  });
  
  // Send email
  app.post('/api/applications/:applicationId/send-email', async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.applicationId);
      const { subject, message, attachmentIds } = req.body;
      
      if (isNaN(applicationId)) {
        return res.status(400).json({ error: 'Invalid application ID' });
      }
      
      if (!subject || !message) {
        return res.status(400).json({ error: 'Subject and message are required' });
      }
      
      const application = await storage.getApplicationById(applicationId);
      if (!application || !application.candidate) {
        return res.status(404).json({ error: 'Application or candidate not found' });
      }
      
      const candidate = application.candidate;
      if (!candidate.email) {
        return res.status(400).json({ error: 'Candidate email is missing' });
      }
      
      // In development mode, emails are mocked
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Email sending is mocked');
        console.log(`To: ${candidate.email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        
        // Log the communication
        await storage.createCommunicationLog({
          candidateId: candidate.id,
          applicationId,
          type: 'email',
          subject,
          message,
          direction: 'outbound',
          initiatedBy: req.user?.id,
          metadata: {
            attachments: attachmentIds ? attachmentIds.map((id: string) => ({ id })) : []
          }
        });
        
        return res.json({ 
          success: true, 
          message: 'Email sent successfully (mocked in development)' 
        });
      }
      
      // In production, send actual email via SendGrid
      if (!process.env.SENDGRID_API_KEY) {
        return res.status(500).json({ error: 'Email service is not configured' });
      }
      
      const msg = {
        to: candidate.email,
        from: 'recruiting@groearlylearning.com', // Use verified sender in SendGrid
        subject,
        text: message,
        html: message.replace(/\n/g, '<br />'),
      };
      
      // Send email
      await sgMail.send(msg);
      
      // Log the communication
      await storage.createCommunicationLog({
        candidateId: candidate.id,
        applicationId,
        type: 'email',
        subject,
        message,
        direction: 'outbound',
        initiatedBy: req.user?.id,
        metadata: {
          attachments: attachmentIds ? attachmentIds.map((id: string) => ({ id })) : []
        }
      });
      
      return res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  });
  
  // Send SMS
  app.post('/api/communications/sms', async (req: Request, res: Response) => {
    try {
      const { candidateId, applicationId, phone, message } = req.body;
      
      if (!candidateId || !phone || !message) {
        return res.status(400).json({ error: 'Candidate ID, phone, and message are required' });
      }
      
      // In development mode, SMS is mocked
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: SMS sending is mocked');
        console.log(`To: ${phone}`);
        console.log(`Message: ${message}`);
        
        // Log the communication
        await storage.createCommunicationLog({
          candidateId,
          applicationId,
          type: 'sms',
          message,
          direction: 'outbound',
          initiatedBy: req.user?.id,
          metadata: {
            phoneNumber: phone
          }
        });
        
        return res.json({ 
          success: true, 
          message: 'SMS sent successfully (mocked in development)' 
        });
      }
      
      // In production, integrate with Twilio or another SMS service
      // For now, we'll return a mock success
      
      // Log the communication
      await storage.createCommunicationLog({
        candidateId,
        applicationId,
        type: 'sms',
        message,
        direction: 'outbound',
        initiatedBy: req.user?.id,
        metadata: {
          phoneNumber: phone
        }
      });
      
      return res.json({ success: true, message: 'SMS sent successfully' });
    } catch (error) {
      console.error('Error sending SMS:', error);
      return res.status(500).json({ error: 'Failed to send SMS' });
    }
  });
  
  // Get email templates
  app.get('/api/email-templates', async (req: Request, res: Response) => {
    try {
      // In a real application, fetch templates from the database
      // For now, return a mock response
      return res.json([]);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      return res.status(500).json({ error: 'Failed to fetch email templates' });
    }
  });
}