
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Mail, Loader2 } from "lucide-react";

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
      <Alert className="mb-4 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Выполняется вход...</AlertDescription>
      </Alert>
    );
  }

  if (needConfirmation) {
    return (
      <Alert className="mb-4 bg-blue-50">
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Пожалуйста, подтвердите ваш email перед входом. Проверьте свою почту.
        </AlertDescription>
      </Alert>
    );
  }

  if (loginAttempted && errorMessage) {
    return (
      <Alert className="mb-4 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  }

  return null;
};
