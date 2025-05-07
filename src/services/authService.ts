
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
      
      // Обработка специфических ошибок
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

    // Create profile in profiles table with extended information
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      city: userData.city,
      phone: userData.phone,
      bio: userData.bio,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      
      if (profileError.message.includes("duplicate key")) {
        throw new Error("Пользователь с таким email уже существует");
      }
      throw new Error(profileError.message || "Ошибка при создании профиля");
    }
    
    console.log("Profile created successfully for user:", authData.user.id);

    // Если пользователь - репетитор, создаем запись в таблице tutor_profiles
    if (userData.role === "tutor") {
      const { error: tutorProfileError } = await supabase.from("tutor_profiles").insert({
        id: authData.user.id,
        education_institution: "",
        degree: "",
        graduation_year: new Date().getFullYear(),
      });

      if (tutorProfileError) {
        console.error("Error creating tutor profile:", tutorProfileError);
        // Не бросаем ошибку здесь, так как основной профиль уже создан
      } else {
        console.log("Tutor profile created successfully");
      }
    }

    return { user: authData.user, session: authData.session };
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
    // Исправленная функция выхода из системы
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      throw error;
    }
    
    // После успешного выхода перенаправляем на главную страницу
    window.location.href = "/";
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
      .single();

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
