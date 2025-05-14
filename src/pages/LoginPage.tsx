
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LoginForm, LoginFormValues } from "@/components/auth/LoginForm";
import { LoginAlerts } from "@/components/auth/LoginAlerts";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading: authLoading, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if coming from registration page
  useEffect(() => {
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location]);

  // Redirect logged in users based on role
  useEffect(() => {
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
    setErrorMessage(null);
    
    try {
      const result = await login(values.email, values.password);
      
      if (result?.success) {
        toast({
          title: "Успешный вход",
          description: "Добро пожаловать в Stud.rep!",
        });
      } else if (result?.error) {
        setErrorMessage(result.error);
      }
      
    } catch (error) {
      console.error("Login form error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AuthLayout>
        <LoadingScreen />
      </AuthLayout>
    );
  }

  // If user is already logged in, don't show login page
  if (user) {
    return null; // Will be redirected in useEffect
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
            loginAttempted={loginAttempted}
            isLoading={isLoading}
            errorMessage={errorMessage}
          />
          
          <LoginForm 
            onSuccess={handleLoginSuccess}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setLoginAttempted={setLoginAttempted}
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
