
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface SimpleEmailConfirmationProps {
  email: string;
  onResend?: () => void;
  isResending?: boolean;
}

export const SimpleEmailConfirmation: React.FC<SimpleEmailConfirmationProps> = ({
  email,
  onResend,
  isResending = false,
}) => {
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
          <AlertTitle className="font-semibold">
            Проверьте вашу почту
          </AlertTitle>
          <AlertDescription>
            Мы отправили письмо с подтверждением на <strong>{email}</strong>. 
            Пожалуйста, проверьте вашу почту и следуйте инструкциям.
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          {onResend && (
            <Button 
              variant="outline" 
              onClick={onResend}
              disabled={isResending}
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
          )}

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
