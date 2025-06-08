
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SimpleLoadingScreen } from "@/components/auth/SimpleLoadingScreen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { LoginAlerts } from "@/components/auth/LoginAlerts";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Проверяем, пришли ли с страницы регистрации
  useEffect(() => {
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  // Перенаправляем авторизованных пользователей
  useEffect(() => {
    if (user && userRole && !isLoading) {
      let redirectPath = "/profile/student"; // по умолчанию
      
      if (userRole === "admin" || userRole === "moderator") {
        redirectPath = "/admin";
      } else if (userRole === "tutor") {
        redirectPath = "/profile/tutor";
      }

      console.log("Redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, userRole, navigate, isLoading]);

  // Обработка отправки формы входа
  const handleLoginSuccess = async (values: LoginFormValues) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    
    try {
      const result = await login(values.email, values.password);
      
      if (result?.success) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        // Перенаправление произойдет автоматически через useEffect
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
      const errorMsg = "Произошла ошибка при входе";
      setErrorMessage(errorMsg);
      toast({
        title: "Ошибка входа",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  // Показываем загрузку только если действительно идет процесс
  if (isLoading || (isLoggingIn && !errorMessage) || (user && userRole)) {
    let message = "Загрузка...";
    if (isLoading) message = "Проверка сессии...";
    else if (isLoggingIn) message = "Вход в систему...";
    else if (user && userRole) message = "Переход в профиль...";

    return (
      <AuthLayout>
        <SimpleLoadingScreen message={message} />
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
