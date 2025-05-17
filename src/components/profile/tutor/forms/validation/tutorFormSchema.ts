
import { z } from "zod";

// Схема валидации для основной информации
export const personalSchema = z.object({
  firstName: z.string().min(2, { message: "Имя должно содержать минимум 2 символа" }),
  lastName: z.string().min(2, { message: "Фамилия должна содержать минимум 2 символа" }),
  bio: z.string().min(20, { message: "Опишите ваш опыт преподавания (минимум 20 символов)" })
    .max(2000, { message: "Описание не должно превышать 2000 символов" }),
  city: z.string().min(2, { message: "Укажите город" }),
});

// Схема валидации для образования
export const educationSchema = z.object({
  educationInstitution: z.string().min(2, { message: "Укажите название учебного заведения" }),
  degree: z.string().min(2, { message: "Укажите специальность/степень" }),
  graduationYear: z.coerce
    .number()
    .min(1950, { message: "Год должен быть не ранее 1950" })
    .max(new Date().getFullYear(), { message: `Год не может быть позже ${new Date().getFullYear()}` }),
});

// Объединенная схема с необязательными полями
export const formSchema = personalSchema.merge(educationSchema).extend({
  experience: z.coerce.number().optional(),
  achievements: z.string().max(1000, { message: "Текст не должен превышать 1000 символов" }).optional(),
  videoUrl: z.string().url({ message: "Введите корректный URL видео" }).optional().or(z.literal('')),
});
