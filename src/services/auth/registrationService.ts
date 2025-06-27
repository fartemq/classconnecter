
import { supabase } from "@/integrations/supabase/client";
import { RegisterUserData, AuthResult } from "./types";
import { checkUserProfileStatus, createMissingProfile } from "./profileRecoveryService";

/**
 * Улучшенный сервис регистрации с поддержкой восстановления профилей
 */
export const registerUser = async (userData: RegisterUserData): Promise<AuthResult> => {
  try {
    console.log("Starting enhanced registration process for:", userData.email);
    console.log("Registration data:", userData);
    
    // Регистрируем пользователя с правильными метаданными
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          city: userData.city || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
        },
        // Критически важно для email подтверждения - используем правильный callback URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      
      // Обрабатываем специфические ошибки
      if (authError.message.includes("User already registered")) {
        throw new Error("Пользователь с таким email уже существует");
      }
      
      if (authError.message.includes("Password should be at least")) {
        throw new Error("Пароль должен содержать минимум 6 символов");
      }
      
      throw new Error(authError.message || "Ошибка при регистрации пользователя");
    }

    // Проверяем, что пользователь создан
    if (!authData.user) {
      throw new Error("Не удалось создать пользователя");
    }
    
    console.log("User created successfully:", authData.user.id);

    // Если есть сессия (email подтверждение отключено), проверим профиль
    if (authData.session) {
      console.log("Session exists, checking profile creation");
      
      // Даем время триггеру сработать
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Проверяем, создался ли профиль
      const profileStatus = await checkUserProfileStatus(authData.user.id);
      
      if (!profileStatus.profileExists) {
        console.log("Profile not created by trigger, creating manually");
        
        // Создаем профиль вручную
        const recoveryResult = await createMissingProfile(authData.user.id, {
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          city: userData.city,
          phone: userData.phone,
          bio: userData.bio,
        });
        
        if (!recoveryResult.success) {
          console.error("Failed to create profile manually:", recoveryResult.message);
        } else {
          console.log("Profile created manually");
        }
      } else {
        console.log("Profile created successfully by trigger");
      }
    } else {
      console.log("No session found, email confirmation is required");
    }

    // Возвращаем результат
    return { 
      user: authData.user, 
      session: authData.session,
      needsEmailConfirmation: !authData.session 
    };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
