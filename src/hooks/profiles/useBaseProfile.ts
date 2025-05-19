
import { useProfileCommon } from "./useProfileCommon";

/**
 * Base profile hook that provides basic profile functionality
 */
export const useBaseProfile = (requiredRole?: string) => {
  return useProfileCommon(requiredRole);
};
