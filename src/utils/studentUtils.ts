
import { StudentRequest, Student } from "@/types/student";

export const createStudentFromRequest = (request: StudentRequest): Student => {
  return {
    id: request.student_id,
    name: `${request.student?.first_name || ''} ${request.student?.last_name || ''}`.trim(),
    status: request.status,
    level: 'N/A', // We don't have this info in the current DB schema
    grade: null,
    school: null,
    subjects: request.subject ? [request.subject.name] : [],
    city: request.student?.city || 'N/A',
    lastActive: new Date(request.updated_at).toLocaleDateString('ru-RU'),
    avatar: request.student?.avatar_url,
    about: '',
    interests: []
  };
};

export const createStudentFromProfile = (profile: any, studentProfile: any | null): Student => {
  // Определяем уровень на основе данных из student_profiles или устанавливаем значение по умолчанию
  let level = 'N/A';
  if (studentProfile?.educational_level) {
    level = studentProfile.educational_level;
  }
  
  return {
    id: profile.id,
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    status: 'new', // По умолчанию статус "new" для студентов без запроса
    level: level,
    grade: studentProfile?.grade || null,
    school: studentProfile?.school || null,
    subjects: studentProfile?.subjects || [],
    city: profile.city || 'N/A',
    lastActive: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('ru-RU') : 'N/A',
    avatar: profile.avatar_url,
    about: studentProfile?.learning_goals || profile.bio || '',
    interests: studentProfile?.preferred_format || []
  };
};
