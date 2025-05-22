
export interface TutorSearchFilters {
  subject?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  experienceMin?: number;
  verified?: boolean;
  email?: string; // For admin searches
  showExisting?: boolean; // Whether to show tutors the student already has a relationship with
  budget?: number; // Student's budget for filtering tutors
}

export interface TutorSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  city: string;
  rating: number | null;
  subjects: {
    id: string;
    name: string;
    hourlyRate: number;
  }[];
  isVerified: boolean;
  experience: number;
  relationshipStatus?: string;
  isFavorite?: boolean;
}

export interface TutorPublicationStatus {
  isPublished: boolean;
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

// Add this type for use in student relationships
export interface TutorBasicInfo {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  city?: string;
  tutor_profiles?: {
    experience?: number;
    education_verified?: boolean;
  };
}
