
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TutorSubject {
  id: string;
  subject_id: string;
  tutor_id: string;
  hourly_rate: number;
  experience_years: number | null;
  description: string | null;
  is_active: boolean;
  subject_name?: string;
}

export const useTutorSubjects = (tutorId: string | undefined) => {
  const [subjects, setSubjects] = useState<TutorSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubjects, setHasSubjects] = useState(false);
  
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!tutorId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("tutor_subjects")
          .select(`
            *,
            subjects:subject_id (
              id, name
            )
          `)
          .eq("tutor_id", tutorId)
          .eq("is_active", true);
          
        if (error) {
          throw error;
        }
        
        // Format the subjects data
        const formattedSubjects = data.map((item) => ({
          ...item,
          subject_name: item.subjects?.name
        }));
        
        setSubjects(formattedSubjects);
        setHasSubjects(formattedSubjects.length > 0);
      } catch (error) {
        console.error("Error fetching tutor subjects:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubjects();
  }, [tutorId]);
  
  return {
    subjects,
    isLoading,
    hasSubjects
  };
};
