
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTutorSubjectsCheck = (tutorId: string | undefined) => {
  const [hasSubjects, setHasSubjects] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkForSubjects = async () => {
      if (!tutorId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { count, error } = await supabase
          .from("tutor_subjects")
          .select("*", { count: 'exact', head: true })
          .eq("tutor_id", tutorId)
          .eq("is_active", true);
          
        if (error) {
          console.error("Error checking for tutor subjects:", error);
          setHasSubjects(false);
          return;
        }
        
        setHasSubjects(count !== null && count > 0);
        console.log(`Tutor ${tutorId} has ${count} subjects.`);
      } catch (error) {
        console.error("Error in checkForSubjects:", error);
        setHasSubjects(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForSubjects();
  }, [tutorId]);
  
  return {
    hasSubjects,
    isLoading
  };
};
