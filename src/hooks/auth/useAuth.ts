
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

/**
 * Hook to access authentication context
 * Provides user, session, loading state, signOut function, and user role
 */
export const useAuth = () => useContext(AuthContext);
