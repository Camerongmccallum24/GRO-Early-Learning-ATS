// This file contains timeout configuration settings for the application

// Server request timeout in milliseconds (30 seconds)
export const SERVER_REQUEST_TIMEOUT = 30000;

// Default API request timeout in milliseconds (15 seconds)
export const API_REQUEST_TIMEOUT = 15000;

// Authentication inactivity timeout in milliseconds (45 minutes)
export const AUTH_INACTIVITY_TIMEOUT = 45 * 60 * 1000; 

// Function to create a timeout promise
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
}

// Function to wrap a promise with a timeout
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    createTimeout(ms)
  ]);
}
