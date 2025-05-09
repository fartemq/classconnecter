
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface EmailConfirmationStatusProps {
  email: string;
  status: "pending" | "confirmed";
  onResend?: () => void;
  isResending?: boolean;
  role?: "student" | "tutor";
}

export const EmailConfirmationStatus: React.FC<EmailConfirmationStatusProps> = ({
  email,
  status,
  onResend,
  isResending = false,
  role
}) => {
  const getProfileUrl = () => {
    if (role === "tutor") {
      return "/profile/tutor/complete";
    }
    return "/profile/student";
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <MailCheck className="text-primary h-6 w-6" />
          Подтверждение Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTitle className="font-semibold">
            {status === "pending" ? "Требуется подтверждение" : "Email подтвержден"}
          </AlertTitle>
          <AlertDescription>
            {status === "pending" ? (
              <>
                Мы отправили письмо с подтверждением на <strong>{email}</strong>. 
                Пожалуйста, проверьте вашу почту и следуйте инструкциям для завершения регистрации.
              </>
            ) : (
              <>
                Ваш email успешно подтвержден! Теперь вы можете войти в систему.
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          {status === "pending" && onResend && (
            <Button 
              variant="outline" 
              onClick={onResend}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить письмо еще раз"
              )}
            </Button>
          )}

          {status === "confirmed" && (
            <Button asChild>
              <Link to={getProfileUrl()}>
                Перейти в профиль
              </Link>
            </Button>
          )}

          <div className="text-center text-sm text-gray-500 mt-2">
            После подтверждения email, вы будете перенаправлены в личный кабинет {role === "tutor" ? "репетитора" : "ученика"}.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
