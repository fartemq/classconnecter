
import { Student } from "@/types/student";

// This is the interface expected by the UI components
export interface StudentCardData {
  id: string;
  name: string;
  avatar: string | null;
  lastActive: string;
  level: string;
  grade: string | null;
  subjects: string[];
  city: string | null;
  about: string;
  interests: string[];
  status: string;
  school?: string | null;
}

// Helper function to adapt Student type to StudentCardData
export const adaptStudentToCardData = (student: Student): StudentCardData => {
  return {
    id: student.id,
    name: `${student.first_name} ${student.last_name || ''}`.trim(),
    avatar: student.avatar_url,
    lastActive: student.lastActive || 'Н/Д',
    level: student.level || 'Н/Д',
    grade: student.grade || null,
    subjects: student.subjects || [],
    city: student.city || null,
    about: student.about || '',
    interests: student.interests || [],
    status: student.status || 'new',
    school: student.school || null
  };
};
