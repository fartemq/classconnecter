
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
        tutor:profiles!tutor_id (
          first_name,
          last_name,
          avatar_url,
          city
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching student-tutor relationships:', error);
      return [];
    }

    const relationships = data.map(item => {
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
 * Send a request to a tutor (создает запрос в student_requests)
 */
export const requestTutor = async (studentId: string, tutorId: string, message?: string): Promise<boolean> => {
  try {
    // Проверяем существующие запросы
    const { data: existingRequest, error: checkError } = await supabase
      .from('student_requests')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing request:', checkError);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить существующие запросы",
        variant: "destructive",
      });
      return false;
    }

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        toast({
          title: "Запрос уже отправлен",
          description: "Вы уже отправили запрос этому репетитору",
        });
        return false;
      } else if (existingRequest.status === 'accepted') {
        toast({
          title: "Репетитор уже принят",
          description: "Этот репетитор уже находится в вашем списке",
        });
        return false;
      }
    }

    // Создаем новый запрос
    const { error: insertError } = await supabase
      .from('student_requests')
      .insert([
        { 
          student_id: studentId, 
          tutor_id: tutorId,
          message: message || null,
          status: 'pending'
        }
      ]);

    if (insertError) {
      console.error('Error creating request:', insertError);
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
 * Respond to a student's request (для репетиторов)
 */
export const respondToStudentRequest = async (
  requestId: string, 
  status: 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('student_requests')
      .update({ 
        status, 
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

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
