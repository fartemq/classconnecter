
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  register: (email: string, password: string, userData?: any) => Promise<{ error?: any }>;
  logout: () => Promise<boolean>;
  updateUserRole: (role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting initial session:', error);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data?.role || 'student');
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Ошибка входа",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userData?: any) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: userData,
        },
      });

      if (error) {
        toast({
          title: "Ошибка регистрации",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось выйти из системы",
          variant: "destructive",
        });
        return false;
      }

      // Clear local state
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (role: string) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user role:', error);
        return;
      }

      setUserRole(role);
    } catch (error) {
      console.error('Error in updateUserRole:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userRole,
    session,
    isLoading,
    login,
    register,
    logout,
    updateUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
