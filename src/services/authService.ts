
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type RegisterUserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "student" | "tutor";
  city?: string;
  phone?: string;
  bio?: string;
};

export const registerUser = async (userData: RegisterUserData) => {
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

    // Important: since after registration the user might not have an active session,
    // we'll try to create the profile regardless
    try {
      // Create a profile in the profiles table
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
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
            .eq("id", authData.user.id);
            
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
        // Check if a tutor profile already exists
        const { data: existingTutor } = await supabase
          .from("tutor_profiles")
          .select("id")
          .eq("id", authData.user.id)
          .maybeSingle();
        
        if (!existingTutor) {
          const { error: tutorProfileError } = await supabase.from("tutor_profiles").insert({
            id: authData.user.id,
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

      // If user is a student, create a student_profiles entry
      if (userData.role === "student") {
        // Check if a student profile already exists
        const { data: existingStudent } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("id", authData.user.id)
          .maybeSingle();
        
        if (!existingStudent) {
          const { error: studentProfileError } = await supabase.from("student_profiles").insert({
            id: authData.user.id,
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
    } catch (profileError) {
      console.error("Error in profile creation:", profileError);
      // We don't throw here because the user is already created
    }

    // Now try to sign in with password (if needed for development)
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

export const loginUser = async (email: string, password: string) => {
  try {
    console.log("Attempting login for:", email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Необходимо подтвердить email. Проверьте вашу почту.");
      } else if (error.message.includes("Invalid login credentials")) {
        throw new Error("Неверный email или пароль");
      }
      
      throw error;
    }

    console.log("Login successful for:", email);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session?.user || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const getUserRole = async (userId: string): Promise<string | null> => {
  try {
    console.log("Fetching role for user:", userId);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    console.log("User role data:", data);
    return data?.role || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
