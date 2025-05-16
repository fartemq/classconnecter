
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Creates a basic profile entry for a new user
 */
export async function createBasicProfile(user: User, role: string = "student") {
  try {
    console.log("Creating basic profile for user:", user.id, "with role:", role);
    
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    
    if (checkError) {
      console.error("Error checking existing profile:", checkError);
      throw new Error("Failed to check for existing profile");
    }
    
    // If profile already exists, don't create a new one
    if (existingProfile) {
      console.log("Profile already exists for user:", user.id);
      return existingProfile;
    }
    
    // Extract user metadata if available
    const metadata = user.user_metadata;
    const firstName = metadata?.first_name || "";
    const lastName = metadata?.last_name || "";
    
    // Create the profile
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        role: role,
        created_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    
    if (createError) {
      console.error("Error creating profile:", createError);
      throw createError;
    }
    
    console.log("Basic profile created successfully:", newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error in createProfile:", error);
    throw error;
  }
}

/**
 * Creates a role-specific profile entry for a user
 */
export async function createRoleSpecificProfile(userId: string, role: string = "student") {
  try {
    console.log(`Creating ${role} profile for user:`, userId);
    
    if (role === "student") {
      // Check if student profile already exists
      const { data: existingStudentProfile, error: checkStudentError } = await supabase
        .from("student_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      
      if (checkStudentError && checkStudentError.code !== 'PGRST116') {
        console.error("Error checking existing student profile:", checkStudentError);
        throw new Error("Failed to check for existing student profile");
      }
      
      // If profile already exists, don't create a new one
      if (existingStudentProfile) {
        console.log("Student profile already exists for user:", userId);
        return existingStudentProfile;
      }
      
      // Create student profile
      const { data: studentProfile, error: studentError } = await supabase
        .from("student_profiles")
        .insert({
          id: userId,
          educational_level: "school",
          subjects: [],
          preferred_format: ["online", "offline"]
        })
        .select()
        .maybeSingle();
      
      if (studentError) {
        console.error("Error creating student profile:", studentError);
        throw studentError;
      }
      
      console.log("Student profile created successfully:", studentProfile);
      return studentProfile;
    } else if (role === "tutor") {
      // Check if tutor profile already exists
      const { data: existingTutorProfile, error: checkTutorError } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      
      if (checkTutorError && checkTutorError.code !== 'PGRST116') {
        console.error("Error checking existing tutor profile:", checkTutorError);
        throw new Error("Failed to check for existing tutor profile");
      }
      
      // If profile already exists, don't create a new one
      if (existingTutorProfile) {
        console.log("Tutor profile already exists for user:", userId);
        return existingTutorProfile;
      }
      
      // Create tutor profile
      const { data: tutorProfile, error: tutorError } = await supabase
        .from("tutor_profiles")
        .insert({
          id: userId,
          is_published: false,
          education_verified: false
        })
        .select()
        .maybeSingle();
      
      if (tutorError) {
        console.error("Error creating tutor profile:", tutorError);
        throw tutorError;
      }
      
      console.log("Tutor profile created successfully:", tutorProfile);
      return tutorProfile;
    }
    
    return null;
  } catch (error) {
    console.error("Error in createRoleSpecificProfile:", error);
    throw error;
  }
}
