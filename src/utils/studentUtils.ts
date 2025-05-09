
import { StudentRequest, Student } from "@/types/student";
import { ensureObject } from "@/utils/supabaseUtils";

export const createStudentFromRequest = (request: StudentRequest): Student => {
  // Обработаем случаи, когда student может быть массивом или объектом
  const student = request.student 
    ? (Array.isArray(request.student) ? request.student[0] : request.student)
    : null;
  
  // Обработаем случаи, когда subject может быть массивом или объектом
  const subject = request.subject 
    ? (Array.isArray(request.subject) ? request.subject[0] : request.subject)
    : null;
  
  return {
    id: request.student_id,
    first_name: student?.first_name || '',
    last_name: student?.last_name || null,
    avatar_url: student?.avatar_url || null,
    city: student?.city || null,
    // Compatibility fields
    name: student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() : '',
    status: request.status,
    level: 'N/A', // We don't have this info in the current DB schema
    grade: null,
    school: null,
    subjects: subject ? [subject.name] : [],
    lastActive: request.updated_at ? new Date(request.updated_at).toLocaleDateString('ru-RU') : 'N/A',
    avatar: student?.avatar_url,
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
  
  const safeStudentProfile = studentProfile || {}; 
  
  return {
    id: profile.id,
    first_name: profile.first_name || '',
    last_name: profile.last_name || null,
    avatar_url: profile.avatar_url,
    city: profile.city,
    // Compatibility fields
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
    status: 'new', // По умолчанию статус "new" для студентов без запроса
    level: level,
    grade: safeStudentProfile.grade || null,
    school: safeStudentProfile.school || null,
    subjects: safeStudentProfile.subjects || [],
    lastActive: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('ru-RU') : 'N/A',
    avatar: profile.avatar_url,
    about: safeStudentProfile.learning_goals || profile.bio || '',
    interests: safeStudentProfile.preferred_format || [],
    student_profiles: studentProfile
  };
};
