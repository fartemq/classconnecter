
import { z } from "zod";

// Schema for Step 1: Personal Information
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать минимум 2 символа" }),
  bio: z.string().min(20, { message: "Опишите ваш опыт преподавания (минимум 20 символов)" }),
  city: z.string().min(2, { message: "Укажите город" }),
  subjects: z.array(z.string()).min(1, { message: "Выберите хотя бы один предмет" }),
  teachingLevels: z.array(z.enum(["школьник", "студент", "взрослый"])).min(1, {
    message: "Выберите хотя бы один уровень обучения",
  }),
  hourlyRate: z.coerce.number().positive({ message: "Цена должна быть положительным числом" }),
});

// Schema for Step 2: Education
export const educationSchema = z.object({
  educationInstitution: z.string().min(2, { message: "Укажите учебное заведение" }),
  degree: z.string().min(2, { message: "Укажите специальность/степень" }),
  graduationYear: z.coerce.number()
    .min(1950, { message: "Год не может быть ранее 1950" })
    .max(new Date().getFullYear(), { message: `Год не может быть позже ${new Date().getFullYear()}` }),
});

// Schema for Step 3: Teaching Methodology
export const methodologySchema = z.object({
  methodology: z.string().optional(),
  experience: z.coerce.number().min(0, { message: "Опыт не может быть отрицательным" }).optional(),
  achievements: z.string().optional(),
  videoUrl: z.string().url({ message: "Введите корректный URL видео" }).optional().or(z.literal('')),
});

// Complete form schema for final validation
export const formSchema = personalInfoSchema.merge(educationSchema).merge(methodologySchema);

// Validation helper functions
export const validateStep = (stepName: string, form: any) => {
  switch (stepName) {
    case "personal":
      return form.trigger(["firstName", "lastName", "city", "bio", "subjects", "teachingLevels", "hourlyRate"]);
    case "education":
      return form.trigger(["educationInstitution", "degree", "graduationYear"]);
    case "methodology":
      return form.trigger(["methodology", "experience", "achievements", "videoUrl"]);
    default:
      return false;
  }
};
