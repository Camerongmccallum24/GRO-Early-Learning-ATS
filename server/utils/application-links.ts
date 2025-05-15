import { createHash } from 'crypto';

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
 * Generate a complete application link URL for a job posting
 * @param jobId The job posting ID
 * @param baseUrl The base URL of the application (optional, defaults to the current host)
 * @returns A complete URL for the application form
 */
export function generateApplicationLink(
  jobId: number, 
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): string {
  const hash = generateApplicationLinkHash(jobId);
  return `${baseUrl}/apply/${jobId}/${hash}`;
}

/**
 * Validate an application link hash
 * This simplified version doesn't validate expiry or check against stored hashes
 * In a production system, you would check against stored valid hashes in the database
 * @param jobId The job posting ID
 * @param hash The hash to validate
 * @returns Boolean indicating if the hash appears valid
 */
export function validateApplicationHash(jobId: number, hash: string): boolean {
  // In a real implementation, you would check if this hash exists in the database
  // and hasn't expired
  return hash && hash.length === 12;
}