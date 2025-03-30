
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { registerFormSchema, RegisterFormValues } from "./register-form-schema";
import { PersonalDetailsFields } from "./PersonalDetailsFields";
import { CredentialsFields } from "./CredentialsFields";
import { RoleToggle } from "./RoleToggle";

export interface RegisterFormProps {
  onSuccess: (values: RegisterFormValues) => void;
  defaultRole?: "student" | "tutor";
  isLoading?: boolean;
}

export function RegisterForm({ onSuccess, defaultRole, isLoading = false }: RegisterFormProps) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
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
          <PersonalDetailsFields form={form} />
          <CredentialsFields form={form} />
          <RoleToggle form={form} />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Регистрация..." : "Зарегистрироваться"}
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
