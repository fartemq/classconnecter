
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type EmailConfirmationStatusProps = {
  email?: string;
  status: 'pending' | 'confirmed' | 'error';
  message?: string;
  onResend?: () => void;
};

export const EmailConfirmationStatus = ({ 
  email, 
  status, 
  message,
  onResend 
}: EmailConfirmationStatusProps) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">
          {status === 'pending' && 'Подтверждение Email'}
          {status === 'confirmed' && 'Email подтвержден'}
          {status === 'error' && 'Ошибка подтверждения'}
        </CardTitle>
        <CardDescription>
          {status === 'pending' && `Мы отправили письмо для подтверждения на ${email || 'ваш email'}`}
          {status === 'confirmed' && 'Ваш email успешно подтвержден'}
          {status === 'error' && (message || 'Произошла ошибка при подтверждении email')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-primary/10 w-20 h-20 flex items-center justify-center mb-4">
          {status === 'pending' && <Mail className="h-10 w-10 text-primary" />}
          {status === 'confirmed' && <CheckCircle className="h-10 w-10 text-green-500" />}
          {status === 'error' && <AlertCircle className="h-10 w-10 text-red-500" />}
        </div>
        
        {status === 'pending' && (
          <>
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>Проверьте вашу почту и нажмите на ссылку в письме для подтверждения.</p>
              <p className="mt-2">Не получили письмо?</p>
            </div>
            {onResend && (
              <Button variant="outline" onClick={onResend} className="mt-2">
                Отправить письмо повторно
              </Button>
            )}
          </>
        )}
        
        {status === 'confirmed' && (
          <Link to="/login">
            <Button>Войти в аккаунт</Button>
          </Link>
        )}
        
        {status === 'error' && (
          <Link to="/register">
            <Button variant="outline">Вернуться к регистрации</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};
