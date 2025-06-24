
import { supabase } from "@/integrations/supabase/client";

export const uploadHomeworkMaterial = async (file: File, path: string): Promise<{ path: string | null; error: any }> => {
  try {
    const { data, error } = await supabase.storage
      .from('homework-materials')
      .upload(path, file);

    if (error) {
      return { path: null, error };
    }

    return { path: data.path, error: null };
  } catch (error) {
    console.error('Error uploading homework material:', error);
    return { path: null, error };
  }
};

export const uploadHomeworkAnswer = async (file: File, path: string): Promise<{ path: string | null; error: any }> => {
  try {
    const { data, error } = await supabase.storage
      .from('homework-answers')
      .upload(path, file);

    if (error) {
      return { path: null, error };
    }

    return { path: data.path, error: null };
  } catch (error) {
    console.error('Error uploading homework answer:', error);
    return { path: null, error };
  }
};

export const getFileUrl = async (bucket: string, path: string): Promise<string | null> => {
  try {
    const { data } = await supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    return !error;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};
