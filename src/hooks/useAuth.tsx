
import React, { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  userRole: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First set up auth listener to avoid race conditions
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log("Auth state change event:", event);
            
            // Set session and user immediately from the event
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            // If user exists, get their role in a separate process to avoid deadlocks
            if (currentSession?.user) {
              setTimeout(async () => {
                try {
                  const { data, error } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", currentSession.user.id)
                    .single();

                  if (error) {
                    console.error("Error fetching user role:", error);
                  } else if (data) {
                    console.log("Role from auth state change:", data.role);
                    setUserRole(data.role);
                  }
                } catch (err) {
                  console.error("Error in role fetch:", err);
                }
              }, 0);
            } else {
              setUserRole(null);
            }
          }
        );

        // Then check for existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        // If there's an existing session, get the user role
        if (existingSession?.user) {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", existingSession.user.id)
              .single();

            if (error) {
              console.error("Error fetching initial user role:", error);
            } else if (data) {
              console.log("Initial role:", data.role);
              setUserRole(data.role);
            }
          } catch (err) {
            console.error("Error in initial role fetch:", err);
          }
        }

        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при выходе",
          variant: "destructive",
        });
        return;
      }
      
      // Clear state after successful logout
      setUser(null);
      setSession(null);
      setUserRole(null);
      
      toast({
        title: "Выход выполнен успешно",
        description: "Вы вышли из своей учетной записи",
      });
      
      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при выходе",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signOut,
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
