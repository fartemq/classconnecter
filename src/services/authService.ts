
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
    throw authError;
  }

  // Create profile in profiles table
  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      throw new Error("Ошибка при создании профиля");
    }
  }

  return authData;
};
