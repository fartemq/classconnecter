
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch materials for a tutor
 */
export const fetchTutorMaterials = async (tutorId: string, subjectId?: string) => {
  try {
    let query = supabase
      .from("tutor_materials")
      .select("*, subjects(name)")
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
 * Fetch materials for a student based on their tutors
 */
export const fetchStudentMaterials = async (studentId: string, subjectId?: string) => {
  try {
    // First get all tutors that are connected to this student
    const { data: tutorConnections, error: connectionError } = await supabase
      .from("student_requests")
      .select("tutor_id")
      .eq("student_id", studentId)
      .eq("status", "accepted");
      
    if (connectionError) throw connectionError;
    
    if (!tutorConnections || tutorConnections.length === 0) {
      return [];
    }
    
    // Get all tutor IDs
    const tutorIds = tutorConnections.map(conn => conn.tutor_id);
    
    // Now fetch materials from these tutors
    let query = supabase
      .from("tutor_materials")
      .select("*, subjects(name), profiles!tutor_materials_tutor_id_fkey(first_name, last_name, avatar_url)")
      .in("tutor_id", tutorIds);
      
    if (subjectId) {
      query = query.eq("subject_id", subjectId);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching student materials:", error);
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
