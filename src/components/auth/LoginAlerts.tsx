
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface LoginAlertsProps {
  needConfirmation: boolean;
  loginAttempted: boolean;
  isLoading: boolean;
}

export function LoginAlerts({ needConfirmation, loginAttempted, isLoading }: LoginAlertsProps) {
  return (
    <>
      {needConfirmation && (
        <Alert className="mb-6 bg-amber-50 border-amber-200">
          <InfoIcon className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Для завершения регистрации проверьте вашу почту и следуйте инструкциям в письме для подтверждения аккаунта.
          </AlertDescription>
        </Alert>
      )}
      
      {loginAttempted && !isLoading && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Подсказка: Если вы только что зарегистрировались, проверьте почту для подтверждения аккаунта. Для разработки можно отключить подтверждение email в настройках Supabase.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
