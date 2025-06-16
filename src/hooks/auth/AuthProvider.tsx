
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { fetchUserRole } from "@/services/auth/userService";
import { logger } from "@/utils/logger";

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

  const refreshUserData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      if (currentUser) {
        const role = await fetchUserRole(currentUser.id);
        setUserRole(role);
        logger.debug('User data refreshed', 'auth', { userId: currentUser.id, role });
      } else {
        setUserRole(null);
      }
    } catch (error) {
      logger.error('Failed to refresh user data', 'auth', error);
      setUser(null);
      setUserRole(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Login failed', 'auth', error);
        return false;
      }

      if (data.user) {
        setUser(data.user);
        const role = await fetchUserRole(data.user.id);
        setUserRole(role);
        logger.info('Login successful', 'auth', { userId: data.user.id, role });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Login error', 'auth', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Logout failed', 'auth', error);
        return false;
      }

      setUser(null);
      setUserRole(null);
      logger.info('Logout successful', 'auth');
      return true;
    } catch (error) {
      logger.error('Logout error', 'auth', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted && session?.user) {
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          setUserRole(role);
          logger.debug('Auth initialized', 'auth', { userId: session.user.id, role });
        }
      } catch (error) {
        logger.error('Auth initialization failed', 'auth', error);
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

        logger.debug('Auth state changed', 'auth', { event, hasSession: !!session });

        if (session?.user) {
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
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
  }, []);

  const value: AuthState = {
    user,
    userRole,
    isLoading,
    login,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
