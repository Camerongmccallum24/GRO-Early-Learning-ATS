import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { Application } from '@shared/schema';

// Configuration for Gmail OAuth2
const OAuth2 = google.auth.OAuth2;

// Check if we're in development mode for email mocking
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  console.log('Development mode: Email sending is mocked');
}

/**
 * Get OAuth2 authenticated transporter for Gmail
 */
async function createTransporter() {
  // Check if we have all the required environment variables
  if (!process.env.GMAIL_CLIENT_ID || 
      !process.env.GMAIL_CLIENT_SECRET || 
      !process.env.GMAIL_REFRESH_TOKEN || 
      !process.env.GMAIL_EMAIL) {
    throw new Error('Gmail API credentials not provided in environment variables');
  }

  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URL
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  // Get access token
  const accessToken = await new Promise<string>((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.error('Error getting Gmail access token:', err);
        reject('Failed to get access token');
      }
      resolve(token || '');
    });
  });

  // Create the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken
    }
  });

  return transporter;
}

/**
 * Send an email notification based on application status change
 * @param application The application with candidate and job posting information
 * @param previousStatus The previous status of the application
 * @returns Boolean indicating whether email was sent successfully
 */
export async function sendApplicationStatusEmail(
  application: any,
  previousStatus: string
): Promise<boolean> {
  try {
    if (!application.candidate || !application.candidate.email) {
      console.error('Candidate email not found for application:', application.id);
      return false;
    }

    const jobTitle = application.jobPosting?.title || 'position';
    const companyName = 'GRO Early Learning';
    const location = application.jobPosting?.location?.name || '';
    
    // Define email content based on status
    let subject = '';
    let message = '';
    
    switch(application.status) {
      case 'in_review':
        subject = `Your application for ${jobTitle} is under review`;
        message = `
          <p>Dear ${application.candidate.name || 'Candidate'},</p>
          <p>Thank you for applying to the ${jobTitle} position at ${companyName} ${location}.</p>
          <p>We are reviewing your application and will be in touch soon with next steps.</p>
          <p>Regards,<br/>Recruitment Team<br/>${companyName}</p>
        `;
        break;
      case 'interview':
        subject = `Interview invitation for ${jobTitle} at ${companyName}`;
        message = `
          <p>Dear ${application.candidate.name || 'Candidate'},</p>
          <p>We're pleased to inform you that we would like to invite you for an interview for the ${jobTitle} position at ${companyName} ${location}.</p>
          <p>Our recruitment team will contact you shortly to schedule a convenient time.</p>
          <p>Regards,<br/>Recruitment Team<br/>${companyName}</p>
        `;
        break;
      case 'offered':
        subject = `Job Offer for ${jobTitle} at ${companyName}`;
        message = `
          <p>Dear ${application.candidate.name || 'Candidate'},</p>
          <p>Congratulations! We are pleased to offer you the ${jobTitle} position at ${companyName} ${location}.</p>
          <p>Our HR team will be in touch shortly with the formal offer letter and next steps.</p>
          <p>Regards,<br/>Recruitment Team<br/>${companyName}</p>
        `;
        break;
      case 'hired':
        subject = `Welcome to ${companyName}!`;
        message = `
          <p>Dear ${application.candidate.name || 'Candidate'},</p>
          <p>Welcome to the ${companyName} team! We're thrilled that you've accepted our offer for the ${jobTitle} position.</p>
          <p>Our HR team will contact you shortly with onboarding details.</p>
          <p>Regards,<br/>Recruitment Team<br/>${companyName}</p>
        `;
        break;
      case 'rejected':
        subject = `Update on your application for ${jobTitle} at ${companyName}`;
        message = `
          <p>Dear ${application.candidate.name || 'Candidate'},</p>
          <p>Thank you for your interest in the ${jobTitle} position at ${companyName}.</p>
          <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
          <p>We appreciate your interest in ${companyName} and wish you success in your job search.</p>
          <p>Regards,<br/>Recruitment Team<br/>${companyName}</p>
        `;
        break;
      default:
        // Don't send an email for other status changes
        return true;
    }
    
    // In development mode, just log the email instead of sending it
    if (isDevelopment) {
      console.log('MOCK EMAIL:');
      console.log(`To: ${application.candidate.email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      return true;
    }
    
    // Send email via Gmail
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: `"GRO Early Learning" <${process.env.GMAIL_EMAIL}>`,
      to: application.candidate.email,
      subject: subject,
      html: message,
    });
    
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending application status email:', error);
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
    // In development mode, just log the email instead of sending it
    if (isDevelopment) {
      console.log('MOCK EMAIL:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      console.log(`ApplicationId: ${applicationId}`);
      return true;
    }
    
    // Send email via Gmail
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: `"GRO Early Learning" <${process.env.GMAIL_EMAIL}>`,
      to: to,
      subject: subject,
      html: message,
    });
    
    console.log('Custom email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending custom email:', error);
    return false;
  }
}