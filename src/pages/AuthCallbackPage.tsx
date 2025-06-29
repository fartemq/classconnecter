
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleReliableEmailConfirmation } from "@/services/auth/reliableEmailConfirmationService";
import { toast } from "@/hooks/use-toast";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log("Processing email confirmation callback...");
        
        const result = await handleReliableEmailConfirmation();
        
        if (result.success) {
          setStatus("success");
          setMessage("Email успешно подтверждён! Добро пожаловать в Stud.rep!");
          setRedirectPath(result.redirectPath || "/");
          
          toast({
            title: "Подтверждение успешно!",
            description: "Ваш аккаунт активирован",
          });
          
          // Автоматический редирект через 3 секунды
          setTimeout(() => {
            navigate(result.redirectPath || "/");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(result.error || "Произошла ошибка при подтверждении email");
          
          toast({
            title: "Ошибка подтверждения",
            description: result.error || "Не удалось подтвердить email",
            variant: "destructive",
          });
        }
        
      } catch (error) {
        console.error("Error in auth callback:", error);
        setStatus("error");
        setMessage("Произошла неожиданная ошибка при подтверждении email");
      }
    };

    // Небольшая задержка для лучшего UX
    const timer = setTimeout(processCallback, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleManualRedirect = () => {
    navigate(redirectPath);
  };

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
        <CardContent className="space-y-4">
          <Alert className={status === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className="text-center">
              {message}
            </AlertDescription>
          </Alert>

          {status === "success" && (
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Вы будете автоматически перенаправлены через несколько секунд...
              </p>
              <Button onClick={handleManualRedirect} className="w-full">
                Перейти в профиль
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-3">
              <Button onClick={() => navigate("/login")} variant="outline" className="w-full">
                Вернуться к входу
              </Button>
              <Button onClick={() => navigate("/register")} className="w-full">
                Повторить регистрацию
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default AuthCallbackPage;
