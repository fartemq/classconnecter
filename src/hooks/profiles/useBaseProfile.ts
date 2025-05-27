
import { useState, useEffect } from "react";
import { Profile } from "./types";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfileData } from "./utils/fetchProfile";
import { createProfileManually } from "@/services/auth/authUtils";

/**
 * Base profile hook that provides basic profile functionality with RLS compliance
 */
export const useBaseProfile = (requiredRole?: string) => {
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
        
        // Try to fetch existing profile
        const profileData = await fetchProfileData(user.id);
        
        if (profileData) {
          console.log("Profile loaded successfully:", profileData);
          setProfile(profileData);
          setRetryCount(0); // Reset retry count on success
        } else {
          console.log("Profile not found for user:", user.id);
          
          // If profile doesn't exist and we haven't retried too many times
          if (retryCount < 3) {
            console.log("Attempting to create profile manually, retry:", retryCount + 1);
            
            // Try to create profile manually using user metadata
            const userData = {
              first_name: user.user_metadata?.first_name || '',
              last_name: user.user_metadata?.last_name || '',
              role: user.user_metadata?.role || userRole || 'student',
              city: user.user_metadata?.city || '',
              phone: user.user_metadata?.phone || '',
              bio: user.user_metadata?.bio || ''
            };
            
            const created = await createProfileManually(user.id, userData);
            
            if (created) {
              // Wait a moment and try to fetch again
              setTimeout(() => {
                setRetryCount(prev => prev + 1);
              }, 1000);
              return;
            }
          }
          
          // If we can't create the profile, set it to null but don't error
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        
        // Don't show error for RLS issues, as profile might just not exist yet
        if (err?.message?.includes('row-level security')) {
          console.log("RLS error detected, profile might not exist yet");
          setProfile(null);
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, userRole, requiredRole, authLoading, retryCount]);

  return {
    profile,
    setProfile,
    isLoading: authLoading || isLoading,
    error,
    userRole,
    user
  };
};
