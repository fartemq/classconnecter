
export interface TutorFormValues {
  firstName: string;
  lastName: string;
  bio: string;
  city: string;
  hourlyRate: number;
  subjects: string[];
  teachingLevels: string[];
  avatarUrl?: string;
  educationInstitution?: string;
  degree?: string;
  graduationYear?: number;
}

export interface TutorProfile {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  city: string;
  avatarUrl?: string;
  educationInstitution?: string;
  degree?: string;
  graduationYear?: number;
  educationVerified?: boolean;
  subjects: TutorSubject[];
}

export interface TutorSubject {
  id: string;
  name: string;
  hourlyRate: number;
  experienceYears?: number;
  description?: string;
}
