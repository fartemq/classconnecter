
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, Loader2, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { checkEmailConfirmationStatus, resendConfirmationEmail } from "@/services/auth/emailConfirmationService";
import type { EmailConfirmationStatus } from "@/services/auth/emailConfirmationService";

interface EmailConfirmationStatusProps {
  email: string;
  status: "pending" | "confirmed";
  onResend?: () => void;
  isResending?: boolean;
  role?: "student" | "tutor";
}

export const EmailConfirmationStatus: React.FC<EmailConfirmationStatusProps> = ({
  email,
  status: initialStatus,
  onResend,
  isResending = false,
  role
}) => {
  const navigate = useNavigate();
  const [emailStatus, setEmailStatus] = useState<EmailConfirmationStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isResendingLocal, setIsResendingLocal] = useState(false);

  // Периодически проверяем статус подтверждения
  useEffect(() => {
    const checkStatus = async () => {
      setIsChecking(true);
      const status = await checkEmailConfirmationStatus();
      setEmailStatus(status);
      setIsChecking(false);

      // Если email подтвержден, автоматически редиректим
      if (status?.isConfirmed) {
        const redirectPath = role === "tutor" ? "/profile/tutor/complete" : "/profile/student";
        setTimeout(() => {
          navigate(redirectPath);
        }, 2000);
      }
    };

    checkStatus();

    // Перепроверяем каждые 10 секунд
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, [role, navigate]);

  const handleResend = async () => {
    setIsResendingLocal(true);
    const success = await resendConfirmationEmail(email);
    setIsResendingLocal(false);
    
    if (onResend) {
      onResend();
    }

    // Обновляем статус после отправки
    if (success) {
      const newStatus = await checkEmailConfirmationStatus();
      setEmailStatus(newStatus);
    }
  };

  const getProfileUrl = () => {
    if (role === "tutor") {
      return "/profile/tutor/complete";
    }
    return "/profile/student";
  };

  const isConfirmed = emailStatus?.isConfirmed || initialStatus === "confirmed";
  const canResend = emailStatus?.canResend ?? true;
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <MailCheck className={`h-6 w-6 ${isConfirmed ? 'text-green-600' : 'text-primary'}`} />
          Подтверждение Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={isConfirmed ? "border-green-200 bg-green-50" : ""}>
          <AlertTitle className="font-semibold flex items-center gap-2">
            {isChecking && <Loader2 className="h-4 w-4 animate-spin" />}
            {isConfirmed ? "Email подтвержден" : "Требуется подтверждение"}
          </AlertTitle>
          <AlertDescription>
            {isConfirmed ? (
              <>
                Ваш email успешно подтвержден! Сейчас вы будете перенаправлены в ваш профиль.
              </>
            ) : (
              <>
                Мы отправили письмо с подтверждением на <strong>{email}</strong>. 
                Пожалуйста, проверьте вашу почту (включая папку "Спам") и следуйте инструкциям для завершения регистрации.
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          {!isConfirmed && (
            <>
              <Button 
                variant="outline" 
                onClick={handleResend}
                disabled={isResendingLocal || isResending || !canResend}
              >
                {(isResendingLocal || isResending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Отправить письмо еще раз
                  </>
                )}
              </Button>
              
              {!canResend && (
                <p className="text-sm text-gray-500 text-center">
                  Подождите минуту перед повторной отправкой
                </p>
              )}
            </>
          )}

          {isConfirmed && (
            <Button asChild>
              <Link to={getProfileUrl()}>
                Перейти в профиль
              </Link>
            </Button>
          )}

          <div className="text-center text-sm text-gray-500 mt-2">
            {isConfirmed ? (
              "Добро пожаловать в Stud.rep!"
            ) : (
              `После подтверждения email вы будете перенаправлены в личный кабинет ${role === "tutor" ? "репетитора" : "ученика"}.`
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
