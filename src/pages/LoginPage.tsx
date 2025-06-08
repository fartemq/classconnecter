
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { EnhancedLoadingScreen } from "@/components/auth/EnhancedLoadingScreen";
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
  const [loginStep, setLoginStep] = useState<string>("idle");

  // Проверяем, пришли ли с страницы регистрации
  useEffect(() => {
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  // Перенаправляем авторизованных пользователей
  useEffect(() => {
    if (user && userRole && !isLoggingIn && !authLoading) {
      console.log("🚀 Redirecting authenticated user with role:", userRole);
      
      const redirectPath = (() => {
        switch (userRole) {
          case "admin":
          case "moderator":
            return "/admin";
          case "tutor":
            return "/profile/tutor";
          case "student":
            return "/profile/student";
          default:
            return "/profile/student";
        }
      })();

      // Небольшая задержка для плавности UX
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 500);
    }
  }, [user, userRole, navigate, isLoggingIn, authLoading]);

  // Обработка отправки формы входа
  const handleLoginSuccess = async (values: LoginFormValues) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    setLoginStep("authenticating");
    
    try {
      console.log("🔐 Attempting login with:", values.email);
      
      // Таймаут для операции входа
      const loginTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Login timeout")), 15000);
      });

      const loginPromise = login(values.email, values.password);
      const result = await Promise.race([loginPromise, loginTimeout]);
      
      if (result?.success) {
        console.log("✅ Login successful");
        setLoginStep("getting_profile");
        
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        
        // Ждем обновления состояния auth от провайдера
        // isLoggingIn будет сброшен при успешном redirect
      } else if (result?.error) {
        console.error("❌ Login failed:", result.error);
        setErrorMessage(result.error);
        toast({
          title: "Ошибка входа",
          description: result.error,
          variant: "destructive",
        });
        setIsLoggingIn(false);
        setLoginStep("idle");
      }
    } catch (error) {
      console.error("❌ Login form error:", error);
      const errorMsg = error instanceof Error && error.message === "Login timeout" 
        ? "Превышено время ожидания входа" 
        : "Произошла ошибка при входе";
      
      setErrorMessage(errorMsg);
      toast({
        title: "Ошибка входа",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoggingIn(false);
      setLoginStep("idle");
    }
  };

  // Обработка таймаута
  const handleTimeout = () => {
    console.log("⏰ Login process timed out");
    setIsLoggingIn(false);
    setLoginStep("idle");
    setErrorMessage("Превышено время ожидания. Попробуйте еще раз.");
    toast({
      title: "Таймаут",
      description: "Операция заняла слишком много времени",
      variant: "destructive",
    });
  };

  // Повторная попытка
  const handleRetry = () => {
    setIsLoggingIn(false);
    setLoginStep("idle");
    setErrorMessage(null);
  };

  // Определяем сообщение для загрузки
  const getLoadingMessage = () => {
    if (authLoading) return "Проверка сессии...";
    if (loginStep === "authenticating") return "Проверка учетных данных...";
    if (loginStep === "getting_profile") return "Получение профиля...";
    if (isLoggingIn) return "Выполняется вход...";
    if (user && userRole) return "Переход в профиль...";
    return "Загрузка...";
  };

  // Показываем загрузку с таймаутом
  if (authLoading || isLoggingIn || (user && userRole)) {
    return (
      <AuthLayout>
        <EnhancedLoadingScreen 
          message={getLoadingMessage()}
          timeout={authLoading ? 8000 : 15000}
          onTimeout={handleTimeout}
          onRetry={handleRetry}
          showRetry={!authLoading}
        />
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
