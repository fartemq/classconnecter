
export interface DocumentUploadSectionProps {
  tutorId: string;
  isEducationVerified?: boolean;
}

export interface DocumentType {
  value: string;
  label: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  file: string;
}
