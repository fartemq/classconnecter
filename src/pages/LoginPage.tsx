
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        // Format friendly error message
        let message = error.message;
        if (error.message.includes("Email not confirmed")) {
          message = "Необходимо подтвердить email. Проверьте вашу почту.";
        } else if (error.message.includes("Invalid login credentials")) {
          message = "Неверный email или пароль";
        }
        setErrorMessage(message);
        throw new Error(message);
      }
      
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в Stud.rep!",
      });
      
      // No need to redirect here - the useEffect with user and userRole dependencies will handle that
      
    } catch (error) {
      console.error("Login error:", error);
      // Error message is already set above
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
            {needConfirmation && (
              <Alert className="mb-4 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Вам необходимо подтвердить email перед входом. Проверьте свою почту.
                </AlertDescription>
              </Alert>
            )}
            
            {errorMessage && (
              <Alert className="mb-4 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
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
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
