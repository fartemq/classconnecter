
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "./AuthContext";
import { toast } from "@/hooks/use-toast";
import { fetchUserRole } from "@/services/auth/userService";

export const useAuth = () => {
  const { user, setUser, isLoading, setIsLoading, userRole, setUserRole } = useAuthContext();
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          console.log("Session found, user is logged in:", session.user.id);
          setUser(session.user);
          
          try {
            // Fetch user role
            const role = await fetchUserRole(session.user.id);
            console.log("User role fetched:", role);
            setUserRole(role);
          } catch (roleError) {
            console.error("Error fetching user role:", roleError);
            // Continue with session but without role
          }
        } else {
          console.log("No active session found");
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // In case of error, clear auth state
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in:", session.user.id);
          setUser(session.user);
          
          try {
            // Fetch user role
            const role = await fetchUserRole(session.user.id);
            console.log("User role fetched after sign in:", role);
            setUserRole(role);
          } catch (roleError) {
            console.error("Error fetching user role after sign in:", roleError);
          }
        } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          console.log("User signed out or deleted");
          setUser(null);
          setUserRole(null);
        }
      }
    );

    // Initialize auth state when component mounts
    initializeAuth();

    // Cleanup auth listener when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      if (data?.user) {
        try {
          // Fetch user role after login
          const role = await fetchUserRole(data.user.id);
          setUserRole(role);
          
          // Set the user after role to ensure both are available
          setUser(data.user);
          
          // Give feedback to user
          toast({
            title: "Успешный вход",
            description: "Добро пожаловать!",
          });
          
          // Return success
          return { success: true };
        } catch (roleError) {
          console.error("Error fetching user role:", roleError);
          setUser(data.user); // Still set the user even if role fetch fails
          return { success: true };
        }
      }
    } catch (error: any) {
      console.error("Login process error:", error);
      
      let errorMessage = "Ошибка входа. Пожалуйста, попробуйте снова.";
      
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Неверный email или пароль";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email не подтвержден";
        }
      }
      
      toast({
        title: "Ошибка входа",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { 
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    userData: { first_name: string; last_name: string; role: string }
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            role: userData.role,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Регистрация успешна",
        description:
          "На ваш email отправлено письмо с подтверждением. Пожалуйста, подтвердите ваш email.",
      });
      
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Ошибка регистрации. Пожалуйста, попробуйте снова.";
      
      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "Этот email уже зарегистрирован";
        }
      }
      
      toast({
        title: "Ошибка регистрации",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserRole(null);
      
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из аккаунта",
      });
      
      navigate("/");
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    userRole,
    isAuthenticated: !!user,
    authChecked,
  };
};
