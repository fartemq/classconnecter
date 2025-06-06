
import React, { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Check user status function (moved from useAuthValidation)
  const checkUserStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_blocked, first_name')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking user status:', error);
        return;
      }

      if (profile?.is_blocked) {
        // Если пользователь заблокирован, выходим из системы
        await supabase.auth.signOut();
        toast({
          title: "Доступ ограничен",
          description: "Ваш аккаунт заблокирован администратором.",
          variant: "destructive"
        });
        return;
      }

      if (profile?.first_name === '[УДАЛЕН]') {
        // Если профиль помечен как удаленный, выходим из системы
        await supabase.auth.signOut();
        toast({
          title: "Аккаунт удален",
          description: "Этот аккаунт был удален администратором.",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error in auth validation:', error);
    }
  };

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
        await checkUserStatus(userId);
        return;
      }

      setUserRole(data?.role || null);
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setUserRole(null);
    } catch (error) {
      console.error("Error in signOut:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      return true;
    } catch (error) {
      return false;
    }
  };

  const value = {
    user,
    session,
    userRole,
    isLoading,
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
