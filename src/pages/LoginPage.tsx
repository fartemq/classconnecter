
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Loader2 } from "lucide-react";
import { loginUser, getUserRole } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

// Define the schema for our login form
const formSchema = z.object({
  email: z.string().email({ message: "Введите корректный email" }),
  password: z.string().min(1, { message: "Введите пароль" }),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, get their role and redirect
        try {
          const role = await getUserRole(session.user.id);
          if (role === "tutor") {
            navigate("/profile/tutor");
          } else {
            navigate("/profile/student");
          }
        } catch (error) {
          console.error("Error checking role:", error);
        }
      }
    };

    checkSession();
    
    // Check if coming from registration page
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setLoginAttempted(true);

    try {
      console.log("Submitting login form with:", values.email);
      const data = await loginUser(values.email, values.password);

      toast({
        title: "Вход выполнен успешно!",
        description: "Добро пожаловать на платформу Stud.rep",
      });

      // Check user role and redirect accordingly
      if (data.user) {
        const role = await getUserRole(data.user.id);
        console.log("User role after login:", role);

        if (role === "tutor") {
          navigate("/profile/tutor");
        } else {
          navigate("/profile/student");
        }
      } else {
        console.error("Login succeeded but no user returned");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error in page:", error);
      toast({
        title: "Ошибка входа",
        description: error instanceof Error ? error.message : "Произошла ошибка при входе в систему",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Вход</CardTitle>
            <CardDescription>
              Войдите в свой аккаунт Stud.rep
            </CardDescription>
          </CardHeader>
          <CardContent>
            {needConfirmation && (
              <Alert className="mb-6 bg-amber-50 border-amber-200">
                <InfoIcon className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Для завершения регистрации проверьте вашу почту и следуйте инструкциям в письме для подтверждения аккаунта.
                </AlertDescription>
              </Alert>
            )}
            
            {loginAttempted && !isLoading && (
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Подсказка: Если вы только что зарегистрировались, проверьте почту для подтверждения аккаунта. Для разработки можно отключить подтверждение email в настройках Supabase.
                </AlertDescription>
              </Alert>
            )}
            
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
          </CardContent>
          
          <CardFooter className="flex flex-col text-center text-sm text-gray-500 pt-0">
            <p>
              Для разработки: вы можете отключить обязательное подтверждение email в настройках Supabase.
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
