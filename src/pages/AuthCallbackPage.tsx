
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { handleEmailConfirmationCallback } from "@/services/auth/emailConfirmationService";
import { checkUserProfileStatus } from "@/services/auth/profileRecoveryService";
import { useAuth } from "@/hooks/auth/useAuth";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("Processing auth callback...");
        
        // Обрабатываем callback
        const result = await handleEmailConfirmationCallback();
        
        if (!result.success) {
          setStatus("error");
          setMessage("Не удалось подтвердить email. Попробуйте войти в аккаунт снова.");
          return;
        }

        console.log("Email confirmation successful, user role:", result.role);
        
        // Проверяем состояние профиля
        if (user?.id) {
          const profileStatus = await checkUserProfileStatus(user.id);
          
          if (!profileStatus.profileExists) {
            console.log("Profile not found after email confirmation");
            setStatus("error");
            setMessage("Профиль не найден. Обратитесь в поддержку.");
            return;
          }
        }

        setStatus("success");
        setMessage("Email успешно подтвержден! Перенаправляем в ваш профиль...");
        
        // Редиректим через 2 секунды
        setTimeout(() => {
          if (result.redirectPath) {
            navigate(result.redirectPath);
          } else {
            navigate("/");
          }
        }, 2000);
        
      } catch (error) {
        console.error("Error in auth callback:", error);
        setStatus("error");
        setMessage("Произошла ошибка при подтверждении email.");
      }
    };

    // Небольшая задержка, чтобы auth state успел обновиться
    const timer = setTimeout(processCallback, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate, user]);

  if (status === "processing") {
    return (
      <AuthLayout>
        <LoadingScreen />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {status === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            )}
            Подтверждение Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default AuthCallbackPage;
