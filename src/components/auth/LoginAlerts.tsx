
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, Loader2, CheckCircle, Info } from "lucide-react";

interface LoginAlertsProps {
  needConfirmation: boolean;
  loginAttempted: boolean;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const LoginAlerts: React.FC<LoginAlertsProps> = ({
  needConfirmation,
  loginAttempted,
  isLoading,
  errorMessage,
}) => {
  if (isLoading) {
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-800">
          Выполняется вход в систему...
        </AlertDescription>
      </Alert>
    );
  }

  if (needConfirmation) {
    return (
      <Alert className="mb-4 bg-amber-50 border-amber-200">
        <Mail className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <div className="space-y-2">
            <p className="font-medium">Подтвердите email для входа</p>
            <p className="text-sm">
              Проверьте почту и перейдите по ссылке для подтверждения аккаунта. 
              Если письмо не пришло, проверьте папку "Спам".
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (loginAttempted && errorMessage) {
    const isCredentialsError = errorMessage.includes("пароль") || errorMessage.includes("credentials");
    const isEmailError = errorMessage.includes("подтвержден") || errorMessage.includes("confirmed");
    const isNetworkError = errorMessage.includes("подключение") || errorMessage.includes("network");
    
    return (
      <Alert className="mb-4 bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <p className="font-medium">{errorMessage}</p>
            
            {isCredentialsError && (
              <div className="text-sm space-y-1">
                <p>• Проверьте правильность email и пароля</p>
                <p>• Убедитесь, что Caps Lock выключен</p>
                <p>• Попробуйте восстановить пароль, если забыли его</p>
              </div>
            )}
            
            {isEmailError && (
              <div className="text-sm space-y-1">
                <p>• Проверьте почту и подтвердите регистрацию</p>
                <p>• Письмо могло попасть в папку "Спам"</p>
                <p>• Можете запросить повторную отправку письма</p>
              </div>
            )}
            
            {isNetworkError && (
              <div className="text-sm space-y-1">
                <p>• Проверьте подключение к интернету</p>
                <p>• Попробуйте обновить страницу</p>
                <p>• Возможны временные проблемы с сервером</p>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Показываем общую информацию, если нет ошибок
  return (
    <Alert className="mb-4 bg-green-50 border-green-200">
      <Info className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <div className="space-y-1">
          <p className="font-medium">Добро пожаловать в Stud.rep!</p>
          <p className="text-sm">Введите ваши данные для входа в систему</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
