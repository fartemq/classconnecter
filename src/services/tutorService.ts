
import { supabase } from "@/integrations/supabase/client";
import { TutorFormValues } from "@/types/tutor";
import { toast } from "@/hooks/use-toast";

export const uploadAvatar = async (avatarFile: File, userId: string) => {
  try {
    // Create a unique file name
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw new Error("Произошла ошибка при загрузке фотографии");
  }
};

export const saveTutorProfile = async (values: TutorFormValues, userId: string, avatarFile: File | null, avatarUrl: string | null) => {
  try {
    // Upload avatar if selected
    let finalAvatarUrl = avatarUrl;
    if (avatarFile) {
      finalAvatarUrl = await uploadAvatar(avatarFile, userId);
    }
    
    // Update profile in the database
    const { error: profileError } = await supabase.from("profiles").update({
      first_name: values.firstName,
      last_name: values.lastName,
      bio: values.bio,
      city: values.city,
      avatar_url: finalAvatarUrl,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
    
    if (profileError) {
      throw profileError;
    }
    
    // Update or create tutor_profiles record
    const { data: existingTutorProfile } = await supabase
      .from("tutor_profiles")
      .select()
      .eq("id", userId)
      .single();
    
    if (existingTutorProfile) {
      // Update existing record
      const { error: tutorProfileError } = await supabase.from("tutor_profiles").update({
        education_institution: values.educationInstitution,
        degree: values.degree,
        graduation_year: values.graduationYear,
        methodology: values.methodology,
        experience: values.experience,
        achievements: values.achievements,
        video_url: values.videoUrl,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      
      if (tutorProfileError) {
        throw tutorProfileError;
      }
    } else {
      // Create new record
      const { error: tutorProfileError } = await supabase.from("tutor_profiles").insert({
        id: userId,
        education_institution: values.educationInstitution || '',
        degree: values.degree || '',
        graduation_year: values.graduationYear || new Date().getFullYear(),
        methodology: values.methodology || '',
        experience: values.experience || 0,
        achievements: values.achievements || '',
        video_url: values.videoUrl || ''
      });
      
      if (tutorProfileError) {
        throw tutorProfileError;
      }
    }
    
    return { success: true, avatarUrl: finalAvatarUrl };
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
};

export const saveTutorSubjects = async (userId: string, subjects: string[], hourlyRate: number, categories: any[]) => {
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
};

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

export const fetchTutorProfile = async (userId: string) => {
  try {
    // Fetch basic profile information
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    // Fetch tutor specific information
    const { data: tutorProfileData, error: tutorProfileError } = await supabase
      .from("tutor_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    if (tutorProfileError) {
      throw tutorProfileError;
    }
    
    // Fetch tutor subjects
    const { data: subjectsData, error: subjectsError } = await supabase
      .from("tutor_subjects")
      .select(`
        *,
        subjects:subject_id (
          id, name
        )
      `)
      .eq("tutor_id", userId);
    
    if (subjectsError) {
      throw subjectsError;
    }
    
    const formattedSubjects = subjectsData.map(item => ({
      id: item.subject_id,
      name: item.subjects.name,
      hourlyRate: item.hourly_rate,
      experienceYears: item.experience_years,
      description: item.description
    }));
    
    return {
      id: profileData.id,
      firstName: profileData.first_name,
      lastName: profileData.last_name || "",
      bio: profileData.bio || "",
      city: profileData.city || "",
      avatarUrl: profileData.avatar_url,
      educationInstitution: tutorProfileData?.education_institution || "",
      degree: tutorProfileData?.degree || "",
      graduationYear: tutorProfileData?.graduation_year || null,
      educationVerified: tutorProfileData?.education_verified || false,
      methodology: tutorProfileData?.methodology || "",
      experience: tutorProfileData?.experience || 0,
      achievements: tutorProfileData?.achievements || "",
      videoUrl: tutorProfileData?.video_url || "",
      subjects: formattedSubjects,
      rating: 0, // В будущем эти данные могут быть получены из базы данных
      reviewsCount: 0,
      completedLessons: 0,
      activeStudents: 0
    };
  } catch (error) {
    console.error("Error fetching tutor profile:", error);
    throw error;
  }
};

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
