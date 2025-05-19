
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ensureObject } from "@/utils/supabaseUtils";

export interface StudentTutorRelationship {
  id: string;
  student_id: string;
  tutor_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'removed';
  created_at: string;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  tutor?: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
}

export interface FavoriteTutor {
  id: string;
  student_id: string;
  tutor_id: string;
  created_at: string;
  tutor?: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    city: string | null;
  };
}

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
    return data.map(item => ({
      ...item,
      tutor: item.tutor ? ensureObject(item.tutor) : undefined
    })) as StudentTutorRelationship[];

  } catch (error) {
    console.error('Exception in getStudentTutorRelationships:', error);
    return [];
  }
};

/**
 * Get all tutors that a student has as favorites
 */
export const getStudentFavoriteTutors = async (studentId: string): Promise<FavoriteTutor[]> => {
  try {
    const { data, error } = await supabase
      .from('favorite_tutors')
      .select(`
        id, 
        student_id, 
        tutor_id, 
        created_at,
        tutor:tutor_id (
          first_name,
          last_name,
          avatar_url,
          city
        )
      `)
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching favorite tutors:', error);
      return [];
    }

    // Format the response with proper typing
    return data.map(item => ({
      ...item,
      tutor: item.tutor ? ensureObject(item.tutor) : undefined
    })) as FavoriteTutor[];

  } catch (error) {
    console.error('Exception in getStudentFavoriteTutors:', error);
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

/**
 * Add a tutor to favorites
 */
export const addTutorToFavorites = async (studentId: string, tutorId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorite_tutors')
      .insert([{ student_id: studentId, tutor_id: tutorId }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Уже в избранном",
          description: "Этот репетитор уже добавлен в избранное",
        });
        return true; // Not really an error from the user's perspective
      }
      
      console.error('Error adding tutor to favorites:', error);
      return false;
    }

    toast({
      title: "Добавлено в избранное",
      description: "Репетитор добавлен в избранное",
    });
    return true;

  } catch (error) {
    console.error('Exception in addTutorToFavorites:', error);
    return false;
  }
};

/**
 * Remove a tutor from favorites
 */
export const removeTutorFromFavorites = async (favoriteId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorite_tutors')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      console.error('Error removing tutor from favorites:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Exception in removeTutorFromFavorites:', error);
    return false;
  }
};

/**
 * Add a review for a tutor
 */
export const addTutorReview = async (studentId: string, tutorId: string, rating: number, comment: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('tutor_reviews')
      .insert([{
        student_id: studentId,
        tutor_id: tutorId,
        rating,
        comment
      }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        // Try to update instead
        const { error: updateError } = await supabase
          .from('tutor_reviews')
          .update({ rating, comment, updated_at: new Date().toISOString() })
          .eq('student_id', studentId)
          .eq('tutor_id', tutorId);

        if (updateError) {
          console.error('Error updating tutor review:', updateError);
          return false;
        }
      } else {
        console.error('Error adding tutor review:', error);
        return false;
      }
    }

    return true;

  } catch (error) {
    console.error('Exception in addTutorReview:', error);
    return false;
  }
};
