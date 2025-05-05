
import { StudentRequest, Student } from "@/types/student";

export const createStudentFromRequest = (request: StudentRequest): Student => {
  return {
    id: request.student_id,
    name: `${request.student?.first_name || ''} ${request.student?.last_name || ''}`.trim(),
    status: request.status,
    level: 'N/A', // We don't have this info in the current DB schema
    grade: null,
    school: null, // Added school property with null value as default
    subjects: request.subject ? [request.subject.name] : [],
    city: request.student?.city || 'N/A',
    lastActive: new Date(request.updated_at).toLocaleDateString('ru-RU'),
    avatar: null,
    about: '',
    interests: []
  };
};
