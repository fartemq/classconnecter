
/**
 * Types for the public tutor services
 */
export interface PublicTutorProfile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  bio: string | null;
  rating: number | null;
  experience: number | null;
  isVerified: boolean;
  education_institution: string | null;
  degree: string | null;
  methodology: string | null;
  subjects: Array<{
    id: string;
    name: string;
    hourlyRate: number;
  }>;
}
