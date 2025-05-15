
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Upload an avatar image to Supabase storage and update the user's profile
 */
export const uploadProfileAvatar = async (
  avatarFile: File, 
  userId: string
): Promise<string | null> => {
  try {
    console.log("Uploading avatar for user:", userId);
    
    // Create a unique file name with timestamp to avoid caching issues
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        cacheControl: '0', // Disable caching to always fetch fresh image
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      throw uploadError;
    }
    
    // Get the public URL with cache-busting parameter
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log("Avatar uploaded successfully, URL:", publicUrl);
    
    // Return the URL without updating the profile
    // Profile update will be handled by the caller
    return publicUrl;
  } catch (error) {
    console.error("Error in uploadProfileAvatar:", error);
    toast({
      title: "Ошибка загрузки аватара",
      description: "Не удалось загрузить фото. Пожалуйста, попробуйте снова.",
      variant: "destructive",
    });
    return null;
  }
};
