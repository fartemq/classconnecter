
import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setUserRole: (role: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ success?: boolean; error?: string } | undefined>;
  logout: () => Promise<{ success?: boolean; error?: string }>;
  signOut: () => Promise<{ success?: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
