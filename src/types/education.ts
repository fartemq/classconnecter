
// Types for education-related data

export interface StudentEducation {
  id: string;
  studentId: string;
  level: 'elementary' | 'middle' | 'high' | 'university' | 'professional';
  schoolName: string;
  grade: string;
  goals: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorEducation {
  id: string;
  tutorId: string;
  level: 'bachelor' | 'master' | 'phd' | 'professional';
  institution: string;
  specialization: string;
  degree: string;
  yearCompleted: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form value types
export interface StudentEducationFormValues {
  level: string;
  schoolName: string;
  grade: string;
  goals: string;
}

export interface TutorEducationFormValues {
  level: string;
  institution: string;
  specialization: string;
  degree: string;
  yearCompleted: number;
}
