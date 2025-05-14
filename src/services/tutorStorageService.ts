
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an avatar file to Supabase storage
 */
export const uploadAvatar = async (avatarFile: File, userId: string): Promise<string> => {
  try {
    console.log("Uploading avatar for user:", userId);
    
    // Create a unique file name with timestamp to avoid caching issues
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Check if storage bucket exists, create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'avatars')) {
      await supabase.storage.createBucket('avatars', { public: true });
    }
    
    // Upload the file
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        cacheControl: '0', // Disable caching to always fetch fresh image
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    console.log("Avatar uploaded successfully, URL:", data.publicUrl);
    
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
    const filePath = `${materialType}/${fileName}`;
    
    // Check if storage bucket exists, create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.find(bucket => bucket.name === 'materials')) {
      await supabase.storage.createBucket('materials', { public: true });
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
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
