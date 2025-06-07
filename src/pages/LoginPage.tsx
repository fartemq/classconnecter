
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { LoginAlerts } from "@/components/auth/LoginAlerts";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading: authLoading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if coming from registration page
  useEffect(() => {
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  // Redirect logged in users based on role
  useEffect(() => {
    // Если пользователь аутентифицирован и роль загружена
    if (user && userRole && !authLoading) {
      console.log("🚀 Redirecting user with role:", userRole);
      
      switch (userRole) {
        case "admin":
        case "moderator":
          navigate("/admin", { replace: true });
          break;
        case "tutor":
          navigate("/profile/tutor", { replace: true });
          break;
        case "student":
          navigate("/profile/student", { replace: true });
          break;
        default:
          navigate("/profile/student", { replace: true });
          break;
      }
    }
  }, [user, userRole, authLoading, navigate]);

  // Handle login form submission
  const handleLoginSuccess = async (values: LoginFormValues) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    
    try {
      console.log("🔐 Attempting login with:", values.email);
      const result = await login(values.email, values.password);
      
      if (result?.success) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        // Не устанавливаем setIsLoggingIn(false) здесь - пусть useEffect обработает перенаправление
      } else if (result?.error) {
        setErrorMessage(result.error);
        toast({
          title: "Ошибка входа",
          description: result.error,
          variant: "destructive",
        });
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("Login form error:", error);
      const errorMsg = error instanceof Error ? error.message : "Произошла ошибка при входе";
      setErrorMessage(errorMsg);
      toast({
        title: "Ошибка входа",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  // Show loading screen during initial auth check or while logging in
  if (authLoading || (user && userRole && !isLoggingIn)) {
    return (
      <AuthLayout>
        <LoadingScreen message={isLoggingIn ? "Выполняется вход..." : "Проверка сессии..."} />
      </AuthLayout>
    );
  }

  // If user is already logged in but we don't have role yet, show loading
  if (user && !userRole) {
    return (
      <AuthLayout>
        <LoadingScreen message="Загрузка профиля..." />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
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
            loginAttempted={!!errorMessage}
            isLoading={isLoggingIn}
            errorMessage={errorMessage}
          />
          
          <LoginForm 
            onSuccess={handleLoginSuccess}
            isLoading={isLoggingIn}
            setIsLoading={setIsLoggingIn}
            setLoginAttempted={() => {}}
            needConfirmation={needConfirmation}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col text-center text-sm text-gray-500 pt-0">
          <p>
            Для разработки: вы можете отключить обязательное подтверждение email в настройках Supabase.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
