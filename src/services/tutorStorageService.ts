
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an avatar file to Supabase storage
 */
export const uploadAvatar = async (avatarFile: File, userId: string): Promise<string> => {
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

/**
 * Upload a teaching material file
 */
export const uploadMaterial = async (file: File, tutorId: string, materialType: string): Promise<string> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${tutorId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `materials/${materialType}/${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage.from('materials').getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error(`Error uploading ${materialType}:`, error);
    throw new Error(`Произошла ошибка при загрузке файла`);
  }
};
