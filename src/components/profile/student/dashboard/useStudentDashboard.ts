
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchStudentLessons } from "@/services/lessonService";
import { Lesson } from "@/types/lesson";
import { useProfile } from "@/hooks/useProfile";

export const useStudentDashboard = () => {
  const { profile } = useProfile("student");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          const studentLessons = await fetchStudentLessons(userData.user.id);
          setLessons(studentLessons);
        }
      } catch (error) {
        console.error('Error loading lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  // Calculate statistics
  const upcomingLessons = lessons?.filter(lesson => 
    lesson.status === "upcoming" && new Date(lesson.date) >= new Date()
  ) || [];
  
  const completedLessons = lessons?.filter(lesson => 
    lesson.status === "completed"
  ) || [];

  // Check profile completeness
  const isProfileComplete = profile && 
    profile.first_name && 
    profile.last_name && 
    profile.city && 
    profile.bio &&
    profile.student_profiles?.educational_level &&
    profile.student_profiles?.subjects?.length;

  return {
    profile,
    lessons,
    loading,
    upcomingLessons,
    completedLessons,
    isProfileComplete
  };
};
