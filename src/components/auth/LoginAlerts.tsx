
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, UserX, Mail } from "lucide-react";

interface LoginAlertsProps {
  error: string | null;
  isEmailConfirmationRequired?: boolean;
}

export const LoginAlerts = ({ error, isEmailConfirmationRequired }: LoginAlertsProps) => {
  if (isEmailConfirmationRequired) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Mail className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Проверьте вашу электронную почту и подтвердите регистрацию, перейдя по ссылке в письме.
        </AlertDescription>
      </Alert>
    );
  }

  if (!error) return null;

  // Проверяем различные типы ошибок
  const getErrorContent = () => {
    if (error.includes('Invalid login credentials') || error.includes('invalid_credentials')) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        message: "Неверный email или пароль. Проверьте правильность введенных данных."
      };
    }
    
    if (error.includes('Email not confirmed')) {
      return {
        icon: <Mail className="h-4 w-4 text-blue-600" />,
        message: "Подтвердите ваш email, перейдя по ссылке в письме.",
        className: "border-blue-200 bg-blue-50 text-blue-800"
      };
    }
    
    if (error.includes('User account has been blocked') || error.includes('blocked')) {
      return {
        icon: <UserX className="h-4 w-4 text-red-600" />,
        message: "Ваш аккаунт заблокирован администратором. Если у вас есть вопросы, обратитесь в службу поддержки."
      };
    }
    
    if (error.includes('User profile has been deleted') || error.includes('deleted')) {
      return {
        icon: <UserX className="h-4 w-4 text-red-600" />,
        message: "Этот аккаунт был удален администратором. Для восстановления доступа обратитесь в службу поддержки."
      };
    }

    // Общая ошибка
    return {
      icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
      message: "Произошла ошибка при входе. Попробуйте еще раз."
    };
  };

  const { icon, message, className = "border-red-200 bg-red-50" } = getErrorContent();

  return (
    <Alert className={className}>
      {icon}
      <AlertDescription className={className.includes('blue') ? 'text-blue-800' : 'text-red-800'}>
        {message}
      </AlertDescription>
    </Alert>
  );
};
