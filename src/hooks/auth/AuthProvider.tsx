
import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRole } from "@/services/auth/userService";

interface AuthState {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Cache for user roles to avoid repeated database calls
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCachedRole = useCallback((userId: string): string | null => {
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.role;
    }
    return null;
  }, []);

  const setCachedRole = useCallback((userId: string, role: string) => {
    roleCache.set(userId, { role, timestamp: Date.now() });
  }, []);

  const fetchAndCacheRole = useCallback(async (userId: string): Promise<string | null> => {
    // Check cache first
    const cachedRole = getCachedRole(userId);
    if (cachedRole) {
      return cachedRole;
    }

    try {
      const role = await fetchUserRole(userId);
      if (role) {
        setCachedRole(userId, role);
      }
      return role;
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      return null;
    }
  }, [getCachedRole, setCachedRole]);

  const refreshUserData = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        const role = await fetchAndCacheRole(currentUser.id);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUser(null);
      setUserRole(null);
    }
  }, [fetchAndCacheRole]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return false;
      }

      if (data.user) {
        setUser(data.user);
        const role = await fetchAndCacheRole(data.user.id);
        setUserRole(role);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchAndCacheRole]);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return false;
      }

      // Clear cache on logout
      if (user?.id) {
        roleCache.delete(user.id);
      }
      
      setUser(null);
      setUserRole(null);
      return true;
    } catch (error) {
      return false;
    }
  }, [user?.id]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          setUser(session.user);
          const role = await fetchAndCacheRole(session.user.id);
          setUserRole(role);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const role = await fetchAndCacheRole(session.user.id);
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAndCacheRole]);

  const value = useMemo<AuthState>(() => ({
    user,
    userRole,
    isLoading,
    login,
    logout,
    refreshUserData,
  }), [user, userRole, isLoading, login, logout, refreshUserData]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
