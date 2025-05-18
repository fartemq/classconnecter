
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Profile } from "../types";

/**
 * Creates a basic profile for a new user
 */
export async function createBasicProfile(
  user: User,
  role: "student" | "tutor"
): Promise<Profile | null> {
  try {
    console.log(`Creating new basic profile for user ${user.id} with role ${role}`);
    
    // Extract user name from metadata or email
    let firstName = "";
    let lastName = "";
    
    if (user.user_metadata?.first_name) {
      firstName = user.user_metadata.first_name;
    }
    
    if (user.user_metadata?.last_name) {
      lastName = user.user_metadata.last_name;
    }
    
    // If no name in metadata, try to extract from email
    if (!firstName && user.email) {
      const emailName = user.email.split('@')[0];
      firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    // Create the profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        role: role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating basic profile:", error);
      toast({
        title: "Ошибка создания профиля",
        description: "Не удалось создать профиль пользователя",
        variant: "destructive",
      });
      return null;
    }
    
    console.log("Basic profile created successfully:", profile);
    return profile as Profile;
  } catch (error) {
    console.error("Error in createBasicProfile:", error);
    return null;
  }
}
