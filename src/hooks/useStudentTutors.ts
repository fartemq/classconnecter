
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Tutor {
  id: string;
  name: string;
}

export const useStudentTutors = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    const fetchStudentTutors = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) return;
        
        const { data, error } = await supabase
          .from('student_requests')
          .select(`
            tutor_id,
            tutor:profiles!tutor_id(
              id,
              first_name,
              last_name
            )
          `)
          .eq('student_id', userData.user.id)
          .eq('status', 'accepted');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const formattedTutors = data.map(item => ({
            id: item.tutor_id,
            name: `${item.tutor.first_name} ${item.tutor.last_name || ''}`
          }));
          
          setTutors(formattedTutors);
        }
      } catch (error) {
        console.error('Error fetching tutors:', error);
      }
    };
    
    fetchStudentTutors();
  }, []);

  return { tutors };
};
