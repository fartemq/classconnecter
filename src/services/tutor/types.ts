
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
