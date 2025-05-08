
/**
 * Helper function to safely access nested objects from Supabase responses
 * This helps with TypeScript errors when Supabase returns objects that look like arrays
 * @param obj The object or array from Supabase
 * @returns The properly typed object
 */
export const ensureObject = <T>(obj: T | T[]): T => {
  // If the object is an array with a single item (happens with Supabase sometimes)
  // return the first item, otherwise return the object as is
  if (Array.isArray(obj) && obj.length > 0) {
    return obj[0];
  }
  return obj as T;
};

/**
 * Helper function to safely format user names from profile data
 * @param user The user profile object
 * @returns Formatted name string
 */
export const formatUserName = (user: { first_name?: string; last_name?: string | null } | null | undefined): string => {
  if (!user) return "Пользователь";
  
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  
  return `${firstName} ${lastName}`.trim() || "Пользователь";
};
