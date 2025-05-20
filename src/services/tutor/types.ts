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
