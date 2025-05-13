
export interface PublicTutorProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  rating: number;
  experience: number | null;
  isVerified: boolean;
  education_institution: string | null;
  degree: string | null;
  methodology: string | null;
  subjects: TutorSubject[];
}

export interface TutorSubject {
  id: string;
  name: string;
  hourlyRate: number;
}

export interface TutorSearchParams {
  page?: number;
  pageSize?: number;
  subjectId?: string;
  priceRange?: [number, number];
  experienceYears?: number;
  educationLevel?: string;
  format?: string;
  city?: string;
}

export interface TutorSearchResult {
  tutors: PublicTutorProfile[];
  totalCount: number;
}
