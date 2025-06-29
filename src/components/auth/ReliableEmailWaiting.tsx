
import React, { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface ReliableEmailWaitingProps {
  email: string;
  onResend: () => Promise<boolean>;
  role?: "student" | "tutor";
}

export const ReliableEmailWaiting: React.FC<ReliableEmailWaitingProps> = ({
  email,
  onResend,
  role = "student"
}) => {
  const [isResending, setIsResending] = useState(false);
  const [lastResent, setLastResent] = useState<Date | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setResendError(null);
    
    try {
      const success = await onResend();
      
      if (success) {
        setLastResent(new Date());
        toast({
          title: "Письмо отправлено",
          description: "Проверьте свою почту для подтверждения аккаунта"
        });
      } else {
        setResendError("Не удалось отправить письмо. Возможно, превышен лимит отправки");
        toast({
          title: "Ошибка отправки",
          description: "Превышен лимит отправки писем. Попробуйте через несколько минут",
          variant: "destructive"
        });
      }
    } catch (error) {
      setResendError("Произошла ошибка при отправке письма");
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при отправке письма",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const canResend = !lastResent || (Date.now() - lastResent.getTime()) > 60000; // 1 минута

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <MailCheck className="h-6 w-6 text-blue-600" />
          Подтверждение Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            Регистрация почти завершена!
          </AlertTitle>
          <AlertDescription>
            Мы отправили письмо с подтверждением на <strong>{email}</strong>. 
            Пожалуйста, проверьте вашу почту (включая папку "Спам") и нажмите на ссылку подтверждения.
          </AlertDescription>
        </Alert>

        {resendError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {resendError}
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Что дальше:</h4>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Откройте вашу почту</li>
            <li>Найдите письмо от Stud.rep</li>
            <li>Нажмите на ссылку подтверждения</li>
            <li>Вы будете перенаправлены для завершения настройки профиля</li>
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            onClick={handleResend}
            disabled={isResending || !canResend}
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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

          <div className="text-center text-sm text-gray-500 mt-2">
            После подтверждения email вы будете перенаправлены в личный кабинет{" "}
            {role === "tutor" ? "репетитора" : "ученика"}.
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:underline">
              Вернуться к входу
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
