
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/auth";
import { Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { uploadProfileAvatar } from "@/services/avatarService";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  firstName: string;
  lastName: string | null;
  verified?: boolean;
  onAvatarUpdate?: (newUrl: string) => void;
}

export const ProfileAvatar = ({ 
  avatarUrl, 
  firstName, 
  lastName, 
  verified = false,
  onAvatarUpdate
}: ProfileAvatarProps) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);

  const handleAvatarClick = () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Необходимо авторизоваться для загрузки фото",
        variant: "destructive",
      });
      return;
    }
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file && user) {
        try {
          setIsUploading(true);
          
          // Validate file size (2MB max)
          if (file.size > 2 * 1024 * 1024) {
            toast({
              title: "Слишком большой файл",
              description: "Размер файла не должен превышать 2 МБ",
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }
          
          // Create preview URL
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
          
          // Upload avatar using the shared service
          const newAvatarUrl = await uploadProfileAvatar(file, user.id);
          
          if (newAvatarUrl) {
            console.log("Avatar updated successfully:", newAvatarUrl);
            toast({
              title: "Аватар обновлен",
              description: "Ваша фотография профиля была успешно обновлена",
            });
            
            // Call the callback if provided
            if (onAvatarUpdate) {
              onAvatarUpdate(newAvatarUrl);
            }
          } else {
            // Revert preview if upload failed
            setPreviewUrl(avatarUrl);
            toast({
              title: "Ошибка загрузки",
              description: "Не удалось загрузить фото. Пожалуйста, попробуйте снова.",
              variant: "destructive",
            });
          }
          
        } catch (error) {
          console.error("Error handling avatar upload:", error);
          // Revert preview if upload failed
          setPreviewUrl(avatarUrl);
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
        {previewUrl ? (
          <AvatarImage src={previewUrl} alt={`${firstName} ${lastName || ""}`} />
        ) : (
          <AvatarFallback className="text-lg bg-gray-200 text-gray-500">
            {getInitials(firstName, lastName)}
          </AvatarFallback>
        )}
      </Avatar>
      
      {verified && (
        <Badge className="absolute bottom-1 right-0 bg-green-500">Проверено</Badge>
      )}
      
      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col items-center text-white">
          <Camera className="mb-1" size={20} />
          <span className="text-xs font-medium">
            {isUploading ? "Загрузка..." : "Изменить"}
          </span>
        </div>
      </div>
    </div>
  );
};
