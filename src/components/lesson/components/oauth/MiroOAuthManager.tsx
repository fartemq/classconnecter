
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

interface MiroOAuthManagerProps {
  onAuthStatusChange: (isAuthorized: boolean) => void;
}

export const MiroOAuthManager = ({ onAuthStatusChange }: MiroOAuthManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, [user]);

  useEffect(() => {
    onAuthStatusChange(isAuthorized);
  }, [isAuthorized, onAuthStatusChange]);

  const checkAuthStatus = async () => {
    if (!user) return;

    try {
      const { data: tokens } = await supabase
        .from('user_oauth_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'miro')
        .maybeSingle();

      setIsAuthorized(!!tokens && new Date(tokens.expires_at) > new Date());
    } catch (error) {
      console.error('Error checking Miro auth status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const authorize = async () => {
    setIsAuthorizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('miro-oauth', {
        body: { action: 'authorize' }
      });

      if (error) throw error;

      if (data?.auth_url) {
        const popup = window.open(data.auth_url, '_blank', 'width=500,height=600');
        
        const handleMessage = (event: MessageEvent) => {
          if (event.data.type === 'miro_auth_success') {
            handleAuthCallback(event.data.code, event.data.state);
            window.removeEventListener('message', handleMessage);
            if (popup) popup.close();
          } else if (event.data.type === 'miro_auth_error') {
            toast({
              title: "Ошибка авторизации Miro",
              description: `Ошибка: ${event.data.error}`,
              variant: "destructive"
            });
            setIsAuthorizing(false);
            window.removeEventListener('message', handleMessage);
            if (popup) popup.close();
          }
        };
        
        window.addEventListener('message', handleMessage);
        
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsAuthorizing(false);
            window.removeEventListener('message', handleMessage);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error authorizing Miro:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось начать авторизацию Miro",
        variant: "destructive"
      });
      setIsAuthorizing(false);
    }
  };

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('miro-oauth', {
        body: { action: 'callback', code, state }
      });

      if (error) throw error;

      if (data?.success) {
        setIsAuthorized(true);
        toast({
          title: "Успешно",
          description: "Miro аккаунт подключен"
        });
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить авторизацию",
        variant: "destructive"
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Проверка авторизации...</span>
      </div>
    );
  }

  if (isAuthorized) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="flex items-center justify-between">
            <span>Miro аккаунт подключен</span>
            <Badge variant="outline" className="text-green-600">
              Активен
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-800">
        <div className="flex items-center justify-between">
          <span>Требуется подключение Miro аккаунта</span>
          <Button 
            onClick={authorize} 
            disabled={isAuthorizing}
            size="sm"
            className="ml-2"
          >
            {isAuthorizing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Подключить
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
