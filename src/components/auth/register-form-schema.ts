
import { z } from "zod";

// Расширенная схема для регистрационной формы
export const registerFormSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно быть не менее 2 символов" }),
  lastName: z.string().min(2, { message: "Фамилия должна быть не менее 2 символов" }),
  email: z.string().email({ message: "Введите корректный email" }),
  password: z
    .string()
    .min(6, { message: "Пароль должен быть не менее 6 символов" }),
  confirmPassword: z.string(),
  role: z.enum(["student", "tutor"], {
    required_error: "Выберите роль",
  }),
  // Добавим необязательные поля, которые будут заполняться в зависимости от роли
  city: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  // Поля для студентов
  educationalLevel: z.enum(["school", "university", "adult"]).optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  // Поля для репетиторов
  subjects: z.array(z.string()).optional(),
  educationInstitution: z.string().optional(),
  degree: z.string().optional(),
  experience: z.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

// Создадим отдельную схему для профиля студента
export const studentProfileSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно быть не менее 2 символов" }),
  lastName: z.string().optional(),
  bio: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  educationalLevel: z.enum(["school", "university", "adult"]).optional(),
  school: z.string().optional(),
  grade: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  learningGoals: z.string().optional(),
  preferredFormat: z.array(z.string()).optional(),
});

export type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

// Создадим отдельную схему для профиля репетитора
export const tutorProfileSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно быть не менее 2 символов" }),
  lastName: z.string().min(2, { message: "Фамилия должна быть не менее 2 символов" }),
  bio: z.string().min(10, { message: "Биография должна быть не менее 10 символов" }),
  city: z.string().min(2, { message: "Укажите город" }),
  phone: z.string().optional(),
  subjects: z.array(z.string()).min(1, { message: "Выберите хотя бы один предмет" }),
  hourlyRate: z.number().min(100, { message: "Минимальная ставка - 100 руб/час" }),
  teachingLevels: z.array(z.string()).min(1, { message: "Выберите хотя бы один уровень обучения" }),
  educationInstitution: z.string().min(2, { message: "Укажите учебное заведение" }),
  degree: z.string().optional(),
  graduationYear: z.number().optional(),
  experience: z.number().optional(),
  methodology: z.string().optional(),
  achievements: z.string().optional(),
});

export type TutorProfileFormValues = z.infer<typeof tutorProfileSchema>;
