import { createHash } from 'crypto';
import { db } from '../db';
import { jobPostings, locations, jobCategories } from '../../shared/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * Helper function to convert text to URL-friendly slug
 * @param text The text to slugify
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generate a unique application link hash for a job posting
 * @param jobId The job posting ID
 * @param salt Optional salt for additional uniqueness
 * @returns A unique application link hash
 */
export function generateApplicationLinkHash(jobId: number, salt: string = ''): string {
  const timestamp = Date.now().toString();
  const data = `${jobId}-${timestamp}-${salt}`;
  return createHash('sha256').update(data).digest('hex').substring(0, 12);
}

/**
 * Generate a URL slug for a job posting
 * @param title The job title
 * @param location The job location
 * @param jobId The job ID
 * @returns A URL-friendly slug
 */
export function generateJobSlug(title: string, location: string, jobId: number): string {
  return `${slugify(title)}-${slugify(location)}-${jobId}`;
}

/**
 * Verify if a custom slug is already in use
 * @param slug The slug to check
 * @param excludeJobId Optional job ID to exclude from check (for updates)
 * @returns Boolean indicating if the slug is unique
 */
export async function isSlugUnique(slug: string, excludeJobId?: number): Promise<boolean> {
  const query = excludeJobId 
    ? sql`SELECT 1 FROM job_postings WHERE url_slug = ${slug} AND id != ${excludeJobId} LIMIT 1` 
    : sql`SELECT 1 FROM job_postings WHERE url_slug = ${slug} LIMIT 1`;
  
  const result = await db.execute(query);
  return result.rowCount === 0;
}

/**
 * Generate job application URL based on the new SEO-friendly structure
 * Format: /careers/{category}/{title}-{location}-{jobId}
 * @param jobId The job posting ID
 */
export async function generateSEOFriendlyJobURL(jobId: number): Promise<string | null> {
  try {
    // Get job posting with related category and location
    const jobData = await db.select({
      id: jobPostings.id,
      title: jobPostings.title,
      url_slug: jobPostings.url_slug,
      category_slug: jobCategories.slug,
      city: locations.city
    })
    .from(jobPostings)
    .leftJoin(jobCategories, eq(jobPostings.categoryId, jobCategories.id))
    .leftJoin(locations, eq(jobPostings.locationId, locations.id))
    .where(eq(jobPostings.id, jobId))
    .limit(1);

    if (!jobData || jobData.length === 0) {
      return null;
    }
    
    const job = jobData[0];
    
    // Use existing URL slug if available, or generate a new one
    const slug = job.url_slug || generateJobSlug(job.title || '', job.city || '', job.id);
    
    // Use category slug or default to "general" if not available
    const categorySlug = job.category_slug || 'general';
    
    return `/careers/${categorySlug}/${slug}`;
  } catch (error) {
    console.error('Error generating SEO-friendly job URL:', error);
    return null;
  }
}

/**
 * Generate a complete application link URL for a job posting using the SEO-friendly URL structure
 * @param jobId The job posting ID
 * @param hash The application link hash
 * @param baseUrl The base URL of the application (optional)
 * @returns A complete URL for the application form
 */
export async function generateApplicationLink(
  jobId: number, 
  hash?: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://www.groearlylearning.com.au'
): Promise<string> {
  // Generate hash if not provided
  const linkHash = hash || generateApplicationLinkHash(jobId);
  
  // Get the SEO-friendly job URL path
  const jobUrlPath = await generateSEOFriendlyJobURL(jobId);
  
  if (!jobUrlPath) {
    // Fallback to old URL format if we can't generate the SEO-friendly URL
    return `${baseUrl}/apply/${jobId}/${linkHash}`;
  }
  
  return `${baseUrl}${jobUrlPath}`;
}

/**
 * Validate an application link hash
 * @param jobId The job posting ID
 * @param hash The hash to validate
 * @returns Boolean indicating if the hash appears valid
 */
export async function validateApplicationHash(jobId: number, hash: string): Promise<boolean> {
  if (!hash || hash.length !== 12) {
    return false;
  }
  
  try {
    // Check if this hash exists in the database and is active
    const result = await db.execute(
      sql`SELECT 1 FROM application_links 
          WHERE job_posting_id = ${jobId} 
          AND hash = ${hash} 
          AND is_active = true 
          AND (expiry_date IS NULL OR expiry_date > NOW())
          LIMIT 1`
    );
    
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error validating application hash:', error);
    return false;
  }
}