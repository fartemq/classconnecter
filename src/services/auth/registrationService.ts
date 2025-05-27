
import { supabase } from "@/integrations/supabase/client";
import { RegisterUserData, AuthResult } from "./types";

/**
 * Registers a new user and creates their profile with RLS compliance
 * Profiles are now automatically created via database triggers
 */
export const registerUser = async (userData: RegisterUserData): Promise<AuthResult> => {
  try {
    console.log("Starting registration process for:", userData.email);
    console.log("Registration data:", userData);
    
    // Register the user with proper metadata
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
        emailRedirectTo: window.location.origin + '/profile/' + userData.role,
      },
    });

    if (authError) {
      console.error("Auth error:", authError);
      
      // Handle specific errors
      if (authError.message.includes("User already registered")) {
        throw new Error("Пользователь с таким email уже существует");
      }
      
      throw new Error(authError.message || "Ошибка при регистрации пользователя");
    }

    // Verify user is created
    if (!authData.user) {
      throw new Error("Не удалось создать пользователя");
    }
    
    console.log("User created successfully:", authData.user.id);
    console.log("Profile will be created automatically via database trigger");

    // Return auth result
    if (!authData.session) {
      console.log("No session found, email confirmation is required");
      return { user: authData.user, session: null };
    }
    
    console.log("Session exists, registration complete");
    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
