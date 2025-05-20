
import { supabase } from "@/integrations/supabase/client";
import { TutorReviewData } from "./types";

/**
 * Add a review for a tutor
 */
export const addTutorReview = async (
  studentId: string, 
  tutorId: string, 
  rating: number, 
  comment: string
): Promise<boolean> => {
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

/**
 * Get a specific tutor review by student and tutor
 */
export const getTutorReview = async (
  studentId: string,
  tutorId: string
): Promise<TutorReviewData | null> => {
  try {
    const { data, error } = await supabase
      .from('tutor_reviews')
      .select('*')
      .eq('student_id', studentId)
      .eq('tutor_id', tutorId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Not found
        console.error('Error fetching tutor review:', error);
      }
      return null;
    }

    return data as TutorReviewData;
  } catch (error) {
    console.error('Exception in getTutorReview:', error);
    return null;
  }
};
