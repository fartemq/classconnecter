
import React, { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthContextType } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Улучшенная функция входа с retry механизмом
  const login = async (email: string, password: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Retry для сетевых ошибок
        if (retryCount < 2 && (error.message.includes('network') || error.message.includes('timeout'))) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return login(email, password, retryCount + 1);
        }

        let errorMessage = "Ошибка входа";
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Неверный email или пароль";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email не подтвержден. Проверьте почту и подтвердите регистрацию";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Слишком много попыток входа. Попробуйте через несколько минут";
        }
        
        return { success: false, error: errorMessage };
      }

      if (!data?.user) {
        return { success: false, error: "Не удалось получить данные пользователя" };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected login error:", error);
      return { success: false, error: "Произошла неожиданная ошибка при входе" };
    }
  };

  // Улучшенная функция выхода
  const logout = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
      }
      
      // Очищаем состояние независимо от ошибки
      setUser(null);
      setUserRole(null);
      setSession(null);
      
      // Очищаем кеш ролей
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_role_')) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error("Unexpected logout error:", error);
      // Все равно очищаем состояние
      setUser(null);
      setUserRole(null);
      setSession(null);
      return true;
    }
  };

  const signOut = async (): Promise<void> => {
    await logout();
  };

  // Оптимизированная функция получения роли
  const getUserRole = (userId: string): string => {
    // Хардкод для админа
    if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
      return "admin";
    }
    
    // Проверяем кеш
    const cacheKey = `user_role_${userId}`;
    const cachedRole = localStorage.getItem(cacheKey);
    if (cachedRole && ['admin', 'tutor', 'student'].includes(cachedRole)) {
      return cachedRole;
    }
    
    return "student"; // безопасное значение по умолчанию
  };

  // Улучшенная функция для получения и кеширования роли
  const fetchAndSetRole = async (userId: string, retryCount = 0) => {
    try {
      // Сначала пробуем RPC функцию
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_current_user_role');
      
      if (!rpcError && rpcData && ['admin', 'tutor', 'student'].includes(rpcData)) {
        const role = rpcData;
        localStorage.setItem(`user_role_${userId}`, role);
        setUserRole(role);
        return role;
      }
      
      // Fallback к прямому запросу
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
        
      if (!profileError && profile?.role && ['admin', 'tutor', 'student'].includes(profile.role)) {
        const role = profile.role;
        localStorage.setItem(`user_role_${userId}`, role);
        setUserRole(role);
        return role;
      }

      // Retry для сетевых ошибок
      if (retryCount < 2 && (profileError?.message?.includes('network') || rpcError?.message?.includes('network'))) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchAndSetRole(userId, retryCount + 1);
      }
      
      // Используем роль из кеша или по умолчанию
      const fallbackRole = getUserRole(userId);
      setUserRole(fallbackRole);
      return fallbackRole;
    } catch (error) {
      console.error("Error in fetchAndSetRole:", error);
      const fallbackRole = getUserRole(userId);
      setUserRole(fallbackRole);
      return fallbackRole;
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    // Таймаут инициализации - увеличен до 3 секунд
    initTimeout = setTimeout(() => {
      if (mounted) {
        console.log("Auth initialization timeout - setting loading to false");
        setIsLoading(false);
      }
    }, 3000);

    const initializeAuth = async () => {
      try {
        // Получаем текущую сессию
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Быстро устанавливаем роль из кеша
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

    // Слушатель изменений состояния аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log("Auth state changed:", event);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Быстро устанавливаем роль из кеша
          const quickRole = getUserRole(session.user.id);
          setUserRole(quickRole);
          
          // Асинхронно обновляем роль через небольшую задержку
          setTimeout(() => {
            if (mounted) {
              fetchAndSetRole(session.user.id);
            }
          }, 200);
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

    // Инициализируем аутентификацию
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
