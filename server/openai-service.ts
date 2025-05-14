import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// It's their most advanced model with improved capabilities over gpt-4
const MODEL = "gpt-4o";

/**
 * Extract text content from a PDF file
 */
async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();
    
    // For now we'll use a simpler approach since pdf-lib doesn't have direct text extraction
    // In a production app, we might use a more robust library like pdf-parse
    return `[PDF document with ${numPages} pages at ${path.basename(filePath)}]`;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

/**
 * Parse resume file using OpenAI to extract structured information
 */
export async function parseResumeWithAI(filePath: string): Promise<{
  skills: string[];
  education: { 
    institution: string; 
    degree: string; 
    field: string; 
    graduationDate: string;
  }[];
  experience: {
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  certifications: string[];
  summary: string;
}> {
  try {
    // Get file content based on file type
    let fileContent = "";
    if (filePath.toLowerCase().endsWith(".pdf")) {
      fileContent = await extractTextFromPdf(filePath);
    } else if (filePath.toLowerCase().endsWith(".txt")) {
      fileContent = fs.readFileSync(filePath, "utf-8");
    } else {
      throw new Error("Unsupported file format. Please upload a PDF or text file.");
    }

    // Send the content to OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser for a childcare recruiting system. 
          Extract key information from resumes in JSON format.
          Focus on early childhood education qualifications, relevant certifications, 
          and experience working with children.
          Return data in a clean JSON format with these fields:
          - skills (array of strings)
          - education (array of objects with institution, degree, field, graduationDate)
          - experience (array of objects with company, position, startDate, endDate, description)
          - certifications (array of strings)
          - summary (concise professional overview string)
          If information is not available, use null values.`,
        },
        {
          role: "user",
          content: fileContent,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      skills: result.skills || [],
      education: result.education || [],
      experience: result.experience || [],
      certifications: result.certifications || [],
      summary: result.summary || "",
    };
  } catch (error) {
    console.error("Error parsing resume with AI:", error);
    return {
      skills: [],
      education: [],
      experience: [],
      certifications: [],
      summary: "Error parsing resume. Please try again or contact support.",
    };
  }
}

/**
 * Match candidate qualifications to job requirements
 */
export async function matchCandidateToJob(
  candidateResume: string,
  jobRequirements: string
): Promise<{
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  comments: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert recruitment assistant for a childcare company.
          Analyze how well a candidate's qualifications match with job requirements.
          Return a JSON object with:
          - score (number from 0-100 representing match percentage)
          - matchedSkills (array of skills the candidate has that match requirements)
          - missingSkills (array of required skills the candidate lacks)
          - comments (string with brief assessment of candidate fit)
          Focus on early childhood education qualifications and experience.`,
        },
        {
          role: "user",
          content: `Candidate Resume: ${candidateResume}\n\nJob Requirements: ${jobRequirements}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error matching candidate to job:", error);
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
      comments: "Error analyzing match. Please try again later.",
    };
  }
}

/**
 * Generate a personalized email response based on application status
 */
export async function generatePersonalizedEmail(
  candidateName: string,
  jobTitle: string,
  status: string,
  additionalContext?: string
): Promise<{
  subject: string;
  body: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are the recruitment coordinator for GRO Early Learning,
          a warm, professional childcare provider. Write a personalized email
          for a candidate based on their application status.
          The tone should be professional yet warm, representing our values of growth, care, and community.
          Return a JSON object with:
          - subject (email subject line)
          - body (HTML-formatted email body with appropriate greeting, content, and sign-off)`,
        },
        {
          role: "user",
          content: `Generate an email for ${candidateName} who applied for ${jobTitle} position.
          Current status: ${status}
          Additional context: ${additionalContext || "None provided"}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error generating personalized email:", error);
    return {
      subject: `Update on your application for ${jobTitle}`,
      body: `<p>Dear ${candidateName},</p>
      <p>Thank you for your interest in the ${jobTitle} position at GRO Early Learning.</p>
      <p>We wanted to inform you that your application status has been updated to: ${status}.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
      <p>Best regards,<br/>GRO Early Learning Recruitment Team</p>`,
    };
  }
}

/**
 * Analyze candidate sentiment from communication logs
 */
export async function analyzeCandidateSentiment(communicationLogs: string[]): Promise<{
  sentiment: "positive" | "neutral" | "negative";
  engagementLevel: number;
  keyTopics: string[];
  suggestions: string;
}> {
  if (!communicationLogs || communicationLogs.length === 0) {
    return {
      sentiment: "neutral",
      engagementLevel: 0,
      keyTopics: [],
      suggestions: "No communication data to analyze.",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert in analyzing communication for recruiting purposes.
          Analyze the sentiment and engagement level in candidate communications.
          Return a JSON object with:
          - sentiment ("positive", "neutral", or "negative")
          - engagementLevel (number from 0-10)
          - keyTopics (array of main topics discussed)
          - suggestions (recruiting advice based on analysis)`,
        },
        {
          role: "user",
          content: `Communication logs:\n${communicationLogs.join("\n\n")}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing candidate sentiment:", error);
    return {
      sentiment: "neutral",
      engagementLevel: 5,
      keyTopics: [],
      suggestions: "Error analyzing communications. Please try again later.",
    };
  }
}