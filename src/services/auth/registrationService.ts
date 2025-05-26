
import { supabase } from "@/integrations/supabase/client";
import { RegisterUserData, AuthResult } from "./types";

/**
 * Registers a new user and creates their profile with RLS compliance
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

    // Create user profiles with RLS compliance
    await createUserProfiles(authData.user.id, userData);

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

/**
 * Creates necessary user profiles after registration with RLS compliance
 */
async function createUserProfiles(userId: string, userData: RegisterUserData): Promise<void> {
  try {
    console.log("Creating profiles for user:", userId);
    
    // Create a profile in the profiles table - RLS will ensure proper access
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      city: userData.city || null,
      phone: userData.phone || null,
      bio: userData.bio || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      
      // Handle duplicate key errors
      if (profileError.message.includes("duplicate key")) {
        console.log("Profile already exists, updating instead");
        
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            city: userData.city || null,
            phone: userData.phone || null,
            bio: userData.bio || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);
          
        if (updateError && !updateError.message?.includes('row-level security')) {
          console.error("Error updating profile:", updateError);
        }
      } else if (!profileError.message?.includes('row-level security')) {
        console.error("Unknown profile creation error:", profileError);
      }
    } else {
      console.log("Profile created successfully");
    }
    
    // Create role-specific profiles with RLS compliance
    if (userData.role === "tutor") {
      await createTutorProfile(userId);
    }

    if (userData.role === "student") {
      await createStudentProfile(userId);
    }
  } catch (profileError) {
    console.error("Error in profile creation:", profileError);
    // We don't throw here because the user is already created
  }
}

/**
 * Creates a tutor profile if it doesn't exist with RLS compliance
 */
async function createTutorProfile(userId: string): Promise<void> {
  try {
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
        is_published: false,
        education_verified: false,
        updated_at: new Date().toISOString()
      });

      if (tutorProfileError) {
        console.error("Error creating tutor profile:", tutorProfileError);
        // Ignore RLS errors during creation
        if (!tutorProfileError.message?.includes('row-level security')) {
          throw tutorProfileError;
        }
      } else {
        console.log("Tutor profile created successfully");
      }
    } else {
      console.log("Tutor profile already exists");
    }
  } catch (error) {
    console.error("Error in createTutorProfile:", error);
  }
}

/**
 * Creates a student profile if it doesn't exist with RLS compliance
 */
async function createStudentProfile(userId: string): Promise<void> {
  try {
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
        learning_goals: null,
        preferred_format: [],
        school: null,
        grade: null,
        budget: 1000
      });

      if (studentProfileError) {
        console.error("Error creating student profile:", studentProfileError);
        // Ignore RLS errors during creation
        if (!studentProfileError.message?.includes('row-level security')) {
          throw studentProfileError;
        }
      } else {
        console.log("Student profile created successfully");
      }
    } else {
      console.log("Student profile already exists");
    }
  } catch (error) {
    console.error("Error in createStudentProfile:", error);
  }
}
