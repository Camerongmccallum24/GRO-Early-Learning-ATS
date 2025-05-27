// Utility for handling fetch requests with timeouts
import { API_REQUEST_TIMEOUT } from "../../../server/utils/timeout-settings";

// AbortController based fetch with timeout
export async function fetchWithTimeout(
  url: string, 
  options: RequestInit = {}, 
  timeout: number = API_REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Create timeout that aborts the fetch
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
