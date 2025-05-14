
import React, { createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<boolean>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
