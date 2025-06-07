
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

// Define the schema for our login form
const loginFormSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(1, { message: "Введите пароль" }),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export interface LoginFormProps {
  onSuccess: (values: LoginFormValues) => Promise<void>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setLoginAttempted: (attempted: boolean) => void;
  needConfirmation: boolean;
}

export function LoginForm({ 
  onSuccess, 
  isLoading, 
  setIsLoading, 
  setLoginAttempted,
  needConfirmation
}: LoginFormProps) {
  
  // Initialize react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginFormValues) {
    if (isLoading) return; // Prevent double submission
    
    setLoginAttempted(true);
    
    try {
      await onSuccess(values);
    } catch (error) {
      console.error("Login form error:", error);
      // Error handling is done in the parent component
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
                  placeholder="email@example.com" 
                  {...field} 
                  disabled={isLoading}
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
                  placeholder="••••••••" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal">Запомнить меня</FormLabel>
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Забыли пароль?
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </span>
        </div>
      </form>
    </Form>
  );
}
