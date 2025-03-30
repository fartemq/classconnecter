
import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Link } from "react-router-dom";
import { User, GraduationCap } from "lucide-react";

// Define the schema for our registration form
const formSchema = z.object({
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

export type RegisterFormValues = z.infer<typeof formSchema>;

export interface RegisterFormProps {
  onSuccess: (values: RegisterFormValues) => void;
  defaultRole?: "student" | "tutor";
}

export function RegisterForm({ onSuccess, defaultRole }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: defaultRole || "student",
    },
  });
  
  // Обновляем значение роли, если defaultRole изменился
  useEffect(() => {
    if (defaultRole) {
      form.setValue("role", defaultRole);
    }
  }, [defaultRole, form]);

  async function onSubmit(values: RegisterFormValues) {
    try {
      await onSuccess(values);
    } catch (error) {
      console.error("Registration form error:", error);
      // Ошибка уже обрабатывается в onSuccess, здесь ничего делать не нужно
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder="Иван" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Фамилия</FormLabel>
                <FormControl>
                  <Input placeholder="Иванов" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="ivan@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Подтверждение пароля</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Я хочу зарегистрироваться как</FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    className="w-full justify-stretch"
                  >
                    <ToggleGroupItem
                      value="student"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Ученик
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="tutor"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Репетитор
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Зарегистрироваться
        </Button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </span>
        </div>
      </form>
    </Form>
  );
}
