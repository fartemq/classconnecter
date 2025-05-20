
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ensureSingleObject } from "@/utils/supabaseUtils";
import { FavoriteTutor } from "./types";

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
    const favoriteTutors = data.map(item => {
      // Ensure tutor is handled correctly - it should be an object not an array
      const formattedTutor = item.tutor ? ensureSingleObject(item.tutor) : undefined;
      
      return {
        ...item,
        tutor: formattedTutor
      };
    });

    return favoriteTutors as FavoriteTutor[];

  } catch (error) {
    console.error('Exception in getStudentFavoriteTutors:', error);
    return [];
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
