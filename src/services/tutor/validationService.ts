
import { toast } from "@/hooks/use-toast";

export interface TutorProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  city?: string;
  avatar_url?: string;
  education_institution?: string;
  degree?: string;
  graduation_year?: number;
  experience?: number;
  methodology?: string;
  achievements?: string;
  video_url?: string;
  is_published?: boolean;
  education_verified?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completionPercentage: number;
  missingFields: string[];
}

export const validateTutorProfile = (profile: TutorProfile): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingFields: string[] = [];
  let completedFields = 0;
  const totalFields = 10;

  // Required fields validation
  if (!profile.first_name?.trim()) {
    errors.push("Укажите имя");
    missingFields.push("Имя");
  } else {
    completedFields++;
  }

  if (!profile.last_name?.trim()) {
    errors.push("Укажите фамилию");
    missingFields.push("Фамилия");
  } else {
    completedFields++;
  }

  if (!profile.bio?.trim()) {
    errors.push("Добавьте описание о себе");
    missingFields.push("Описание");
  } else {
    completedFields++;
  }

  if (!profile.city?.trim()) {
    errors.push("Укажите город");
    missingFields.push("Город");
  } else {
    completedFields++;
  }

  if (!profile.education_institution?.trim()) {
    errors.push("Укажите учебное заведение");
    missingFields.push("Учебное заведение");
  } else {
    completedFields++;
  }

  if (!profile.degree?.trim()) {
    errors.push("Укажите степень/квалификацию");
    missingFields.push("Степень/квалификация");
  } else {
    completedFields++;
  }

  if (!profile.graduation_year || profile.graduation_year < 1950 || profile.graduation_year > new Date().getFullYear()) {
    errors.push("Укажите корректный год окончания");
    missingFields.push("Год окончания");
  } else {
    completedFields++;
  }

  if (profile.experience === undefined || profile.experience < 0) {
    errors.push("Укажите опыт работы");
    missingFields.push("Опыт работы");
  } else {
    completedFields++;
  }

  // Optional but recommended fields
  if (!profile.avatar_url?.trim()) {
    warnings.push("Добавьте фото профиля для большего доверия");
  } else {
    completedFields++;
  }

  if (!profile.methodology?.trim()) {
    warnings.push("Опишите вашу методику преподавания");
  } else {
    completedFields++;
  }

  // Additional validations
  if (profile.bio && profile.bio.length < 50) {
    warnings.push("Описание слишком короткое. Добавьте больше информации о себе");
  }

  if (profile.experience && profile.experience > 50) {
    warnings.push("Проверьте корректность указанного опыта работы");
  }

  if (!profile.education_verified) {
    warnings.push("Подтвердите образование для повышения доверия");
  }

  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  const isValid = errors.length === 0 && completionPercentage >= 80;

  return {
    isValid,
    errors,
    warnings,
    completionPercentage,
    missingFields
  };
};

export const showValidationResults = (result: ValidationResult): void => {
  if (result.errors.length > 0) {
    toast({
      title: "Профиль неполный",
      description: `Исправьте ${result.errors.length} ошибок для публикации`,
      variant: "destructive"
    });
  } else if (result.warnings.length > 0) {
    toast({
      title: "Профиль можно улучшить",
      description: `${result.warnings.length} рекомендаций для улучшения профиля`,
    });
  } else {
    toast({
      title: "Профиль готов к публикации",
      description: "Все необходимые поля заполнены корректно",
    });
  }
};

export const canPublishProfile = (profile: TutorProfile): boolean => {
  const result = validateTutorProfile(profile);
  return result.isValid;
};
