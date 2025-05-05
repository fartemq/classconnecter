
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch materials for a tutor
 */
export const fetchTutorMaterials = async (tutorId: string, subjectId?: string) => {
  try {
    let query = supabase
      .from("tutor_materials")
      .select("*")
      .eq("tutor_id", tutorId);
      
    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching tutor materials:", error);
    throw error;
  }
};

/**
 * Save a new material for a tutor
 */
export const saveTutorMaterial = async (tutorId: string, material: any) => {
  try {
    const { data, error } = await supabase
      .from("tutor_materials")
      .insert({
        tutor_id: tutorId,
        subject_id: material.subjectId || null,
        title: material.title,
        type: material.type,
        url: material.url,
        description: material.description || null
      })
      .select();
      
    if (error) throw error;
    
    return data[0];
  } catch (error) {
    console.error("Error saving tutor material:", error);
    throw error;
  }
};

/**
 * Delete a material
 */
export const deleteTutorMaterial = async (materialId: string) => {
  try {
    const { error } = await supabase
      .from("tutor_materials")
      .delete()
      .eq("id", materialId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error deleting tutor material:", error);
    throw error;
  }
};
