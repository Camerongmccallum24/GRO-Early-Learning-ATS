import { MailService } from '@sendgrid/mail';
import { Application } from '@shared/schema';

// Initialize SendGrid
const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('SendGrid API key set successfully');
} else {
  console.error('SENDGRID_API_KEY environment variable not set');
}

// Default sender email - This should be a verified sender in SendGrid
const DEFAULT_FROM_EMAIL = 'notifications@example.com'; // Replace with verified sender

// Email templates for different application statuses
const EMAIL_TEMPLATES = {
  applied: {
    subject: 'Application Received - GRO Early Learning',
    text: (candidateName: string, position: string) => 
      `Dear ${candidateName},\n\nThank you for applying for the ${position} position at GRO Early Learning. We have received your application and will review it shortly.\n\nBest regards,\nHR Team\nGRO Early Learning`,
    html: (candidateName: string, position: string) => 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0052CC; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRO Early Learning</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Dear ${candidateName},</p>
          <p>Thank you for applying for the <strong>${position}</strong> position at GRO Early Learning.</p>
          <p>We have received your application and will review it shortly.</p>
          <p>We appreciate your interest in joining our team!</p>
          <p>Best regards,<br>HR Team<br>GRO Early Learning</p>
        </div>
      </div>`
  },
  screening: {
    subject: 'Application Under Review - GRO Early Learning',
    text: (candidateName: string, position: string) => 
      `Dear ${candidateName},\n\nWe wanted to let you know that your application for the ${position} position is currently under review by our HR team. We will contact you soon with more information about next steps.\n\nBest regards,\nHR Team\nGRO Early Learning`,
    html: (candidateName: string, position: string) => 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0052CC; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRO Early Learning</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Dear ${candidateName},</p>
          <p>We wanted to let you know that your application for the <strong>${position}</strong> position is currently under review by our HR team.</p>
          <p>We will contact you soon with more information about next steps.</p>
          <p>Best regards,<br>HR Team<br>GRO Early Learning</p>
        </div>
      </div>`
  },
  interview: {
    subject: 'Interview Invitation - GRO Early Learning',
    text: (candidateName: string, position: string) => 
      `Dear ${candidateName},\n\nWe are pleased to inform you that we would like to invite you for an interview for the ${position} position. Our HR team will contact you shortly to schedule a convenient time.\n\nBest regards,\nHR Team\nGRO Early Learning`,
    html: (candidateName: string, position: string) => 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0052CC; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRO Early Learning</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Dear ${candidateName},</p>
          <p>We are pleased to inform you that we would like to invite you for an interview for the <strong>${position}</strong> position.</p>
          <p>Our HR team will contact you shortly to schedule a convenient time.</p>
          <p>Best regards,<br>HR Team<br>GRO Early Learning</p>
        </div>
      </div>`
  },
  offered: {
    subject: 'Job Offer - GRO Early Learning',
    text: (candidateName: string, position: string) => 
      `Dear ${candidateName},\n\nCongratulations! We are delighted to offer you the ${position} position at GRO Early Learning. We will be sending you the official offer letter with more details shortly.\n\nBest regards,\nHR Team\nGRO Early Learning`,
    html: (candidateName: string, position: string) => 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0052CC; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRO Early Learning</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Dear ${candidateName},</p>
          <p>Congratulations! We are delighted to offer you the <strong>${position}</strong> position at GRO Early Learning.</p>
          <p>We will be sending you the official offer letter with more details shortly.</p>
          <p>Best regards,<br>HR Team<br>GRO Early Learning</p>
        </div>
      </div>`
  },
  rejected: {
    subject: 'Application Status Update - GRO Early Learning',
    text: (candidateName: string, position: string) => 
      `Dear ${candidateName},\n\nThank you for your interest in the ${position} position at GRO Early Learning. After careful consideration of all applications, we regret to inform you that we will not be proceeding with your application at this time. We appreciate your interest in our organization and wish you the best in your job search.\n\nBest regards,\nHR Team\nGRO Early Learning`,
    html: (candidateName: string, position: string) => 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0052CC; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRO Early Learning</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Dear ${candidateName},</p>
          <p>Thank you for your interest in the <strong>${position}</strong> position at GRO Early Learning.</p>
          <p>After careful consideration of all applications, we regret to inform you that we will not be proceeding with your application at this time.</p>
          <p>We appreciate your interest in our organization and wish you the best in your job search.</p>
          <p>Best regards,<br>HR Team<br>GRO Early Learning</p>
        </div>
      </div>`
  },
  hired: {
    subject: 'Welcome to GRO Early Learning!',
    text: (candidateName: string, position: string) => 
      `Dear ${candidateName},\n\nCongratulations and welcome to the GRO Early Learning team! We are thrilled to have you join us as a ${position}. Our HR team will be in touch shortly with onboarding information.\n\nBest regards,\nHR Team\nGRO Early Learning`,
    html: (candidateName: string, position: string) => 
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0052CC; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRO Early Learning</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          <p>Dear ${candidateName},</p>
          <p>Congratulations and welcome to the GRO Early Learning team!</p>
          <p>We are thrilled to have you join us as a <strong>${position}</strong>.</p>
          <p>Our HR team will be in touch shortly with onboarding information.</p>
          <p>Best regards,<br>HR Team<br>GRO Early Learning</p>
        </div>
      </div>`
  }
};

/**
 * Send an email notification based on application status change
 * @param application The application with candidate and job posting information
 * @param previousStatus The previous status of the application
 * @returns Boolean indicating whether email was sent successfully
 */
export async function sendApplicationStatusEmail(
  application: Application & { 
    candidate?: { 
      firstName?: string; 
      lastName?: string; 
      email?: string; 
    }; 
    jobPosting?: { 
      title?: string; 
    } 
  },
  previousStatus: string
): Promise<boolean> {
  try {
    // Check if SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not set. Cannot send status update email.');
      return false;
    }

    // Check if we have required information
    if (!application.candidate?.email || !application.jobPosting?.title) {
      console.error('Missing candidate email or job title for email notification');
      return false;
    }

    // Don't send email for the initial "applied" status
    if (previousStatus === '' && application.status === 'applied') {
      return true; // Consider it a success, but no email sent
    }

    // Get template for current status
    const template = EMAIL_TEMPLATES[application.status as keyof typeof EMAIL_TEMPLATES];
    if (!template) {
      console.error(`No email template found for status: ${application.status}`);
      return false;
    }

    // Prepare candidate name and position
    const candidateName = application.candidate.firstName 
      ? `${application.candidate.firstName} ${application.candidate.lastName || ''}`
      : 'Applicant';
    const position = application.jobPosting.title;

    // Prepare email content
    const msg = {
      to: application.candidate.email,
      from: DEFAULT_FROM_EMAIL, // Ensure this is verified in SendGrid
      subject: template.subject,
      text: template.text(candidateName, position),
      html: template.html(candidateName, position),
    };

    // For development, log email instead of sending if needed
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_EMAILS === 'true') {
      console.log('MOCK STATUS EMAIL SENT:', {
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        status: application.status
      });
      return true;
    }

    // Actual email sending
    try {
      await mailService.send(msg);
      console.log(`Status update email sent to ${application.candidate.email} for status: ${application.status}`);
      return true;
    } catch (sendError: any) {
      // Log detailed SendGrid error information
      if (sendError.response) {
        console.error('SendGrid API Error:', {
          status: sendError.code,
          errors: sendError.response.body.errors
        });
      } else {
        console.error('Unknown SendGrid error:', sendError);
      }
      return false;
    }
  } catch (error) {
    console.error('Error in sendApplicationStatusEmail function:', error);
    return false;
  }
}

/**
 * Send a custom email notification to a candidate
 * @param to Recipient email address
 * @param subject Email subject
 * @param message Email body content
 * @param applicationId Optional application ID for tracking
 * @returns Boolean indicating whether email was sent successfully
 */
export async function sendCustomEmail(
  to: string,
  subject: string,
  message: string,
  applicationId?: number
): Promise<boolean> {
  try {
    // Check if SendGrid API key is set
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not set. Cannot send email.');
      return false;
    }
    
    const msg = {
      to,
      from: DEFAULT_FROM_EMAIL, // Ensure this is verified in SendGrid
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0052CC; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRO Early Learning</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>`,
    };

    // For development, log email instead of sending if needed
    if (process.env.NODE_ENV === 'development' && process.env.MOCK_EMAILS === 'true') {
      console.log('MOCK EMAIL SENT:', {
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        text: msg.text
      });
      return true;
    }

    // Actual email sending
    try {
      await mailService.send(msg);
      console.log(`Email sent successfully to ${to}${applicationId ? ` for application ID: ${applicationId}` : ''}`);
      return true;
    } catch (sendError: any) {
      // Log detailed SendGrid error information
      if (sendError.response) {
        console.error('SendGrid API Error:', {
          status: sendError.code,
          errors: sendError.response.body.errors
        });
      } else {
        console.error('Unknown SendGrid error:', sendError);
      }
      return false;
    }
  } catch (error) {
    console.error('Error in sendCustomEmail function:', error);
    return false;
  }
}