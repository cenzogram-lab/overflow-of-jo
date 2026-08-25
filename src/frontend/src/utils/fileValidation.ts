export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime"];
export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov"];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  const mimeOk = ALLOWED_IMAGE_TYPES.includes(file.type);
  const extOk = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

  if (!mimeOk || !extOk) {
    return {
      valid: false,
      error: `Invalid file type. Please upload a JPG, PNG, or WEBP image. Got: ${file.name}`,
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: "File is too large. Maximum size is 10MB." };
  }

  return { valid: true };
}

export function validateVideoFile(file: File): ValidationResult {
  const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
  const mimeOk = ALLOWED_VIDEO_TYPES.includes(file.type);
  const extOk = ALLOWED_VIDEO_EXTENSIONS.includes(ext);

  if (!mimeOk && !extOk) {
    return {
      valid: false,
      error: `Invalid file type. Please upload an MP4 or MOV video. Got: ${file.name}`,
    };
  }

  const maxSize = 200 * 1024 * 1024; // 200MB
  if (file.size > maxSize) {
    return { valid: false, error: "File is too large. Maximum size is 200MB." };
  }

  return { valid: true };
}
