
import { useNavigate } from "react-router-dom";
import { Profile } from "../types";

/**
 * Checks if the profile has the required role
 */
export function checkRoleMatch(
  profile: Profile,
  requiredRole: string | undefined,
  navigate: ReturnType<typeof useNavigate>,
  isMounted: boolean = true
): boolean {
  if (!requiredRole) return true;
  
  if (profile.role !== requiredRole) {
    console.warn(`Profile role mismatch. Required: ${requiredRole}, Found: ${profile.role}`);
    
    if (isMounted) {
      // Redirect to the appropriate profile page
      const redirectPath = profile.role === "tutor" ? "/profile/tutor" : "/profile/student";
      setTimeout(() => {
        if (isMounted) {
          navigate(redirectPath);
        }
      }, 100);
    }
    
    return false;
  }
  
  return true;
}
