import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegisterFormValues } from "@/components/auth/register-form-schema";
import { registerUser } from "@/services/auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { EmailConfirmationStatus } from "@/components/auth/EmailConfirmationStatus";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [defaultRole, setDefaultRole] = useState<"student" | "tutor" | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Already logged in, redirect to profile
          try {
            const { data } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .maybeSingle();
              
            if (data?.role === "tutor") {
              navigate("/profile/tutor");
            } else {
              navigate("/profile/student");
            }
          } catch (error) {
            console.error("Error fetching profile data:", error);
            setCheckingSession(false);
          }
        } else {
          setCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setCheckingSession(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  // Get role from URL parameters if specified
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get("role");
    
    if (role === "student" || role === "tutor") {
      setDefaultRole(role);
      console.log("Setting default role from URL:", role);
    }
  }, [location]);

  // Handle resending confirmation email
  const handleResendConfirmation = async () => {
    if (!registeredEmail) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Письмо отправлено",
        description: "Проверьте свою почту для подтверждения аккаунта",
      });
    } catch (error) {
      console.error("Error resending confirmation:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить письмо подтверждения",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleRegisterSuccess(values: RegisterFormValues) {
    console.log("Registration values:", values);
    setIsLoading(true);
    
    try {
      // Make sure role is set properly
      const role = values.role || defaultRole || "student";
      console.log("Using role for registration:", role);
      
      // Register user with all provided data
      const result = await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: role,
        city: values.city || "",
        phone: values.phone || "",
        bio: values.bio || "",
      });

      console.log("Registration successful:", result);

      // Store email for potential resend
      setRegisteredEmail(values.email);
      
      // Check if email confirmation is required
      if (!result.session) {
        // Show confirmation page instead of redirect
        setShowConfirmEmail(true);
      } else {
        // Automatically redirect based on role
        if (role === "tutor") {
          navigate("/profile/tutor/complete");
        } else {
          navigate("/profile/student");
        }
      }
    } catch (error) {
      console.error("Registration error in page:", error);
      toast({
        title: "Ошибка регистрации",
        description: error instanceof Error ? error.message : "Произошла ошибка при регистрации",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (checkingSession) {
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

  if (showConfirmEmail) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
          <EmailConfirmationStatus
            email={registeredEmail}
            status="pending"
            onResend={handleResendConfirmation}
          />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
            <CardDescription>
              Создайте аккаунт для использования платформы Stud.rep
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm 
              onSuccess={handleRegisterSuccess} 
              defaultRole={defaultRole} 
              isLoading={isLoading} 
            />
          </CardContent>
          <CardFooter className="flex-col text-center">
            <p className="text-sm text-muted-foreground">
              После регистрации вам необходимо подтвердить email перед входом в систему
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
