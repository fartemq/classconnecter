
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Hook to access authentication context
 * Provides user, session, loading state, signOut function, and user role
 */
export const useAuth = () => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    console.error("useAuth must be used within an AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return authContext;
};
