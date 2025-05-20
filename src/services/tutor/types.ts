
// Basic tutor information
export interface TutorBasicInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  experience?: number | null;
  rating?: number | null;
  subjects?: string[];
  hourly_rate?: number | null;
  is_published?: boolean | null;
}

// Define types for tutor search filters
export interface TutorSearchFilters {
  subject?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  verified?: boolean;
  experienceMin?: number;
  email?: string;
  showExisting?: boolean;
  [key: string]: any; // Allow additional properties
}

// Define the result structure for tutor search
export interface TutorSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  city: string | null;
  rating: number | null;
  subjects: Array<{ id: string; name: string; hourlyRate: number }>;
  isVerified: boolean;
  experience: number;
  relationshipStatus?: string;
  isFavorite?: boolean;
}
