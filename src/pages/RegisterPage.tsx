
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegisterFormValues } from "@/components/auth/register-form-schema";
import { registerUser } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [defaultRole, setDefaultRole] = useState<"student" | "tutor" | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Already logged in, redirect to profile
          try {
            const { data } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();
              
            if (data?.role === "tutor") {
              navigate("/profile/tutor");
            } else {
              navigate("/profile/student");
            }
          } catch (error) {
            console.error("Error fetching profile data:", error);
            setCheckingSession(false);
          }
        } else {
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  // Получаем роль из параметров URL, если она указана
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get("role");
    
    if (role === "student" || role === "tutor") {
      setDefaultRole(role);
    }
  }, [location]);

  async function handleRegisterSuccess(values: RegisterFormValues) {
    setIsLoading(true);
    
    try {
      const result = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role,
      });

      console.log("Registration successful:", result);

      // Show success message
      toast({
        title: "Регистрация успешна!",
        description: "На вашу почту отправлено письмо для подтверждения аккаунта.",
      });

      // Автоматически войти, если нет необходимости подтверждать email
      if (result.session) {
        // Redirect based on role
        if (values.role === "tutor") {
          navigate("/profile/tutor/complete");
        } else {
          navigate("/profile/student");
        }
      } else {
        // Перенаправить на страницу подтверждения
        navigate("/login", { state: { needConfirmation: true } });
      }
    } catch (error) {
      console.error("Registration error in page:", error);
      toast({
        title: "Ошибка регистрации",
        description: error instanceof Error ? error.message : "Произошла ошибка при регистрации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (checkingSession) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">Проверка сессии...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>
              Создайте аккаунт для использования платформы Stud.rep
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm 
              onSuccess={handleRegisterSuccess} 
              defaultRole={defaultRole} 
              isLoading={isLoading} 
            />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
