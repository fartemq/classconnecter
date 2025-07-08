
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReliableRegisterForm } from "@/components/auth/ReliableRegisterForm";
import { ReliableEmailWaiting } from "@/components/auth/ReliableEmailWaiting";
import { registerUserReliable } from "@/services/auth/reliableRegistrationService";
import { resendReliableConfirmation } from "@/services/auth/reliableEmailConfirmationService";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [registrationState, setRegistrationState] = useState<"form" | "waiting">("form");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"student" | "tutor">("student");

  // Определяем роль по умолчанию из URL
  const getDefaultRole = (): "student" | "tutor" => {
    const params = new URLSearchParams(location.search);
    const role = params.get("role");
    return role === "tutor" ? "tutor" : "student";
  };

  // Проверяем авторизацию
  useEffect(() => {
    if (user) {
      // Пользователь уже авторизован, перенаправляем
      const role = user.user_metadata?.role || "student";
      if (role === "tutor") {
        navigate("/profile/tutor");
      } else {
        navigate("/profile/student");
      }
    } else {
      setCheckingAuth(false);
    }
  }, [user, navigate]);

  const handleRegister = async (formData: any) => {
    setIsLoading(true);
    
    try {
      const result = await registerUserReliable({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
        if (result.needsEmailConfirmation) {
          // Переходим в режим ожидания подтверждения email
          setUserEmail(formData.email);
          setUserRole(formData.role);
          setRegistrationState("waiting");
          
          toast({
            title: "Регистрация успешна!",
            description: "Проверьте свою почту для подтверждения аккаунта",
          });
        } else {
          // Автоматический вход (если подтверждение отключено)
          toast({
            title: "Регистрация завершена!",
            description: "Добро пожаловать в Stud.rep",
          });

          if (formData.role === "tutor") {
            navigate("/profile/tutor/complete");
          } else {
            navigate("/profile/student");
          }
        }
      } else {
        toast({
          title: "Ошибка регистрации",
          description: result.error || "Произошла ошибка при регистрации",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Ошибка",
        description: "Произошла неожиданная ошибка",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async (): Promise<boolean> => {
    return await resendReliableConfirmation(userEmail);
  };

  if (checkingAuth) {
    return (
      <AuthLayout>
        <LoadingScreen />
      </AuthLayout>
    );
  }

  if (registrationState === "waiting") {
    return (
      <AuthLayout>
        <ReliableEmailWaiting 
          email={userEmail}
          onResend={handleResendConfirmation}
          role={userRole}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Регистрация</CardTitle>
          <CardDescription>
            Создайте аккаунт для использования платформы Stud.rep
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReliableRegisterForm 
            onSubmit={handleRegister}
            isLoading={isLoading}
            defaultRole={getDefaultRole()}
          />
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
