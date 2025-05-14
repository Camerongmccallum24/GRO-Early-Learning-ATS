import { apiRequest } from './queryClient';

// Function to handle file upload
export async function uploadResume(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsArrayBuffer(file);
  });
}

export async function submitCandidateWithResume(candidateData: any, resumeFile: File | null): Promise<any> {
  if (!resumeFile) {
    // If no resume, just submit the candidate data as JSON
    return apiRequest('POST', '/api/candidates', candidateData);
  }

  // If resume exists, use FormData for multipart upload
  const formData = new FormData();
  
  // Add all candidate data fields to the form
  Object.entries(candidateData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  // Add the file to the form
  formData.append('resume', resumeFile);
  
  // Make request with FormData
  const response = await fetch('/api/candidates', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  
  return response.json();
}

// Preview resume (for PDF files)
export async function previewPdf(file: File): Promise<string> {
  if (!file.type.includes('pdf')) {
    throw new Error('File is not a PDF');
  }
  
  // This would normally use PDF.js to render the PDF,
  // but for simplicity we'll just return an object URL
  return URL.createObjectURL(file);
}
