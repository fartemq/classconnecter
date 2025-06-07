
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

  // Simple in-memory cache for roles
  const roleCache = new Map<string, string>();

  // Fetch user role with improved error handling
  const fetchUserRole = async (userId: string): Promise<string | null> => {
    try {
      console.log("🔍 Fetching role for user:", userId);
      
      // Check cache first
      if (roleCache.has(userId)) {
        const cachedRole = roleCache.get(userId)!;
        console.log("✅ Role found in cache:", cachedRole);
        return cachedRole;
      }
      
      // Special case for admin user - set immediately
      if (userId === "861128e6-be26-48ee-b576-e7accded9f70") {
        console.log("🛡️ Admin user detected");
        roleCache.set(userId, "admin");
        return "admin";
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role, is_blocked")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Error fetching user role:", error);
        // Return default role instead of null to prevent blocking
        const defaultRole = "student";
        roleCache.set(userId, defaultRole);
        return defaultRole;
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

      const role = data?.role || "student";
      console.log("✅ User role fetched:", role);
      
      // Cache the role
      roleCache.set(userId, role);
      return role;
    } catch (error) {
      console.error("❌ Exception in fetchUserRole:", error);
      // Return default role to prevent blocking
      const defaultRole = "student";
      roleCache.set(userId, defaultRole);
      return defaultRole;
    }
  };

  // Improved login function
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

      console.log("✅ Login successful, auth state will be handled by onAuthStateChange");
      return { success: true };
    } catch (error) {
      console.error("❌ Login exception:", error);
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
        console.error("❌ Logout error:", error);
        return false;
      }
      
      // Clear cache on logout
      roleCache.clear();
      return true;
    } catch (error) {
      console.error("❌ Logout exception:", error);
      return false;
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      roleCache.clear();
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let initializationComplete = false;

    const initializeAuth = async () => {
      try {
        console.log("🔄 Initializing auth...");
        
        // Get initial session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Error getting session:", error);
          if (mounted) {
            setIsLoading(false);
            initializationComplete = true;
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
        console.error("❌ Error in initializeAuth:", error);
      } finally {
        if (mounted) {
          console.log("⏹️ Initial auth check complete");
          setIsLoading(false);
          initializationComplete = true;
        }
      }
    };

    // Set up auth state listener BEFORE getting initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", event, session?.user?.email);
        
        if (!mounted) return;
        
        if (event === "SIGNED_IN" && session?.user) {
          console.log("🔑 Processing sign in");
          setIsLoading(true);
          
          const role = await fetchUserRole(session.user.id);
          
          if (role && mounted) {
            setSession(session);
            setUser(session.user);
            setUserRole(role);
            console.log("✅ User signed in:", { userId: session.user.id, role });
          }
          
          if (mounted) {
            setIsLoading(false);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("🚪 User signed out");
          setSession(null);
          setUser(null);
          setUserRole(null);
          setIsLoading(false);
          roleCache.clear();
        }
      }
    );

    // Initialize auth
    initializeAuth();

    // Safety timeout - if initialization takes too long, stop loading
    const safetyTimeout = setTimeout(() => {
      if (mounted && !initializationComplete) {
        console.log("⏰ Safety timeout triggered, stopping loading");
        setIsLoading(false);
      }
    }, 10000); // 10 seconds maximum

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
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
