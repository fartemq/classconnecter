
import { toast } from "@/hooks/use-toast";

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export const handleError = (error: any, context?: string): void => {
  console.error(`Error in ${context || 'application'}:`, error);

  let message = "Произошла неожиданная ошибка";
  let title = "Ошибка";

  // Handle Supabase errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        message = "Данные не найдены";
        break;
      case '23505':
        message = "Данные уже существуют";
        break;
      case '42P01':
        message = "Ошибка структуры данных";
        break;
      case 'auth/user-not-found':
        message = "Пользователь не найден";
        break;
      case 'auth/wrong-password':
        message = "Неверный пароль";
        break;
      case 'auth/email-already-in-use':
        message = "Email уже используется";
        break;
      default:
        message = error.message || message;
    }
  } else if (error?.message) {
    message = error.message;
  }

  // Handle network errors
  if (!navigator.onLine) {
    title = "Нет подключения";
    message = "Проверьте подключение к интернету";
  }

  toast({
    title,
    description: message,
    variant: "destructive"
  });
};

export const validateRequired = (value: any, fieldName: string): boolean => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    toast({
      title: "Поле обязательно",
      description: `Поле "${fieldName}" должно быть заполнено`,
      variant: "destructive"
    });
    return false;
  }
  return true;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    toast({
      title: "Неверный email",
      description: "Введите корректный адрес электронной почты",
      variant: "destructive"
    });
    return false;
  }
  return true;
};

export const validatePassword = (password: string): boolean => {
  if (password.length < 6) {
    toast({
      title: "Слабый пароль",
      description: "Пароль должен содержать минимум 6 символов",
      variant: "destructive"
    });
    return false;
  }
  return true;
};
