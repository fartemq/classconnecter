
import React, { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";
import { getUserRole } from "@/utils/authUtils";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Простая функция входа
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = "Ошибка входа";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Неверный email или пароль";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email не подтвержден";
        }
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "Произошла ошибка при входе" };
    }
  };

  // Простая функция выхода
  const logout = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      return !error;
    } catch (error) {
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Получение текущей сессии
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Получаем роль пользователя
            const role = await getUserRole(session.user.id);
            if (mounted) {
              setUserRole(role);
            }
          } else {
            setUserRole(null);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Слушатель изменений auth состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log("Auth state changed:", event);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && event === "SIGNED_IN") {
          // Получаем роль только при входе
          try {
            const role = await getUserRole(session.user.id);
            if (mounted) {
              setUserRole(role);
            }
          } catch (error) {
            console.error("Error getting role after sign in:", error);
            if (mounted) {
              setUserRole("student");
            }
          }
        } else if (!session) {
          setUserRole(null);
        }
      }
    );

    // Инициализируем
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
