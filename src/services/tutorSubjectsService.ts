
import { supabase } from "@/integrations/supabase/client";

/**
 * Save subjects for a tutor
 */
export const saveTutorSubjects = async (userId: string, subjects: string[], hourlyRate: number) => {
  try {
    console.log("Saving tutor subjects for user:", userId, "Subjects:", subjects, "Rate:", hourlyRate);
    
    // First, get existing tutor subjects
    const { data: existingSubjects, error: fetchError } = await supabase
      .from("tutor_subjects")
      .select("subject_id")
      .eq("tutor_id", userId);
      
    if (fetchError) {
      console.error("Error fetching existing subjects:", fetchError);
      throw fetchError;
    }
    
    const existingSubjectIds = existingSubjects?.map(s => s.subject_id) || [];
    
    // Mark all existing subjects as inactive
    if (existingSubjectIds.length > 0) {
      const { error: updateError } = await supabase
        .from("tutor_subjects")
        .update({ is_active: false })
        .eq("tutor_id", userId);
        
      if (updateError) {
        console.error("Error deactivating existing subjects:", updateError);
        throw updateError;
      }
    }
    
    // For each selected subject, get its default category
    for (const subjectId of subjects) {
      // Get default category for this subject
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id")
        .eq("subject_id", subjectId)
        .eq("is_active", true)
        .limit(1);
        
      if (categoriesError) {
        console.error("Error fetching category for subject:", categoriesError);
        continue;
      }
      
      const categoryId = categories && categories.length > 0 ? categories[0].id : null;
      
      // Check if subject already exists for this tutor
      const { data: existingSubject, error: checkError } = await supabase
        .from("tutor_subjects")
        .select("id")
        .eq("tutor_id", userId)
        .eq("subject_id", subjectId)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing subject:", checkError);
        continue;
      }
      
      if (existingSubject) {
        // Update existing subject
        const { error: updateError } = await supabase
          .from("tutor_subjects")
          .update({
            hourly_rate: hourlyRate,
            category_id: categoryId,
            is_active: true
          })
          .eq("id", existingSubject.id);
          
        if (updateError) {
          console.error("Error updating subject:", updateError);
          continue;
        }
      } else {
        // Insert new subject
        const { error: insertError } = await supabase
          .from("tutor_subjects")
          .insert({
            tutor_id: userId,
            subject_id: subjectId,
            category_id: categoryId,
            hourly_rate: hourlyRate,
            is_active: true
          });
          
        if (insertError) {
          console.error("Error inserting subject:", insertError);
          continue;
        }
      }
    }
    
    console.log("Subjects saved successfully");
    return { success: true };
  } catch (error) {
    console.error("Error in saveTutorSubjects:", error);
    throw error;
  }
};

/**
 * Fetch all subjects and their categories
 */
export const fetchSubjectsAndCategories = async () => {
  try {
    // Fetch subjects
    const { data: subjects, error: subjectsError } = await supabase
      .from("subjects")
      .select("*")
      .eq("is_active", true)
      .order("name");
    
    if (subjectsError) {
      throw subjectsError;
    }
    
    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true);
      
    if (categoriesError) {
      throw categoriesError;
    }
    
    return { subjects: subjects || [], categories: categories || [] };
  } catch (error) {
    console.error("Error fetching subjects and categories:", error);
    throw error;
  }
};

/**
 * Get the name of a subject by ID
 */
export const getSubjectName = async (subjectId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("subjects")
      .select("name")
      .eq("id", subjectId)
      .single();
      
    if (error) throw error;
    
    return data?.name || "";
  } catch (error) {
    console.error("Error getting subject name:", error);
    return "";
  }
};
