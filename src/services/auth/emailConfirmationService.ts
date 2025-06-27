
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Сервис для работы с подтверждением email
 */

export interface EmailConfirmationStatusData {
  isConfirmed: boolean;
  email: string;
  userId: string;
  canResend: boolean;
  lastSentAt?: Date;
}

/**
 * Проверяет статус подтверждения email для текущего пользователя
 */
export const checkEmailConfirmationStatus = async (): Promise<EmailConfirmationStatusData | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const isConfirmed = user.email_confirmed_at != null;
    const lastSentAt = user.confirmation_sent_at ? new Date(user.confirmation_sent_at) : undefined;
    const canResend = !lastSentAt || (Date.now() - lastSentAt.getTime()) > 60000; // 1 минута

    return {
      isConfirmed,
      email: user.email || "",
      userId: user.id,
      canResend,
      lastSentAt
    };
  } catch (error) {
    console.error("Error checking email confirmation status:", error);
    return null;
  }
};

/**
 * Отправляет письмо подтверждения повторно
 */
export const resendConfirmationEmail = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error("Error resending confirmation:", error);
      
      if (error.message.includes("Email rate limit exceeded")) {
        toast({
          title: "Превышен лимит",
          description: "Слишком много попыток. Попробуйте позже",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Ошибка отправки",
          description: error.message || "Не удалось отправить письмо",
          variant: "destructive"
        });
      }
      return false;
    }

    toast({
      title: "Письмо отправлено",
      description: "Проверьте свою почту для подтверждения аккаунта"
    });
    
    return true;
  } catch (error) {
    console.error("Error in resendConfirmationEmail:", error);
    toast({
      title: "Ошибка",
      description: "Произошла ошибка при отправке письма",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Обрабатывает callback после подтверждения email
 */
export const handleEmailConfirmationCallback = async (): Promise<{
  success: boolean;
  redirectPath?: string;
  role?: string;
}> => {
  try {
    // Получаем сессию из URL параметров
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      // Устанавливаем сессию
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) {
        console.error("Error setting session:", error);
        return { success: false };
      }
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false };
    }

    // Проверяем, что email подтвержден
    if (!user.email_confirmed_at) {
      return { success: false };
    }

    // Получаем профиль пользователя для определения роли
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || user.user_metadata?.role || "student";
    
    // Определяем путь для редиректа
    let redirectPath = "/";
    if (role === "tutor") {
      redirectPath = "/profile/tutor/complete";
    } else if (role === "student") {
      redirectPath = "/profile/student";
    }

    return {
      success: true,
      redirectPath,
      role
    };
  } catch (error) {
    console.error("Error handling email confirmation callback:", error);
    return { success: false };
  }
};
