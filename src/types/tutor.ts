
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
  methodology?: string;
  experience?: number;
  achievements?: string;
  videoUrl?: string;
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
  methodology?: string;
  experience?: number;
  achievements?: string;
  videoUrl?: string;
  rating?: number;
  reviewsCount?: number;
  completedLessons?: number;
  activeStudents?: number;
}

export interface TutorSubject {
  id: string;
  name: string;
  hourlyRate: number;
  experienceYears?: number;
  description?: string;
  materials?: TutorMaterial[];
}

export interface TutorMaterial {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'link';
  url: string;
  description?: string;
}

export interface TutorSchedule {
  id: string;
  tutorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TutorReview {
  id: string;
  tutorId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TutorStatistics {
  totalLessons: number;
  totalHours: number;
  totalStudents: number;
  averageRating: number;
  totalEarnings: number;
  monthlyEarnings: {
    month: string;
    earnings: number;
  }[];
}
