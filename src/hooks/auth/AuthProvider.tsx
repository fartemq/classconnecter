
import React, { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user role from profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, is_blocked")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      // Check if user is blocked
      if (data?.is_blocked) {
        console.log("🚫 User is blocked, forcing logout");
        await supabase.auth.signOut();
        
        toast({
          title: "Аккаунт заблокирован",
          description: "Ваш аккаунт был заблокирован администратором.",
          variant: "destructive",
        });
        
        return null;
      }

      // Set default role for admin user
      if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
        return "admin";
      }

      return data?.role || "student";
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        let errorMessage = "Ошибка входа. Пожалуйста, попробуйте снова.";
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Неверный email или пароль";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email не подтвержден";
        }
        
        return { 
          success: false, 
          error: errorMessage
        };
      }

      if (data.user) {
        // Fetch and set user role
        const role = await fetchUserRole(data.user.id);
        
        if (role === null) {
          // User is blocked or there was an error
          return { 
            success: false, 
            error: "Не удалось войти в систему" 
          };
        }
        
        setUserRole(role);
        setUser(data.user);
        setSession(data.session);
        
        console.log("✅ Login successful:", { userId: data.user.id, role });
        
        return { success: true };
      }

      return { success: false, error: "Не удалось войти в систему" };
    } catch (error) {
      console.error("Login exception:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Произошла ошибка при входе" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        return false;
      }
      
      // Clear state
      setUser(null);
      setUserRole(null);
      setSession(null);
      
      return true;
    } catch (error) {
      console.error("Logout exception:", error);
      return false;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setSession(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        if (session?.user && mounted) {
          console.log("Initial session found:", session.user.email);
          
          const role = await fetchUserRole(session.user.id);
          
          if (role && mounted) {
            setSession(session);
            setUser(session.user);
            setUserRole(role);
            console.log("✅ Initial auth state set:", { userId: session.user.id, role });
          }
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === "SIGNED_IN" && session?.user) {
          const role = await fetchUserRole(session.user.id);
          
          if (role && mounted) {
            setSession(session);
            setUser(session.user);
            setUserRole(role);
            console.log("✅ User signed in:", { userId: session.user.id, role });
          }
        } else if (event === "SIGNED_OUT") {
          console.log("🚪 User signed out");
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Get initial session
    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userRole,
    isLoading,
    session,
    signOut,
    setUser,
    setUserRole,
    setIsLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
