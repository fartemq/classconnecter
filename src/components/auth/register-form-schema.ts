
import { z } from "zod";

// Define the schema for our registration form
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
