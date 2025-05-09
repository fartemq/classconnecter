
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

  // Function to fetch user role
  const fetchUserRole = async (userId: string) => {
    try {
      // Try to get existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle(); 
      
      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }
      
      // If profile exists, return role
      if (data) {
        console.log("User role found:", data.role);
        return data.role;
      }
      
      // If no profile exists yet, create one with default role based on user metadata
      console.log("No profile found, creating one...");
      const defaultRole = user?.user_metadata?.role || 'student';
      console.log("Using default role from metadata:", defaultRole);
      
      const { error: insertError } = await supabase
        .from("profiles")
        .insert([
          { 
            id: userId, 
            role: defaultRole,
            first_name: user?.user_metadata?.first_name || '',
            last_name: user?.user_metadata?.last_name || '',
            created_at: new Date().toISOString()
          }
        ]);
      
      if (insertError) {
        console.error("Error creating profile:", insertError);
        return null;
      }
      
      // Also create role-specific profile
      try {
        if (defaultRole === 'tutor') {
          const { error: tutorProfileError } = await supabase.from("tutor_profiles").insert({
            id: userId,
            education_institution: "",
            degree: "",
            graduation_year: new Date().getFullYear(),
            experience: 0,
            is_published: false
          });
          
          if (tutorProfileError) {
            console.error("Error creating tutor profile:", tutorProfileError);
          }
        } else {
          const { error: studentProfileError } = await supabase.from("student_profiles").insert({
            id: userId,
            educational_level: null,
            subjects: [],
            budget: null
          });
          
          if (studentProfileError) {
            console.error("Error creating student profile:", studentProfileError);
          }
        }
      } catch (profileError) {
        console.error("Error creating role-specific profile:", profileError);
      }
      
      // Return the default role
      return defaultRole;
    } catch (err) {
      console.error("Error in fetchUserRole:", err);
      return null;
    }
  };

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
                const role = await fetchUserRole(currentSession.user.id);
                setUserRole(role);
                console.log("Set user role to:", role);
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
          const role = await fetchUserRole(existingSession.user.id);
          setUserRole(role);
          console.log("Initial user role set to:", role);
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
