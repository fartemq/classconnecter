
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser, getUserRole } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Define the schema for our login form
const formSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(1, { message: "Введите пароль" }),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSuccess: (role: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoginAttempted: (attempted: boolean) => void;
}

export function LoginForm({ onSuccess, isLoading, setIsLoading, setLoginAttempted }: LoginFormProps) {
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setLoginAttempted(true);

    try {
      console.log("Submitting login form with:", values.email);
      const data = await loginUser(values.email, values.password);

      if (!data || !data.user) {
        throw new Error("Login succeeded but no user returned");
      }

      // Get user role from profiles table
      const role = await getUserRole(data.user.id);

      toast({
        title: "Вход выполнен успешно!",
        description: "Добро пожаловать на платформу Stud.rep",
      });

      // Call the onSuccess callback with the user role
      onSuccess(role || 'student');
    } catch (error) {
      console.error("Login error in form:", error);
      toast({
        title: "Ошибка входа",
        description: error instanceof Error ? error.message : "Произошла ошибка при входе в систему",
        variant: "destructive",
      });
      setIsLoading(false); // Make sure to reset loading state on error
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  autoComplete="email"
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
                <Input 
                  type="password" 
                  placeholder="******" 
                  autoComplete="current-password"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Запомнить меня
                </FormLabel>
              </FormItem>
            )}
          />
          <a
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Забыли пароль?
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Вход...
            </>
          ) : (
            "Войти"
          )}
        </Button>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">
            Еще нет аккаунта?{" "}
            <a href="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </a>
          </span>
        </div>
      </form>
    </Form>
  );
}
