
import React, { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";

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

  // Единственный простой метод выхода
  const logout = async (): Promise<boolean> => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Даже при ошибке очищаем локально
      localStorage.clear();
      sessionStorage.clear();
      return true; // Считаем успешным
    }
  };

  const signOut = async (): Promise<void> => {
    await logout();
  };

  // Простое получение роли без сложной логики
  const getUserRole = (userId: string): string => {
    // Хардкод для админа
    if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
      return "admin";
    }
    
    // Проверяем localStorage как fallback
    const cachedRole = localStorage.getItem(`user_role_${userId}`);
    if (cachedRole) {
      return cachedRole;
    }
    
    return "student"; // по умолчанию
  };

  // Простая функция для установки роли с кешем
  const fetchAndSetRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      const role = data?.role || "student";
      localStorage.setItem(`user_role_${userId}`, role);
      setUserRole(role);
      return role;
    } catch (error) {
      console.error("Error fetching role:", error);
      const fallbackRole = getUserRole(userId);
      setUserRole(fallbackRole);
      return fallbackRole;
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    // Максимальный таймаут инициализации - 2 секунды
    initTimeout = setTimeout(() => {
      if (mounted) {
        console.log("Auth initialization timeout");
        setIsLoading(false);
      }
    }, 2000);

    const initializeAuth = async () => {
      try {
        // Получаем текущую сессию
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Сразу устанавливаем роль из кеша или по умолчанию
            const quickRole = getUserRole(session.user.id);
            setUserRole(quickRole);
            
            // Асинхронно обновляем роль из БД
            setTimeout(() => {
              if (mounted) {
                fetchAndSetRole(session.user.id);
              }
            }, 100);
          } else {
            setUserRole(null);
          }
          
          clearTimeout(initTimeout);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          clearTimeout(initTimeout);
          setIsLoading(false);
        }
      }
    };

    // Простой слушатель изменений состояния
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log("Auth state changed:", event);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const quickRole = getUserRole(session.user.id);
          setUserRole(quickRole);
          
          // Асинхронно обновляем роль
          setTimeout(() => {
            if (mounted) {
              fetchAndSetRole(session.user.id);
            }
          }, 100);
        } else {
          setUserRole(null);
          // Очищаем кеш ролей при выходе
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('user_role_')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        setIsLoading(false);
      }
    );

    // Инициализируем
    initializeAuth();

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
