
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

  // Check if user is blocked
  const checkUserBlocked = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", userId)
        .single();
        
      if (error) {
        console.error("Error checking user blocked status:", error);
        return false;
      }
      
      return data?.is_blocked || false;
    } catch (error) {
      console.error("Error in checkUserBlocked:", error);
      return false;
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
      return true;
    } catch (error) {
      console.error("Logout exception:", error);
      return false;
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
        return { 
          success: false, 
          error: error.message === "Invalid login credentials" 
            ? "Неверные данные для входа" 
            : error.message 
        };
      }

      if (data.user) {
        // Check if user is blocked before allowing login
        const isBlocked = await checkUserBlocked(data.user.id);
        
        if (isBlocked) {
          // Force logout if user is blocked
          await supabase.auth.signOut();
          
          toast({
            title: "Аккаунт заблокирован",
            description: "Ваш аккаунт был заблокирован администратором. Для получения дополнительной информации обратитесь в службу поддержки.",
            variant: "destructive",
          });
          
          return { 
            success: false, 
            error: "Ваш аккаунт заблокирован администратором" 
          };
        }

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

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

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
        toast({
          title: "Аккаунт заблокирован",
          description: "Ваш аккаунт был заблокирован администратором.",
          variant: "destructive",
        });
        
        // Force logout
        await supabase.auth.signOut();
        return null;
      }

      return data?.role || "student";
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role when user logs in
          setTimeout(async () => {
            const role = await fetchUserRole(session.user.id);
            setUserRole(role);
            setIsLoading(false);
          }, 0);
        } else {
          setUserRole(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(role => {
          setUserRole(role);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
