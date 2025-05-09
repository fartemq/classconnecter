
import { Student, StudentRequest } from "@/types/student";

// Create a Student object from a profile record and optional student_profiles record
export function createStudentFromProfile(
  profile: any, 
  studentProfile: any = null
): Student {
  return {
    id: profile.id,
    first_name: profile.first_name || '',
    last_name: profile.last_name,
    avatar_url: profile.avatar_url,
    city: profile.city,
    
    // Added fields for compatibility with UI components
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    avatar: profile.avatar_url,
    lastActive: profile.updated_at || new Date().toISOString(),
    level: studentProfile?.educational_level === 'school' ? 'Школьник' :
           studentProfile?.educational_level === 'university' ? 'Студент' :
           studentProfile?.educational_level === 'adult' ? 'Взрослый' : 'Не указан',
    grade: studentProfile?.grade || null,
    school: studentProfile?.school || null,
    about: profile.bio || '',
    subjects: studentProfile?.subjects || [],
    interests: [],
    status: 'active',
    
    // Full student profile data
    student_profiles: studentProfile ? {
      educational_level: studentProfile.educational_level,
      subjects: studentProfile.subjects,
      learning_goals: studentProfile.learning_goals,
      preferred_format: studentProfile.preferred_format,
      school: studentProfile.school,
      grade: studentProfile.grade,
      budget: studentProfile.budget
    } : null
  };
}

// Create a Student object from a request with nested student data
export function createStudentFromRequest(request: any): Student {
  if (!request.student) {
    throw new Error('Student data is missing in the request');
  }
  
  // Get the student data, handle both array and object formats
  const studentData = Array.isArray(request.student) ? request.student[0] : request.student;
  
  return {
    id: studentData.id,
    first_name: studentData.first_name || '',
    last_name: studentData.last_name,
    avatar_url: studentData.avatar_url,
    city: studentData.city,
    
    // Added fields for compatibility with UI components
    name: `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim(),
    avatar: studentData.avatar_url,
    lastActive: request.updated_at || new Date().toISOString(),
    level: 'Не указан', // We don't have this info from the request
    grade: null,
    school: null,
    about: '',
    subjects: request.subject ? [request.subject.name] : [],
    interests: [],
    status: request.status || 'new',
  };
}
