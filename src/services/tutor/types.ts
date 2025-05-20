
export interface TutorBasicInfo {
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
}

export interface TutorSubject {
  id: string;
  name: string;
  hourlyRate: number;
}

export interface TutorSearchResult {
  id: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  city: string | null;
  rating: number | null;
  subjects: TutorSubject[];
  isVerified: boolean;
  experience: number | null;
  relationshipStatus?: string | null;
  isFavorite?: boolean;
}

export interface TutorSearchFilters {
  subject?: string;
  priceMin?: number;
  priceMax?: number;
  city?: string;
  rating?: number;
  verified?: boolean;
  experienceMin?: number;
  showExisting?: boolean; 
}
