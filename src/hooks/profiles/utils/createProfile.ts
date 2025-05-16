
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Profile } from "../types";

/**
 * Creates a basic profile for a new user
 */
export const createBasicProfile = async (user: User, role: string): Promise<Profile | null> => {
  try {
    console.log("Creating basic profile for user:", user.id, "with role:", role);
    
    // First check if profile already exists to prevent duplication
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
      
    if (existingProfile) {
      console.log("Profile already exists, returning existing profile");
      return existingProfile as Profile;
    }
    
    // Extract name from metadata if available
    let firstName = "";
    let lastName = "";
    
    if (user.user_metadata) {
      firstName = user.user_metadata.first_name || "";
      lastName = user.user_metadata.last_name || "";
    }
    
    // Create a new profile
    const newProfileData = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      role: role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log("Inserting new profile:", newProfileData);
    
    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert(newProfileData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating basic profile:", error);
      return null;
    }
    
    console.log("Basic profile created successfully:", newProfile);
    return newProfile as Profile;
  } catch (error) {
    console.error("Error in createBasicProfile:", error);
    return null;
  }
};

/**
 * Creates a role-specific profile (student or tutor)
 */
export const createRoleSpecificProfile = async (userId: string, role: string): Promise<boolean> => {
  try {
    console.log(`Creating ${role} profile for user:`, userId);
    
    // Check if role-specific profile already exists to prevent duplication
    const { data: existingProfile, error: checkError } = await supabase
      .from(`${role}_profiles`)
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error(`Error checking if ${role} profile exists:`, checkError);
      return false;
    }
    
    if (existingProfile) {
      console.log(`${role} profile already exists`);
      return true;
    }
    
    // Create role-specific profile
    const { error } = await supabase
      .from(`${role}_profiles`)
      .insert({ id: userId });
      
    if (error) {
      console.error(`Error creating ${role} profile:`, error);
      return false;
    }
    
    console.log(`${role} profile created successfully`);
    return true;
  } catch (error) {
    console.error(`Error in createRoleSpecificProfile for ${role}:`, error);
    return false;
  }
};
