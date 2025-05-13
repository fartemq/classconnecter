
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { Profile } from "./profiles";
import { useToast } from "./use-toast";

export interface ProfileUpdateParams {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  city?: string;
  phone?: string;
  bio?: string;
  educational_level?: string;
  subjects?: string[];
  learning_goals?: string;
  preferred_format?: string[];
  grade?: string;
  school?: string;
  budget?: number;
}

export const useProfile = (role?: "student" | "tutor") => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Load profile
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    
    const loadProfile = async () => {
      setIsLoading(true);
      
      try {
        // Fetch basic profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        if (role && profileData.role !== role) {
          setProfile(null);
          return;
        }
        
        // If student profile, load student-specific data
        if (profileData.role === "student") {
          const { data: studentData, error: studentError } = await supabase
            .from("student_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          
          if (!studentError && studentData) {
            profileData.grade = studentData.grade;
            profileData.school = studentData.school;
            profileData.educational_level = studentData.educational_level;
            profileData.subjects = studentData.subjects;
            profileData.learning_goals = studentData.learning_goals;
            profileData.preferred_format = studentData.preferred_format;
            profileData.budget = studentData.budget;
          }
        }
        
        // If tutor profile, load tutor-specific data
        if (profileData.role === "tutor") {
          const { data: tutorData, error: tutorError } = await supabase
            .from("tutor_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();
          
          if (!tutorError && tutorData) {
            Object.assign(profileData, tutorData);
          }
        }
        
        setProfile(profileData as Profile);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Ошибка загрузки профиля",
          description: "Произошла ошибка при загрузке данных профиля",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user, role, toast]);
  
  // Update profile function
  const updateProfile = async (params: ProfileUpdateParams): Promise<boolean> => {
    if (!user?.id || !profile) {
      return false;
    }
    
    try {
      console.log("Updating profile with params:", params);
      
      // Split parameters between tables
      const profileParams: any = {};
      const studentProfileParams: any = {};
      
      // Basic profile fields
      ["first_name", "last_name", "avatar_url", "city", "phone", "bio"].forEach(field => {
        if (params[field as keyof ProfileUpdateParams] !== undefined) {
          profileParams[field] = params[field as keyof ProfileUpdateParams];
        }
      });
      
      // Student-specific fields
      ["educational_level", "subjects", "learning_goals", "preferred_format", "grade", "school", "budget"].forEach(field => {
        if (params[field as keyof ProfileUpdateParams] !== undefined) {
          studentProfileParams[field] = params[field as keyof ProfileUpdateParams];
        }
      });
      
      // Update base profile if there are changes
      if (Object.keys(profileParams).length > 0) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileParams)
          .eq("id", user.id);
          
        if (profileError) {
          throw profileError;
        }
      }
      
      // Update student profile if needed
      if (profile.role === "student" && Object.keys(studentProfileParams).length > 0) {
        // Check if student profile exists
        const { data: existingProfile } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();
          
        // If exists, update; otherwise insert
        if (existingProfile) {
          const { error: studentError } = await supabase
            .from("student_profiles")
            .update(studentProfileParams)
            .eq("id", user.id);
            
          if (studentError) throw studentError;
        } else {
          const { error: studentError } = await supabase
            .from("student_profiles")
            .insert({ ...studentProfileParams, id: user.id });
            
          if (studentError) throw studentError;
        }
      }
      
      // Update local state
      setProfile({
        ...profile,
        ...profileParams,
        ...studentProfileParams
      });
      
      toast({
        title: "Профиль обновлен",
        description: "Ваш профиль был успешно обновлен",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка обновления профиля",
        description: "Произошла ошибка при обновлении данных профиля",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    profile,
    isLoading,
    updateProfile
  };
};
