
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

  // Cache for user role to avoid repeated fetches
  const roleCache = new Map<string, string>();

  // Fetch user role from profiles table with caching
  const fetchUserRole = async (userId: string) => {
    try {
      console.log("🔍 Fetching role for user:", userId);
      
      // Check cache first
      if (roleCache.has(userId)) {
        console.log("✅ Role found in cache:", roleCache.get(userId));
        return roleCache.get(userId);
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("role, is_blocked")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      if (data?.is_blocked) {
        console.log("🚫 User is blocked, forcing logout");
        await supabase.auth.signOut();
        
        toast({
          title: "Аккаунт заблокирован",
          description: "Ваш аккаунт был заблокирован администратором.",
          variant: "destructive",
        });
        
        return null;
      }

      if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
        console.log("🛡️ Admin user detected");
        roleCache.set(userId, "admin");
        return "admin";
      }

      const role = data?.role || "student";
      console.log("✅ User role fetched:", role);
      
      // Cache the role
      roleCache.set(userId, role);
      return role;
    } catch (error) {
      console.error("Error in fetchUserRole:", error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log("🔐 Starting login process for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
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

      console.log("✅ Login successful");
      return { success: true };
    } catch (error) {
      console.error("Login exception:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Произошла ошибка при входе" 
      };
    }
  };

  // Logout function
  const logout = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        return false;
      }
      
      // Clear cache on logout
      roleCache.clear();
      return true;
    } catch (error) {
      console.error("Logout exception:", error);
      return false;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      roleCache.clear();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initTimeout: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...");
        
        // Set timeout for initialization to prevent hanging
        initTimeout = setTimeout(() => {
          if (mounted) {
            console.log("⏰ Auth initialization timeout, setting loading to false");
            setIsLoading(false);
          }
        }, 5000);
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log("✅ Initial session found:", session.user.email);
          
          const role = await fetchUserRole(session.user.id);
          
          if (role && mounted) {
            setSession(session);
            setUser(session.user);
            setUserRole(role);
            console.log("✅ Initial auth state set:", { userId: session.user.id, role });
          }
        } else {
          console.log("❌ No initial session found");
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
      } finally {
        if (mounted) {
          console.log("⏹️ Initial auth check complete, setting isLoading to false");
          setIsLoading(false);
          clearTimeout(initTimeout);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === "SIGNED_IN" && session?.user) {
          console.log("🔑 Processing sign in");
          const role = await fetchUserRole(session.user.id);
          
          if (role && mounted) {
            setSession(session);
            setUser(session.user);
            setUserRole(role);
            console.log("✅ User signed in:", { userId: session.user.id, role });
          }
        } else if (event === "SIGNED_OUT") {
          console.log("🚪 User signed out");
          setSession(null);
          setUser(null);
          setUserRole(null);
          roleCache.clear();
        }
      }
    );

    // Initialize auth
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
