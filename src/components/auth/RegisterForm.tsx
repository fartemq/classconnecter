
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { registerFormSchema, RegisterFormValues } from "./register-form-schema";
import { PersonalDetailsFields } from "./PersonalDetailsFields";
import { CredentialsFields } from "./CredentialsFields";
import { RoleToggle } from "./RoleToggle";
import { LocationFields } from "./LocationFields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface RegisterFormProps {
  onSuccess: (values: RegisterFormValues) => void;
  defaultRole?: "student" | "tutor";
  isLoading?: boolean;
}

export function RegisterForm({ onSuccess, defaultRole, isLoading = false }: RegisterFormProps) {
  const [activeTab, setActiveTab] = useState<string>("basic");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: defaultRole || "student",
      city: "",
      phone: "",
      bio: "",
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

  const currentRole = form.watch("role");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="basic">Основная информация</TabsTrigger>
            <TabsTrigger value="additional">Дополнительно</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <RoleToggle form={form} />
            <PersonalDetailsFields form={form} />
            <CredentialsFields form={form} />
          </TabsContent>
          
          <TabsContent value="additional" className="space-y-4">
            <LocationFields form={form} />
            {currentRole === "student" && (
              <div className="text-sm text-gray-500 italic">
                Дополнительные поля профиля ученика будут доступны после регистрации
              </div>
            )}
            {currentRole === "tutor" && (
              <div className="text-sm text-gray-500 italic">
                Информация о предметах и образовании будет заполнена после регистрации
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm">
            <span className="text-muted-foreground">
              {activeTab === "basic" ? "Шаг 1 из 2" : "Шаг 2 из 2"}
            </span>
          </div>
          
          {activeTab === "basic" ? (
            <Button type="button" onClick={() => setActiveTab("additional")}>
              Далее
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Назад
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </div>
          )}
        </div>

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
