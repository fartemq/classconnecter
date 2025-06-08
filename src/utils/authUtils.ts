
import { supabase } from "@/integrations/supabase/client";

/**
 * Простое получение роли пользователя из profiles таблицы
 */
export const getUserRole = async (userId: string): Promise<string> => {
  try {
    // Специальный случай для админа
    if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
      return "admin";
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data?.role) {
      console.log("No role found, defaulting to student");
      return "student";
    }

    return data.role;
  } catch (error) {
    console.error("Error getting user role:", error);
    return "student";
  }
};
