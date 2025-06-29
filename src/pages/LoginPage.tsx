
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SimpleLoader } from "@/components/loading/SimpleLoader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { ReliableEmailWaiting } from "@/components/auth/ReliableEmailWaiting";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { loginUserReliable } from "@/services/auth/reliableLoginService";
import { resendReliableConfirmation } from "@/services/auth/reliableEmailConfirmationService";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const LoginPage = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading } = useSimpleAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginState, setLoginState] = useState<"form" | "needConfirmation">("form");
  const [userEmail, setUserEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Проверяем, нужно ли показать экран подтверждения email
  useEffect(() => {
    if (location.state?.needConfirmation) {
      setLoginState("needConfirmation");
      setUserEmail(location.state.email || "");
    }
  }, [location]);

  // Редирект для авторизованных пользователей
  useEffect(() => {
    if (user && userRole && !isLoading) {
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    }
  }, [user, userRole, navigate, isLoading, location]);

  const handleLoginSuccess = async (values: LoginFormValues) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    
    try {
      const result = await loginUserReliable({
        email: values.email,
        password: values.password
      });
      
      if (result.success) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        // Редирект произойдёт автоматически через useEffect
      } else if (result.needsEmailConfirmation) {
        // Нужно подтверждение email
        setUserEmail(values.email);
        setLoginState("needConfirmation");
        setErrorMessage("Email не подтверждён. Проверьте почту для активации аккаунта.");
      } else {
        setErrorMessage(result.error || "Ошибка входа");
        toast({
          title: "Ошибка входа",
          description: result.error || "Произошла ошибка при входе",
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

  const handleResendConfirmation = async (): Promise<boolean> => {
    return await resendReliableConfirmation(userEmail);
  };

  const handleBackToLogin = () => {
    setLoginState("form");
    setErrorMessage(null);
  };

  // Показываем загрузку при проверке сессии
  if (isLoading) {
    return (
      <AuthLayout>
        <SimpleLoader message="Проверка сессии..." />
      </AuthLayout>
    );
  }

  // Если пользователь уже авторизован
  if (user && userRole) {
    return (
      <AuthLayout>
        <SimpleLoader message="Переход на главную..." />
      </AuthLayout>
    );
  }

  // Экран ожидания подтверждения email
  if (loginState === "needConfirmation") {
    return (
      <AuthLayout>
        <div className="space-y-4">
          <ReliableEmailWaiting 
            email={userEmail}
            onResend={handleResendConfirmation}
          />
          <div className="text-center">
            <button 
              onClick={handleBackToLogin}
              className="text-sm text-blue-600 hover:underline"
            >
              Вернуться к форме входа
            </button>
          </div>
        </div>
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
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <LoginForm 
            onSuccess={handleLoginSuccess}
            isLoading={isLoggingIn}
            setIsLoading={setIsLoggingIn}
            setLoginAttempted={() => {}}
            needConfirmation={false}
          />
        </CardContent>
      </Card>
    </AuthLayout>
  );
});

LoginPage.displayName = "LoginPage";

export default LoginPage;
