import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RegisterFormValues } from "@/components/auth/register-form-schema";
import { registerUser } from "@/services/auth";
import { supabase } from "@/integrations/supabase/client";
import { EmailConfirmationStatus } from "@/components/auth/EmailConfirmationStatus";
import { ProfileRecoveryDialog } from "@/components/auth/ProfileRecoveryDialog";
import { useAuth } from "@/hooks/auth/useAuth";
import { checkUserProfileStatus } from "@/services/auth/profileRecoveryService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [defaultRole, setDefaultRole] = useState<"student" | "tutor" | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [showProfileRecovery, setShowProfileRecovery] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredRole, setRegisteredRole] = useState<"student" | "tutor" | undefined>(undefined);
  const [registrationData, setRegistrationData] = useState<{
    firstName: string;
    lastName: string;
    role: "student" | "tutor";
    city?: string;
    phone?: string;
    bio?: string;
  } | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        if (user) {
          // Already logged in, check profile status
          try {
            const profileStatus = await checkUserProfileStatus(user.id);
            
            if (!profileStatus.profileExists) {
              // Profile doesn't exist, show recovery dialog
              console.log("User logged in but profile missing, showing recovery dialog");
              
              // Try to get registration data from user metadata
              const userData = {
                firstName: user.user_metadata?.first_name || "",
                lastName: user.user_metadata?.last_name || "",
                role: (user.user_metadata?.role as "student" | "tutor") || "student",
                city: user.user_metadata?.city || "",
                phone: user.user_metadata?.phone || "",
                bio: user.user_metadata?.bio || "",
              };
              
              setRegistrationData(userData);
              setShowProfileRecovery(true);
              setCheckingSession(false);
              return;
            }
            
            // Profile exists, redirect to appropriate page
            const role = user.user_metadata?.role || "student";
            if (role === "tutor") {
              console.log("RegisterPage: Redirecting to tutor profile");
              navigate("/profile/tutor");
            } else {
              console.log("RegisterPage: Redirecting to student profile");
              navigate("/profile/student");
            }
          } catch (error) {
            console.error("Error checking profile status:", error);
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
  }, [navigate, user]);

  // Get role from URL parameters if specified
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const role = params.get("role");
    
    if (role === "student" || role === "tutor") {
      console.log("RegisterPage: Setting default role from URL:", role);
      setDefaultRole(role);
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
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${registeredRole}`,
        }
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
      
      // Save data for potential profile recovery with required fields
      const recoveryData = {
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        role: role,
        city: values.city || "",
        phone: values.phone || "",
        bio: values.bio || "",
      };
      
      setRegistrationData(recoveryData);
      setRegisteredRole(role);
      setRegisteredEmail(values.email);
      
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
      
      // Check if email confirmation is required
      if (result.needsEmailConfirmation || !result.session) {
        // Show confirmation page instead of redirect
        setShowConfirmEmail(true);
      } else {
        // Automatically redirect based on role
        if (role === "tutor") {
          console.log("RegisterPage: Redirecting to tutor profile after successful registration");
          navigate("/profile/tutor/complete");
        } else {
          console.log("RegisterPage: Redirecting to student profile after successful registration");
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
      <AuthLayout>
        <LoadingScreen />
      </AuthLayout>
    );
  }

  if (showConfirmEmail) {
    return (
      <AuthLayout>
        <EmailConfirmationStatus
          email={registeredEmail}
          status="pending"
          onResend={handleResendConfirmation}
          isResending={isLoading}
          role={registeredRole}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
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

      {/* Profile Recovery Dialog */}
      {showProfileRecovery && registrationData && (
        <ProfileRecoveryDialog
          isOpen={showProfileRecovery}
          onClose={() => setShowProfileRecovery(false)}
          userData={registrationData}
        />
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
