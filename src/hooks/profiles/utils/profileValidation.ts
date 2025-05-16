
/**
 * Checks if a user's role matches the required role
 */
export function checkRoleMatch(
  profileData: any,
  requiredRole: string | undefined,
  navigate: Function,
  isMounted: boolean
): boolean {
  if (requiredRole && profileData && profileData.role !== requiredRole) {
    console.log(`User role (${profileData.role}) doesn't match required role (${requiredRole})`);
    if (isMounted) {
      // Import toast inline to avoid circular dependencies
      const { toast } = require("@/hooks/use-toast");
      toast({
        title: "Доступ запрещен",
        description: `Эта страница доступна только для ${requiredRole === "student" ? "студентов" : "репетиторов"}.`,
        variant: "destructive",
      });
      navigate("/");
    }
    return false;
  }
  return true;
}
