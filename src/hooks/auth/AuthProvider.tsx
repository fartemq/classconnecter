
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetRole = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const role = await fetchUserRole(userId);
      setUserRole(role);
      return role;
    } catch (error) {
      console.error('Failed to fetch user role:', error);
      setUserRole(null);
      return null;
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        await fetchAndSetRole(currentUser.id);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setUser(null);
      setUserRole(null);
    }
  }, [fetchAndSetRole]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return false;
      }

      if (data.user) {
        setUser(data.user);
        await fetchAndSetRole(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }, [fetchAndSetRole]);

  const logout = useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return false;
      }
      
      setUser(null);
      setUserRole(null);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          setUser(session.user);
          await fetchAndSetRole(session.user.id);
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
          await fetchAndSetRole(session.user.id);
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
  }, [fetchAndSetRole]);

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
