
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ensureSingleObject } from "@/utils/supabaseUtils";
import { StudentTutorRelationship } from "./types";

/**
 * Get all tutors that a student has relationships with
 */
export const getStudentTutorRelationships = async (studentId: string): Promise<StudentTutorRelationship[]> => {
  try {
    const { data, error } = await supabase
      .from('student_tutor_relationships')
      .select(`
        id, 
        student_id, 
        tutor_id, 
        status, 
        created_at, 
        updated_at,
        start_date,
        end_date,
        tutor:tutor_id (
          first_name,
          last_name,
          avatar_url,
          city
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching student-tutor relationships:', error);
      return [];
    }

    // Format the response with proper typing
    const relationships = data.map(item => {
      // Ensure tutor is handled correctly - it should be an object not an array
      const formattedTutor = item.tutor ? ensureSingleObject(item.tutor) : undefined;
      
      return {
        ...item,
        tutor: formattedTutor
      };
    });

    return relationships as StudentTutorRelationship[];

  } catch (error) {
    console.error('Exception in getStudentTutorRelationships:', error);
    return [];
  }
};

/**
 * Send a request to a tutor
 */
export const requestTutor = async (studentId: string, tutorId: string): Promise<boolean> => {
  try {
    // Check if relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('student_tutor_relationships')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing relationship:', checkError);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить существующие запросы",
        variant: "destructive",
      });
      return false;
    }

    // If relationship exists and is not removed, return appropriate message
    if (existingRelationship) {
      if (existingRelationship.status === 'pending') {
        toast({
          title: "Запрос уже отправлен",
          description: "Вы уже отправили запрос этому репетитору",
        });
        return false;
      } else if (existingRelationship.status === 'accepted') {
        toast({
          title: "Репетитор уже добавлен",
          description: "Этот репетитор уже находится в вашем списке",
        });
        return false;
      } else if (existingRelationship.status === 'rejected') {
        // If the request was rejected before, we can allow to send a new one
        const { error: updateError } = await supabase
          .from('student_tutor_relationships')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('id', existingRelationship.id);

        if (updateError) {
          console.error('Error updating relationship:', updateError);
          toast({
            title: "Ошибка",
            description: "Не удалось отправить запрос репетитору",
            variant: "destructive",
          });
          return false;
        }

        toast({
          title: "Запрос отправлен",
          description: "Новый запрос успешно отправлен репетитору",
        });
        return true;
      }
    }

    // Create a new relationship
    const { error: insertError } = await supabase
      .from('student_tutor_relationships')
      .insert([
        { 
          student_id: studentId, 
          tutor_id: tutorId, 
          status: 'pending'
        }
      ]);

    if (insertError) {
      console.error('Error creating relationship:', insertError);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос репетитору",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Запрос отправлен",
      description: "Запрос успешно отправлен репетитору",
    });
    return true;

  } catch (error) {
    console.error('Exception in requestTutor:', error);
    toast({
      title: "Ошибка",
      description: "Не удалось отправить запрос репетитору",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Respond to a student's request (for tutors)
 */
export const respondToStudentRequest = async (
  relationshipId: string, 
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_tutor_relationships')
      .update({ 
        status, 
        updated_at: new Date().toISOString(),
        ...(status === 'accepted' ? { start_date: new Date().toISOString() } : {})
      })
      .eq('id', relationshipId);

    if (error) {
      console.error(`Error ${status === 'accepted' ? 'accepting' : 'rejecting'} student request:`, error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Exception in respondToStudentRequest:', error);
    return false;
  }
};

/**
 * End a relationship with a tutor
 */
export const endTutorRelationship = async (relationshipId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_tutor_relationships')
      .update({ 
        status: 'removed', 
        updated_at: new Date().toISOString(),
        end_date: new Date().toISOString()
      })
      .eq('id', relationshipId);

    if (error) {
      console.error('Error ending tutor relationship:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Exception in endTutorRelationship:', error);
    return false;
  }
};
