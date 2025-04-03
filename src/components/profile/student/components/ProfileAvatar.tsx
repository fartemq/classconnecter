
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  firstName: string;
  lastName: string | null;
}

export const ProfileAvatar = ({ avatarUrl, firstName, lastName }: ProfileAvatarProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file && user) {
        try {
          setIsUploading(true);
          
          // Check if avatars bucket exists, if not handle gracefully
          const { data: bucketExists } = await supabase.storage.getBucket('avatars');
          
          if (!bucketExists) {
            // If implementing this feature, create the bucket first in Supabase
            toast({
              title: "Функция недоступна",
              description: "Загрузка аватара временно недоступна",
              variant: "destructive",
            });
            return;
          }
          
          // Upload file to Supabase Storage
          const fileExt = file.name.split('.').pop();
          const filePath = `${user.id}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });
            
          if (uploadError) throw uploadError;
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
            
          // Update user profile with avatar URL
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: urlData.publicUrl })
            .eq('id', user.id);
            
          if (updateError) throw updateError;
          
          toast({
            title: "Аватар обновлен",
            description: "Ваша фотография профиля была успешно обновлена",
          });
          
          // Force reload to see changes
          window.location.reload();
        } catch (error) {
          console.error("Error uploading avatar:", error);
          toast({
            title: "Ошибка загрузки",
            description: "Не удалось загрузить аватар",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }
    };
    fileInput.click();
  };

  return (
    <div className="relative mx-auto w-24 h-24 mb-3 group cursor-pointer" onClick={handleAvatarClick}>
      <Avatar className="w-24 h-24 border-2 border-primary">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName || ""}`} />
        ) : (
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        )}
      </Avatar>
      
      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-xs font-medium">
          {isUploading ? "Загрузка..." : "Изменить"}
        </span>
      </div>
    </div>
  );
};
