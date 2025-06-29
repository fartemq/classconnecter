
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { loginUserReliable } from "@/services/auth/reliableLoginService";

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

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, is_blocked")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) {
      console.error("Profile not found or error:", error);
      return null;
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
      const result = await loginUserReliable({ email, password });
      
      if (result.success && result.user && result.role) {
        setUser(result.user);
        setUserRole(result.role);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      // Очищаем состояние сразу
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

      // Выходим через Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn("Logout warning:", error.message);
      }
      
      return true;
    } catch (error) {
      console.warn("Logout exception:", error);
      return true;
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // Проверяем подтверждение email
        if (!currentUser.email_confirmed_at) {
          console.log("User email not confirmed, signing out");
          await supabase.auth.signOut();
          setUser(null);
          setUserRole(null);
          return;
        }
        
        const role = await fetchUserRoleWithValidation(currentUser.id);
        
        if (!role) {
          // Если профиль не найден или заблокирован, выходим
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
      console.error("Error refreshing user data:", error);
      setIsError(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        timeoutId = setTimeout(() => {
          if (mounted) {
            setIsLoading(false);
            setIsError(true);
          }
        }, 5000);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          // Проверяем подтверждение email
          if (!session.user.email_confirmed_at) {
            console.log("User email not confirmed during init");
            await supabase.auth.signOut();
            setUser(null);
            setUserRole(null);
          } else {
            const role = await fetchUserRoleWithValidation(session.user.id);
            
            if (!role) {
              // Если профиль не найден, выходим
              await supabase.auth.signOut();
              setUser(null);
              setUserRole(null);
            } else {
              setUser(session.user);
              setUserRole(role);
            }
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Auth initialization error:", error);
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

        console.log("Auth state changed:", event, !!session);

        if (session?.user) {
          // Проверяем подтверждение email
          if (!session.user.email_confirmed_at) {
            console.log("User email not confirmed in state change");
            setUser(null);
            setUserRole(null);
            return;
          }
          
          const role = await fetchUserRoleWithValidation(session.user.id);
          
          if (!role) {
            // Если профиль не найден, очищаем состояние
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
