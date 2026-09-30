/**
 * FruitScan AI — API Client
 * Handles communication with the Node.js backend.
 */

import type { ClassificationResult, ApiErrorResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Sends an image file to the classification endpoint.
 * @param file - The image File object to classify
 * @param onProgress - Optional progress callback (0–100)
 */
export async function classifyFruit(
  file: File,
  onProgress?: (pct: number) => void
): Promise<ClassificationResult> {
  const formData = new FormData();
  formData.append("image", file);

  // Simulate upload progress using XHR for real progress events
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const pct = Math.round((event.loaded / event.total) * 80); // 0–80% for upload
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (onProgress) onProgress(100);
      try {
        const data = JSON.parse(xhr.responseText) as
          | ClassificationResult
          | ApiErrorResponse;

        if (xhr.status >= 200 && xhr.status < 300) {
          if ("error" in data) {
            reject(new Error(data.error));
          } else {
            resolve(data as ClassificationResult);
          }
        } else {
          const errorData = data as ApiErrorResponse;
          reject(new Error(errorData.error || `HTTP ${xhr.status}`));
        }
      } catch {
        reject(new Error("Failed to parse server response"));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Network error. Is the backend running?"))
    );
    xhr.addEventListener("timeout", () =>
      reject(new Error("Request timed out. The server may be busy."))
    );

    xhr.open("POST", `${API_BASE}/api/classify`);
    xhr.timeout = 120000; // 2 minutes
    xhr.send(formData);
  });
}

/**
 * Validates a file before uploading.
 * Returns null if valid, or an error message string.
 */
export function validateImageFile(file: File): string | null {
  const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
  const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

  if (!ALLOWED.includes(file.type)) {
    return `Invalid file type "${file.type}". Please upload a JPG, PNG, or WEBP image.`;
  }

  if (file.size > MAX_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File too large (${sizeMB} MB). Maximum allowed size is 10 MB.`;
  }

  return null;
}
