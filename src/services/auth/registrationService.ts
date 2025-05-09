
import { supabase } from "@/integrations/supabase/client";
import { RegisterUserData, AuthResult } from "./types";

/**
 * Registers a new user and creates their profile
 */
export const registerUser = async (userData: RegisterUserData): Promise<AuthResult> => {
  try {
    console.log("Starting registration process for:", userData.email);
    console.log("Registration data:", userData);
    
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

    // Create user profiles
    await createUserProfiles(authData.user.id, userData);

    // Try to sign in with password (if needed for development)
    try {
      // Check if we already have a session
      if (!authData.session) {
        console.log("No session found, email confirmation is required");
        // Return the user but no session
        return { user: authData.user, session: null };
      }
      
      console.log("Session exists, no need to sign in again");
      // We already have a session from signUp
      return { user: authData.user, session: authData.session };
    } catch (signInError) {
      console.error("Error signing in after registration:", signInError);
      // Return just the user without session, indicating email confirmation is needed
      return { user: authData.user, session: null };
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

/**
 * Creates necessary user profiles after registration
 */
async function createUserProfiles(userId: string, userData: RegisterUserData): Promise<void> {
  try {
    // Create a profile in the profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      city: userData.city || null,
      phone: userData.phone || null,
      bio: userData.bio || null,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      
      if (profileError.message.includes("duplicate key")) {
        console.log("Profile already exists, updating instead");
        
        // Try to update the profile instead
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            city: userData.city || null,
            phone: userData.phone || null,
            bio: userData.bio || null,
          })
          .eq("id", userId);
          
        if (updateError) {
          console.error("Error updating profile:", updateError);
        }
      } else {
        console.error("Unknown profile creation error:", profileError);
      }
    } else {
      console.log("Profile created successfully");
    }
    
    // If user is a tutor, create a tutor_profiles entry
    if (userData.role === "tutor") {
      await createTutorProfile(userId);
    }

    // If user is a student, create a student_profiles entry
    if (userData.role === "student") {
      await createStudentProfile(userId);
    }
  } catch (profileError) {
    console.error("Error in profile creation:", profileError);
    // We don't throw here because the user is already created
  }
}

/**
 * Creates a tutor profile if it doesn't exist
 */
async function createTutorProfile(userId: string): Promise<void> {
  // Check if a tutor profile already exists
  const { data: existingTutor } = await supabase
    .from("tutor_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  
  if (!existingTutor) {
    const { error: tutorProfileError } = await supabase.from("tutor_profiles").insert({
      id: userId,
      education_institution: "",
      degree: "",
      graduation_year: new Date().getFullYear(),
      experience: 0,
      is_published: false
    });

    if (tutorProfileError) {
      console.error("Error creating tutor profile:", tutorProfileError);
    } else {
      console.log("Tutor profile created successfully");
    }
  } else {
    console.log("Tutor profile already exists");
  }
}

/**
 * Creates a student profile if it doesn't exist
 */
async function createStudentProfile(userId: string): Promise<void> {
  // Check if a student profile already exists
  const { data: existingStudent } = await supabase
    .from("student_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  
  if (!existingStudent) {
    const { error: studentProfileError } = await supabase.from("student_profiles").insert({
      id: userId,
      educational_level: null,
      subjects: [],
      budget: null
    });

    if (studentProfileError) {
      console.error("Error creating student profile:", studentProfileError);
    } else {
      console.log("Student profile created successfully");
    }
  } else {
    console.log("Student profile already exists");
  }
}
