
import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize by checking for an existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get session from supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        // If user exists in session, set the user
        if (session?.user) {
          setUser(session.user);
          console.log("Session user found:", session.user.id);
          
          // Get user metadata or profile to determine role
          // This happens later through the useAuth hook
        } else {
          // No session, clear user state
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error checking authentication session:", error);
        setUser(null);
        setUserRole(null);
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
      (event, session) => {
        console.log("Auth state change:", event);
        
        // Handle auth events
        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in (from AuthProvider):", session.user.id);
          setUser(session.user);
          // Role is fetched in useAuth hook
        } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          console.log("User signed out or deleted");
          setUser(null);
          setUserRole(null);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          console.log("Token refreshed for user:", session.user.id);
          setUser(session.user);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized]);

  const contextValue = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    userRole, 
    setUserRole
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
