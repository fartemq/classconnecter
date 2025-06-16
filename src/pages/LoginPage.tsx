
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SimpleLoadingScreen } from "@/components/auth/SimpleLoadingScreen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { LoginAlerts } from "@/components/auth/LoginAlerts";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

const LoginPage = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Check if coming from registration page
  useEffect(() => {
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  // Redirect authenticated users
  useEffect(() => {
    if (user && userRole && !isLoading) {
      let redirectPath = "/profile/student";
      
      if (userRole === "admin" || userRole === "moderator") {
        redirectPath = "/admin";
      } else if (userRole === "tutor") {
        redirectPath = "/profile/tutor";
      }

      logger.debug("Redirecting authenticated user", "login", { path: redirectPath });
      navigate(redirectPath, { replace: true });
    }
  }, [user, userRole, navigate, isLoading]);

  const handleLoginSuccess = async (values: LoginFormValues) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    
    try {
      logger.debug("Attempting login", "login", { email: values.email });
      const success = await login(values.email, values.password);
      
      if (success) {
        setRetryCount(0);
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        // Redirection will happen automatically via useEffect
      } else {
        setRetryCount(prev => prev + 1);
        const errorMsg = "Неверный email или пароль. Проверьте данные и попробуйте снова.";
        setErrorMessage(errorMsg);
        
        if (retryCount >= 2) {
          toast({
            title: "Проблемы со входом?",
            description: "Попробуйте сбросить пароль или обратитесь в поддержку",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Ошибка входа",
            description: errorMsg,
            variant: "destructive",
          });
        }
        setIsLoggingIn(false);
      }
    } catch (error) {
      logger.error("Login error", "login", error);
      const errorMsg = error instanceof Error ? error.message : "Произошла ошибка при входе. Проверьте подключение к интернету";
      setErrorMessage(errorMsg);
      toast({
        title: "Ошибка входа",
        description: errorMsg,
        variant: "destructive",
      });
      setIsLoggingIn(false);
    }
  };

  // Show loading
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
          {retryCount >= 2 && (
            <div className="mb-2 p-2 bg-blue-50 rounded text-blue-700">
              <p className="font-medium">Нужна помощь?</p>
              <p>Попробуйте восстановить пароль или обратитесь в поддержку</p>
            </div>
          )}
          <p>
            После входа в систему вы сможете пользоваться всеми возможностями платформы.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
