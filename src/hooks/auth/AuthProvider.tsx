
import React, { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import { useAuthValidation } from "./useAuthValidation";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Используем валидацию аутентификации
  useAuthValidation();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting initial session:", error);
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await fetchUserRole(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }

        if (event === 'SIGNED_OUT') {
          setUserRole(null);
        }

        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_blocked, first_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return;
      }

      // Проверяем статус пользователя
      if (data?.is_blocked || data?.first_name === '[УДАЛЕН]') {
        console.log("User is blocked or deleted, signing out");
        await supabase.auth.signOut();
        return;
      }

      setUserRole(data?.role || null);
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Login failed" };
    }
  };

  const logout = async () => {
    return signOut();
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        return { error: error.message };
      }
      
      setUser(null);
      setSession(null);
      setUserRole(null);
      return { success: true };
    } catch (error) {
      console.error("Error in signOut:", error);
      return { error: error instanceof Error ? error.message : "Sign out failed" };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    userRole,
    isLoading,
    setUser,
    setUserRole,
    setIsLoading,
    login,
    logout,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
