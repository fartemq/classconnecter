
import React, { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";

// Define the context type
export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  userRole: string | null;
};

// Create the context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  userRole: null,
});
