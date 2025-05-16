
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
    
    // Create a unique file name using userId as prefix for proper RLS
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Check if the bucket exists first
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarBucketExists) {
      console.log("Avatars bucket doesn't exist, creating it");
      // Create the avatars bucket with public access
      const { data: newBucket, error: bucketError } = await supabase.storage.createBucket('avatars', { 
        public: true,
        fileSizeLimit: 1024 * 1024 * 2 // 2MB limit
      });
      
      if (bucketError) {
        console.error("Error creating avatars bucket:", bucketError);
        
        // Check if it's a permissions error, which might mean the bucket already exists
        if (bucketError.message.includes('permission') || bucketError.message.includes('policy')) {
          console.log("Permissions issue - bucket may already exist, proceeding with upload");
        } else {
          throw new Error("Failed to create storage bucket: " + bucketError.message);
        }
      } else {
        console.log("Successfully created avatars bucket:", newBucket);
      }
    }
    
    // Upload the file
    console.log("Attempting to upload file to avatars bucket:", fileName);
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '0', // Disable caching to always fetch fresh image
        upsert: true
      });
    
    if (uploadError) {
      console.error("Error uploading avatar:", uploadError);
      
      // Try to provide more diagnostic info
      if (uploadError.message.includes('bucket') && uploadError.message.includes('not found')) {
        console.log("Bucket not found error - RLS policy might be preventing access");
      }
      
      throw uploadError;
    }
    
    // Get the public URL with cache-busting parameter
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    console.log("Avatar uploaded successfully, URL:", publicUrl);
    
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
