
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { LoginAlerts } from "@/components/auth/LoginAlerts";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  useEffect(() => {
    // Check if coming from registration page
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  useEffect(() => {
    // If user is logged in, redirect based on role
    if (user && userRole) {
      console.log("User is logged in with role:", userRole);
      if (userRole === "tutor") {
        navigate("/profile/tutor");
      } else {
        navigate("/profile/student");
      }
    }
  }, [user, userRole, navigate]);

  // Handle login form submission
  const handleLoginSuccess = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginAttempted(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) throw error;
      
      if (data?.session) {
        // Получаем роль пользователя
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();
          
        const role = profileData?.role || "student";
        
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        
        // Перенаправляем на основе роли
        if (role === "tutor") {
          navigate("/profile/tutor");
        } else {
          navigate("/profile/student");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Ошибка входа",
        description: error instanceof Error ? error.message : "Произошла ошибка при входе",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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

  // If user is already logged in, don't show login page
  if (user) {
    return null; // Will be redirected in useEffect
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
            <LoginAlerts 
              needConfirmation={needConfirmation}
              loginAttempted={loginAttempted}
              isLoading={isLoading}
            />
            
            <LoginForm 
              onSuccess={handleLoginSuccess}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setLoginAttempted={setLoginAttempted}
            />
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
