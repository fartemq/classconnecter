import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser, getUserRole } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
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
import { Alert, AlertCircle, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define the schema for our login form
const loginFormSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(1, { message: "Введите пароль" }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

interface LoginFormProps {
  onSuccess: (values: LoginFormValues) => void;
  needConfirmation?: boolean;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  setLoginAttempted?: (attempted: boolean) => void;
}

export function LoginForm({ onSuccess, needConfirmation = false, isLoading = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await onSuccess(values);
    } catch (error) {
      console.error("Login form error:", error);
      // Ошибка уже обрабатывается в onSuccess, здесь ничего делать не нужно
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {needConfirmation && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Требуется подтверждение email</AlertTitle>
            <AlertDescription>
              Мы отправили вам письмо для подтверждения. Пожалуйста, проверьте вашу почту и активируйте аккаунт.
            </AlertDescription>
          </Alert>
        )}
        
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
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Забыли пароль?
          </Link>
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
            <Link to="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </span>
        </div>
      </form>
    </Form>
  );
}
