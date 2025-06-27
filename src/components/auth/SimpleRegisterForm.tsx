
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { User, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const registerSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string(),
  role: z.enum(["student", "tutor"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface SimpleRegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
  defaultRole?: "student" | "tutor";
}

export function SimpleRegisterForm({ onSubmit, isLoading = false, defaultRole = "student" }: SimpleRegisterFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: defaultRole,
    },
  });

  const selectedRole = form.watch("role");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Выбор роли */}
        <div className="space-y-4">
          <FormLabel className="text-base font-semibold">Кто вы?</FormLabel>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className={`cursor-pointer transition-all ${
                selectedRole === "student" 
                  ? "ring-2 ring-blue-500 bg-blue-50" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => form.setValue("role", "student")}
            >
              <CardContent className="p-4 text-center">
                <User className={`h-8 w-8 mx-auto mb-2 ${
                  selectedRole === "student" ? "text-blue-500" : "text-gray-400"
                }`} />
                <div className="text-sm font-medium">Ученик</div>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${
                selectedRole === "tutor" 
                  ? "ring-2 ring-green-500 bg-green-50" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => form.setValue("role", "tutor")}
            >
              <CardContent className="p-4 text-center">
                <GraduationCap className={`h-8 w-8 mx-auto mb-2 ${
                  selectedRole === "tutor" ? "text-green-500" : "text-gray-400"
                }`} />
                <div className="text-sm font-medium">Репетитор</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Личные данные */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Email и пароль */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="ivan@example.com" {...field} />
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
                <Input type="password" placeholder="Минимум 6 символов" {...field} />
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
              <FormLabel>Подтвердите пароль</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Повторите пароль" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Регистрация..." : "Создать аккаунт"}
        </Button>

        <div className="text-center text-sm text-gray-600">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Войти
          </Link>
        </div>
      </form>
    </Form>
  );
}
