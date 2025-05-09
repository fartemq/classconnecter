import { supabase } from "@/integrations/supabase/client";
import { ensureSingleObject } from "@/utils/supabaseUtils";

/**
 * Save subjects for a tutor
 */
export const saveTutorSubjects = async (userId: string, subjects: string[], hourlyRate: number, categories: any[]) => {
  try {
    // For each selected subject, create a tutor_subject entry
    for (const subjectId of subjects) {
      // Find a default category for this subject
      const defaultCategory = categories.find(c => c.subject_id === subjectId);
      const categoryId = defaultCategory ? defaultCategory.id : null;
      
      if (!categoryId) {
        console.warn(`No default category found for subject ${subjectId}`);
        continue;
      }
      
      const { error: subjectError } = await supabase.from("tutor_subjects").insert({
        tutor_id: userId,
        subject_id: subjectId,
        category_id: categoryId,
        hourly_rate: hourlyRate,
        is_active: true
      });
      
      if (subjectError) {
        console.error("Error adding subject:", subjectError);
        throw subjectError;
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saving tutor subjects:", error);
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
