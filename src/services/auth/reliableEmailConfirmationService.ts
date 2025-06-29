
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface EmailConfirmationResult {
  success: boolean;
  redirectPath?: string;
  role?: string;
  error?: string;
}

/**
 * Обрабатывает callback после подтверждения email
 */
export const handleReliableEmailConfirmation = async (): Promise<EmailConfirmationResult> => {
  try {
    console.log("Processing email confirmation callback...");
    
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const type = urlParams.get('type');
    
    if (type === 'signup' && accessToken && refreshToken) {
      // Устанавливаем сессию после подтверждения email
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (sessionError) {
        console.error("Error setting session:", sessionError);
        return { 
          success: false, 
          error: "Ошибка установки сессии после подтверждения email" 
        };
      }
    }
    
    // Получаем текущего пользователя
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return { 
        success: false, 
        error: "Не удалось получить данные пользователя" 
      };
    }

    // Проверяем, что email подтверждён
    if (!user.email_confirmed_at) {
      return { 
        success: false, 
        error: "Email не подтверждён" 
      };
    }

    console.log("Email confirmed for user:", user.id);

    // Ждём создания профиля (даём триггеру время сработать)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Проверяем существование профиля
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return { 
        success: false, 
        error: "Ошибка получения профиля пользователя" 
      };
    }

    // Если профиль не найден, создаём его вручную
    if (!profile) {
      console.log("Profile not found, creating manually...");
      
      const userData = user.user_metadata;
      const { error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          first_name: userData?.first_name || '',
          last_name: userData?.last_name || '',
          role: userData?.role || 'student',
          city: userData?.city || '',
          phone: userData?.phone || ''
        });

      if (createError) {
        console.error("Error creating profile:", createError);
        return { 
          success: false, 
          error: "Ошибка создания профиля пользователя" 
        };
      }

      // Создаём role-specific профиль
      const role = userData?.role || 'student';
      
      if (role === 'student') {
        await supabase.from("student_profiles").insert({
          id: user.id,
          educational_level: null,
          subjects: [],
          learning_goals: null,
          preferred_format: [],
          school: null,
          grade: null,
          budget: 1000
        });
      } else if (role === 'tutor') {
        await supabase.from("tutor_profiles").insert({
          id: user.id,
          education_institution: '',
          degree: '',
          graduation_year: new Date().getFullYear(),
          experience: 0,
          methodology: null,
          achievements: null,
          video_url: null,
          is_published: false,
          education_verified: false
        });
      }
    }

    const role = profile?.role || user.user_metadata?.role || 'student';
    
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
    console.error("Error in email confirmation:", error);
    return { 
      success: false, 
      error: "Произошла ошибка при подтверждении email" 
    };
  }
};

/**
 * Повторная отправка письма подтверждения
 */
export const resendReliableConfirmation = async (email: string): Promise<boolean> => {
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
          description: "Слишком много попыток. Попробуйте через минуту",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Ошибка отправки",
          description: "Не удалось отправить письмо",
          variant: "destructive"
        });
      }
      return false;
    }

    toast({
      title: "Письмо отправлено",
      description: "Проверьте свою почту для подтверждения"
    });
    
    return true;
  } catch (error) {
    console.error("Error in resendConfirmation:", error);
    toast({
      title: "Ошибка",
      description: "Произошла ошибка при отправке письма",
      variant: "destructive"
    });
    return false;
  }
};
