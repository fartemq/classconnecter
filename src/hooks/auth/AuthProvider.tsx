
import React, { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, AuthProviderProps } from "./AuthContext";
import { toast } from "@/hooks/use-toast";
import { fetchUserRole } from "@/services/auth/userService";
import { loginUser } from "@/services/auth/loginService";

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Handle auth state change
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          console.log("Session found, user is logged in:", session.user.id);
          setUser(session.user);
          setSession(session);
          
          try {
            // Fetch user role
            const role = await fetchUserRole(session.user.id);
            console.log("User role fetched:", role);
            setUserRole(role);
          } catch (roleError) {
            console.error("Error fetching user role:", roleError);
            // Continue with session but without role
          }
        } else {
          console.log("No active session found");
          setUser(null);
          setUserRole(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // In case of error, clear auth state
        setUser(null);
        setUserRole(null);
        setSession(null);
      } finally {
        setIsLoading(false);
        setAuthChecked(true);
      }
    };

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session?.user) {
          console.log("User signed in:", session.user.id);
          setUser(session.user);
          setSession(session);
          
          // To prevent issues with multiple Supabase calls in the callback,
          // we'll wrap the role fetch in a setTimeout(0)
          setTimeout(async () => {
            try {
              // Fetch user role
              const role = await fetchUserRole(session.user.id);
              console.log("User role fetched after sign in:", role);
              setUserRole(role);
            } catch (roleError) {
              console.error("Error fetching user role after sign in:", roleError);
            }
          }, 0);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setUser(null);
          setUserRole(null);
          setSession(null);
        }
      }
    );

    // Initialize auth state when component mounts
    initializeAuth();

    // Cleanup auth listener when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function 
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await loginUser(email, password);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to login");
      }
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      
      return {
        success: false,
        error: error.message || "Failed to login"
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Ошибка выхода",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    
    // Reset auth state
    setUser(null);
    setUserRole(null);
    setSession(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isLoading,
        session,
        signOut,
        setUser,
        setUserRole,
        setIsLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
