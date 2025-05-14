
import { supabase } from "@/integrations/supabase/client";

/**
 * Logout the current user
 */
export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Error during logout:", error);
    throw new Error("Не удалось выйти из системы");
  }
};
