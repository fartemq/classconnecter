
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole } from "@/services/authService";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginAlerts } from "@/components/auth/LoginAlerts";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in, get their role and redirect
        try {
          const role = await getUserRole(session.user.id);
          if (role === "tutor") {
            navigate("/profile/tutor");
          } else {
            navigate("/profile/student");
          }
        } catch (error) {
          console.error("Error checking role:", error);
        }
      }
    };

    checkSession();
    
    // Check if coming from registration page
    if (location.state && location.state.needConfirmation) {
      setNeedConfirmation(true);
    }
  }, [location, navigate]);

  // Handle successful login
  const handleLoginSuccess = async (role: string) => {
    if (role === "tutor") {
      navigate("/profile/tutor");
    } else {
      navigate("/profile/student");
    }
  };

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
