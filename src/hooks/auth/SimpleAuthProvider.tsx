
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SimpleAuthState {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  isError: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthState | null>(null);

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error("useSimpleAuth must be used within SimpleAuthProvider");
  }
  return context;
};

interface SimpleAuthProviderProps {
  children: ReactNode;
}

// Кэш для роли пользователя
const ROLE_CACHE_KEY = 'user_role_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

const getCachedRole = (userId: string): string | null => {
  try {
    const cached = localStorage.getItem(`${ROLE_CACHE_KEY}_${userId}`);
    if (cached) {
      const { role, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return role;
      }
    }
  } catch (error) {
    // Игнорируем ошибки кэша
  }
  return null;
};

const setCachedRole = (userId: string, role: string): void => {
  try {
    localStorage.setItem(`${ROLE_CACHE_KEY}_${userId}`, JSON.stringify({
      role,
      timestamp: Date.now()
    }));
  } catch (error) {
    // Игнорируем ошибки кэша
  }
};

const fetchUserRoleWithValidation = async (userId: string): Promise<string | null> => {
  // Сначала проверяем кэш
  const cachedRole = getCachedRole(userId);
  if (cachedRole) {
    return cachedRole;
  }

  // Timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), 3000);
  });

  try {
    // Пробуем получить роль с timeout
    const rolePromise = supabase
      .from("profiles")
      .select("role, is_blocked")
      .eq("id", userId)
      .maybeSingle();

    const { data, error } = await Promise.race([rolePromise, timeoutPromise]);

    if (error || !data) {
      console.error("Profile not found or error:", error);
      return null; // Возвращаем null если профиль не найден
    }

    // Проверяем блокировку
    if (data.is_blocked) {
      console.error("User is blocked:", userId);
      return null;
    }

    const role = data.role;
    if (role) {
      setCachedRole(userId, role);
    }
    return role;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

export const SimpleAuthProvider: React.FC<SimpleAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return false;
      }

      // Проверяем существование профиля
      const role = await fetchUserRoleWithValidation(data.user.id);
      
      if (!role) {
        // Если профиль не найден или пользователь заблокирован, выходим
        await supabase.auth.signOut();
        return false;
      }

      setUser(data.user);
      setUserRole(role);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      // Очищаем состояние сразу, независимо от результата запроса
      setUser(null);
      setUserRole(null);
      
      // Очищаем кэш
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(ROLE_CACHE_KEY)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        // Игнорируем ошибки очистки кэша
      }

      // Пытаемся выйти через Supabase
      const { error } = await supabase.auth.signOut();
      
      // Даже если есть ошибка (например, сессия уже недействительна), 
      // возвращаем true, так как состояние уже очищено
      if (error) {
        console.warn("Logout warning (but state cleared):", error.message);
      }
      
      return true;
    } catch (error) {
      // Даже при исключении возвращаем true, так как состояние очищено
      console.warn("Logout exception (but state cleared):", error);
      return true;
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        const role = await fetchUserRoleWithValidation(currentUser.id);
        
        if (!role) {
          // Если профиль не найден, выходим из системы
          await supabase.auth.signOut();
          setUser(null);
          setUserRole(null);
          return;
        }
        
        setUser(currentUser);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error) {
      setIsError(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Timeout для всей инициализации - 5 секунд максимум
        timeoutId = setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
            setIsError(true);
          }
        }, 5000);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          // Проверяем существование профиля
          const role = await fetchUserRoleWithValidation(session.user.id);
          
          if (!role) {
            // Если профиль не найден, выходим из системы
            await supabase.auth.signOut();
            setUser(null);
            setUserRole(null);
          } else {
            setUser(session.user);
            setUserRole(role);
          }
        }
      } catch (error) {
        if (mounted) {
          setIsError(true);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          // Проверяем существование профиля
          const role = await fetchUserRoleWithValidation(session.user.id);
          
          if (!role) {
            // Если профиль не найден, выходим из системы
            await supabase.auth.signOut();
            setUser(null);
            setUserRole(null);
          } else {
            setUser(session.user);
            setUserRole(role);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<SimpleAuthState>(() => ({
    user,
    userRole,
    isLoading,
    isError,
    login,
    logout,
    refreshUserData,
  }), [user, userRole, isLoading, isError, login, logout, refreshUserData]);

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};
