
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { logoutUser } from "@/services/auth/logoutService";
import { loginWithEmailAndPassword } from "@/services/auth/loginService";
import { fetchUserRole } from "@/services/auth/userService";
import { toast } from "@/hooks/use-toast";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [session, setSession] = useState<any | null>(null);

  // Initialize by checking for an existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get session from supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        // If user exists in session, set the user
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          console.log("Session user found:", session.user.id);
          
          // Fetch user role
          try {
            const role = await fetchUserRole(session.user.id);
            if (role) {
              setUserRole(role);
              console.log("User role found:", role);
            }
          } catch (roleError) {
            console.error("Error fetching role during initialization:", roleError);
          }
        } else {
          // No session, clear user state
          setUser(null);
          setUserRole(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Error checking authentication session:", error);
        setUser(null);
        setUserRole(null);
        setSession(null);
      } finally {
        // Mark auth as initialized and not loading
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    if (!isInitialized) return;

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event);
        
        // Handle auth events
        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in (from AuthProvider):", session.user.id);
          setUser(session.user);
          setSession(session);
          
          // Fetch user role
          try {
            const role = await fetchUserRole(session.user.id);
            setUserRole(role);
            console.log("User role set after sign in:", role);
          } catch (roleError) {
            console.error("Error fetching role after sign in:", roleError);
          }
          
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setUser(null);
          setUserRole(null);
          setSession(null);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          console.log("Token refreshed for user:", session.user.id);
          setUser(session.user);
          setSession(session);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  // Provide a login function
  const login = async (email: string, password: string) => {
    console.log("Login called with email:", email);
    try {
      const response = await loginWithEmailAndPassword({ email, password });
      
      if (response.success && response.user) {
        console.log("Login successful, user role:", response.role);
        setUser(response.user);
        setUserRole(response.role || null);
        return response;
      }
      
      return response;
    } catch (error) {
      console.error("Login error in AuthProvider:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Произошла ошибка при входе" 
      };
    }
  };

  // Provide a logout function
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setUserRole(null);
      setSession(null);
      
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  // Provide a signOut function (alias to logout for backward compatibility)
  const signOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during sign out:", error);
      throw error;
    }
  };

  const contextValue = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    userRole, 
    setUserRole,
    session,
    signOut,
    login,
    logout
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
