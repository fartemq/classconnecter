
import { useState, useEffect } from "react";
import { Profile } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfileData } from "./utils/fetchProfile";

/**
 * Base profile hook that provides basic profile functionality
 */
export const useBaseProfile = (requiredRole?: string) => {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) {
        return; // Wait for auth to finish loading
      }

      if (!user) {
        setProfile(null);
        setIsLoading(false);
        setError("User not authenticated");
        return;
      }

      // Check if user has the required role (only if role exists)
      if (requiredRole && userRole && userRole !== requiredRole) {
        setProfile(null);
        setIsLoading(false);
        setError(`User does not have required role: ${requiredRole}`);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Loading profile for user:", user.id);
        const profileData = await fetchProfileData(user.id);
        
        if (profileData) {
          console.log("Profile loaded successfully:", profileData);
          setProfile(profileData);
        } else {
          // Profile not found - this is normal for new users
          console.log("Profile not found for user:", user.id);
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, userRole, requiredRole, authLoading]);

  return {
    profile,
    setProfile,
    isLoading: authLoading || isLoading,
    error,
    userRole,
    user
  };
};
