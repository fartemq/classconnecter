
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type RegisterUserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "student" | "tutor";
};

export const registerUser = async (userData: RegisterUserData) => {
  try {
    // Register the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
        },
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(authError.message || "Ошибка при регистрации пользователя");
    }

    // Verify user is created
    if (!authData.user) {
      throw new Error("Не удалось создать пользователя");
    }

    // Create profile in profiles table using service role permissions
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      if (profileError.message.includes("duplicate key")) {
        throw new Error("Пользователь с таким email уже существует");
      }
      throw new Error(profileError.message || "Ошибка при создании профиля");
    }

    return authData;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
