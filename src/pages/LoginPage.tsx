
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
  const [hasRedirected, setHasRedirected] = useState(false);

  // Check if coming from registration page
  useEffect(() => {
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  // Redirect logged in users based on role - only once
  useEffect(() => {
    if (user && userRole && !isLoggingIn && !hasRedirected && !authLoading) {
      console.log("🚀 Redirecting user with role:", userRole);
      setHasRedirected(true);
      
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

      // Use setTimeout to prevent potential race conditions
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 100);
    }
  }, [user, userRole, navigate, isLoggingIn, hasRedirected, authLoading]);

  // Handle login form submission
  const handleLoginSuccess = async (values: LoginFormValues) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setErrorMessage(null);
    
    try {
      console.log("🔐 Attempting login with:", values.email);
      const result = await login(values.email, values.password);
      
      if (result?.success) {
        console.log("✅ Login successful, waiting for auth state change");
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
        // Don't set isLoggingIn to false here - let the redirect happen
      } else if (result?.error) {
        console.error("❌ Login failed:", result.error);
        setErrorMessage(result.error);
        toast({
          title: "Ошибка входа",
          description: result.error,
          variant: "destructive",
        });
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("❌ Login form error:", error);
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

  // Show loading screen during auth check or login
  if (authLoading) {
    return (
      <AuthLayout>
        <LoadingScreen message="Проверка сессии..." />
      </AuthLayout>
    );
  }

  // Show loading during login process
  if (isLoggingIn) {
    return (
      <AuthLayout>
        <LoadingScreen message="Выполняется вход..." />
      </AuthLayout>
    );
  }

  // If user is already logged in, show loading while redirecting
  if (user && userRole && !hasRedirected) {
    return (
      <AuthLayout>
        <LoadingScreen message="Переход в профиль..." />
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
