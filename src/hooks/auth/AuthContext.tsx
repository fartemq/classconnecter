
import React, { createContext, Dispatch, SetStateAction } from "react";
import { User } from "@supabase/supabase-js";

// Define the context type
export type AuthContextType = {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  userRole: string | null;
  setUserRole: Dispatch<SetStateAction<string | null>>;
  session?: any | null;
  signOut?: () => Promise<void>;
};

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
  userRole: null,
  setUserRole: () => {},
  session: null,
  signOut: async () => {},
});

export const useAuthContext = () => React.useContext(AuthContext);
