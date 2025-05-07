
// Типы для работы с таблицей student_profiles
export interface StudentProfileDB {
  id: string;
  educational_level?: string | null;
  subjects?: string[] | null;
  learning_goals?: string | null;
  preferred_format?: string[] | null;
  school?: string | null;
  grade?: string | null;
  budget?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Тип для обновления профиля студента
export interface StudentProfileUpdate {
  id: string; // Изменено с id?: string на id: string, т.к. это обязательное поле
  educational_level?: string | null;
  subjects?: string[] | null;
  learning_goals?: string | null;
  preferred_format?: string[] | null;
  school?: string | null;
  grade?: string | null;
  budget?: number | null;
}
