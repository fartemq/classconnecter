
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const useAuthValidation = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_blocked, first_name')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error checking user status:', error);
        return;
      }

      if (profile?.is_blocked) {
        // Если пользователь заблокирован, выходим из системы
        await supabase.auth.signOut();
        toast({
          title: "Доступ ограничен",
          description: "Ваш аккаунт заблокирован администратором.",
          variant: "destructive"
        });
        return;
      }

      if (profile?.first_name === '[УДАЛЕН]') {
        // Если профиль помечен как удаленный, выходим из системы
        await supabase.auth.signOut();
        toast({
          title: "Аккаунт удален",
          description: "Этот аккаунт был удален администратором.",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error in auth validation:', error);
    }
  };

  return { checkUserStatus };
};
