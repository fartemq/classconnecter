
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

  // Простая функция получения роли с таймаутом
  const getUserRole = async (userId: string): Promise<string> => {
    try {
      // Специальный случай для админа
      if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
        return "admin";
      }

      const { data: role, error } = await Promise.race([
        supabase.rpc('get_current_user_role'),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 3000)
        )
      ]);

      if (error) {
        console.warn("Could not get role, using default:", error);
        return "student";
      }

      return role || "student";
    } catch (error) {
      console.warn("Error getting role, using default:", error);
      return "student";
    }
  };

  // Проверка блокировки пользователя
  const checkUserBlocked = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("id", userId)
        .single();

      return data?.is_blocked || false;
    } catch (error) {
      return false;
    }
  };

  // Обработка сессии пользователя
  const handleUserSession = async (session: Session | null) => {
    if (!session?.user) {
      setSession(null);
      setUser(null);
      setUserRole(null);
      return;
    }

    try {
      // Проверяем блокировку
      const isBlocked = await checkUserBlocked(session.user.id);
      if (isBlocked) {
        await supabase.auth.signOut();
        toast({
          title: "Аккаунт заблокирован",
          description: "Ваш аккаунт был заблокирован администратором.",
          variant: "destructive",
        });
        return;
      }

      // Получаем роль
      const role = await getUserRole(session.user.id);
      
      setSession(session);
      setUser(session.user);
      setUserRole(role);
    } catch (error) {
      console.error("Error processing user session:", error);
      // В случае ошибки все равно авторизуем с ролью по умолчанию
      setSession(session);
      setUser(session.user);
      setUserRole("student");
    }
  };

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Произошла ошибка при входе" 
      };
    }
  };

  // Функция выхода
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

    const initializeAuth = async () => {
      try {
        // Получаем текущую сессию
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          await handleUserSession(session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Слушатель изменений auth состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" && session) {
          await handleUserSession(session);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      }
    );

    // Инициализируем auth
    initializeAuth();

    // Таймаут безопасности
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
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
