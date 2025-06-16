
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SimpleLoadingScreen } from "@/components/auth/SimpleLoadingScreen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { LoginAlerts } from "@/components/auth/LoginAlerts";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "@/hooks/use-toast";

const LoginPage = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if coming from registration page
  useEffect(() => {
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  // Simple redirect for authenticated users
  useEffect(() => {
    if (user && userRole && !isLoading) {
      navigate("/", { replace: true });
    }
  }, [user, userRole, navigate, isLoading]);

  const handleLoginSuccess = async (values: LoginFormValues) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        // Redirect will happen automatically via useEffect
      } else {
        const errorMsg = "Неверный email или пароль. Проверьте данные и попробуйте снова.";
        setErrorMessage(errorMsg);
        toast({
          title: "Ошибка входа",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = "Произошла ошибка при входе. Проверьте подключение к интернету";
      setErrorMessage(errorMsg);
      toast({
        title: "Ошибка входа",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Show loading
  if (isLoading) {
    return (
      <AuthLayout>
        <SimpleLoadingScreen message="Проверка сессии..." />
      </AuthLayout>
    );
  }

  // Redirect if already logged in
  if (user && userRole) {
    return (
      <AuthLayout>
        <SimpleLoadingScreen message="Переход на главную..." />
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
            После входа в систему вы сможете пользоваться всеми возможностями платформы.
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
