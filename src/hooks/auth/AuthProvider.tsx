
import React, { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getUserRole, clearRoleCache, checkUserBlocked } from "@/services/auth/roleService";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Функция для обработки нового пользователя
  const handleUserSession = async (session: Session | null) => {
    if (!session?.user) {
      console.log("❌ No session or user");
      setSession(null);
      setUser(null);
      setUserRole(null);
      return;
    }

    console.log("🔑 Processing user session:", session.user.email);
    
    try {
      // Проверяем заблокирован ли пользователь
      const isBlocked = await checkUserBlocked(session.user.id);
      if (isBlocked) {
        console.log("🚫 User is blocked, signing out");
        await supabase.auth.signOut();
        toast({
          title: "Аккаунт заблокирован",
          description: "Ваш аккаунт был заблокирован администратором.",
          variant: "destructive",
        });
        return;
      }

      // Получаем роль пользователя
      const role = await getUserRole(session.user.id);
      
      if (role) {
        setSession(session);
        setUser(session.user);
        setUserRole(role);
        console.log("✅ User authenticated successfully:", { 
          userId: session.user.id, 
          email: session.user.email,
          role 
        });
      } else {
        console.error("❌ Could not get user role");
        // Все равно устанавливаем пользователя с ролью по умолчанию
        setSession(session);
        setUser(session.user);
        setUserRole("student");
      }
    } catch (error) {
      console.error("❌ Error processing user session:", error);
      // В случае ошибки все равно авторизуем с ролью по умолчанию
      setSession(session);
      setUser(session.user);
      setUserRole("student");
    }
  };

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Starting login process for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Login error:", error);
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

      console.log("✅ Login successful, auth state will be handled by listener");
      return { success: true };
    } catch (error) {
      console.error("❌ Login exception:", error);
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
      if (error) {
        console.error("❌ Logout error:", error);
        return false;
      }
      
      clearRoleCache();
      return true;
    } catch (error) {
      console.error("❌ Logout exception:", error);
      return false;
    }
  };

  // Функция выхода (альтернативная)
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      clearRoleCache();
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...");
        
        // Получаем текущую сессию
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
          return;
        }

        if (mounted) {
          await handleUserSession(session);
        }
      } catch (error) {
        console.error("❌ Error in initializeAuth:", error);
      } finally {
        if (mounted) {
          console.log("⏹️ Auth initialization complete");
          setIsLoading(false);
        }
      }
    };

    // Устанавливаем слушатель изменений auth состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event);
        
        if (!mounted) return;

        if (event === "SIGNED_IN" && session) {
          setIsLoading(true);
          await handleUserSession(session);
          setIsLoading(false);
        } else if (event === "SIGNED_OUT") {
          console.log("🚪 User signed out");
          setSession(null);
          setUser(null);
          setUserRole(null);
          clearRoleCache();
          setIsLoading(false);
        }
      }
    );

    // Инициализируем auth
    initializeAuth();

    // Таймаут безопасности - если инициализация зависла
    initTimeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.log("⏰ Auth initialization timeout, stopping loading");
        setIsLoading(false);
      }
    }, 8000); // 8 секунд максимум

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
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
