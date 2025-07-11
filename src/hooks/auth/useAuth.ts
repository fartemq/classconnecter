
import { useSimpleAuth } from "./SimpleAuthProvider";

// Deprecated: use useSimpleAuth directly
export const useAuth = () => {
  console.warn('useAuth is deprecated, use useSimpleAuth directly');
  return useSimpleAuth();
};
