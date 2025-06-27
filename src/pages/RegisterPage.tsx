
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleRegisterForm } from "@/components/auth/SimpleRegisterForm";
import { registerUserSimple } from "@/services/auth/simpleRegistrationService";
import { useAuth } from "@/hooks/auth/useAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

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
      const result = await registerUserSimple({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
        toast({
          title: "Регистрация успешна!",
          description: "Добро пожаловать в Stud.rep",
        });

        // Перенаправляем в зависимости от роли
        if (formData.role === "tutor") {
          navigate("/profile/tutor/complete");
        } else {
          navigate("/profile/student");
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

  if (checkingAuth) {
    return (
      <AuthLayout>
        <LoadingScreen />
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
          <SimpleRegisterForm 
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
