
import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { uploadProfileAvatar } from "@/services/avatarService";
import { useAuth } from "@/hooks/auth";

interface AvatarUploadProps {
  avatarUrl: string | null;
  firstName: string;
  onChange: (file: File | null, url: string | null) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarUrl,
  firstName,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleSelectedFile(file);
    }
  };
  
  const handleSelectedFile = async (file: File | undefined) => {
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Ошибка формата файла",
          description: "Пожалуйста, выберите файл изображения (JPEG, PNG или GIF)",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Файл слишком большой",
          description: "Размер файла не должен превышать 2 МБ",
          variant: "destructive"
        });
        return;
      }
      
      // Create local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Use the shared service to upload the avatar
      const newAvatarUrl = await uploadProfileAvatar(file, user.id);
      
      if (newAvatarUrl) {
        // Trigger the onChange callback with the new URL
        onChange(file, newAvatarUrl);
        
        toast({
          title: "Фото загружено",
          description: "Аватар успешно обновлен",
        });
      } else {
        // Revert preview if upload failed
        setPreviewUrl(avatarUrl);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // Revert preview if upload failed
      setPreviewUrl(avatarUrl);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить аватар",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div
      className={`relative flex flex-col items-center ${
        isDragging ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="relative group">
        <Avatar className="h-24 w-24 cursor-pointer border-2 border-gray-200">
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt={`${firstName} avatar`} />
          ) : (
            <AvatarFallback className="bg-primary/20 text-primary text-xl">
              {getInitials(firstName)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div 
          className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={handleClick}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload avatar"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={handleClick}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4 mr-1" />
        {isUploading ? "Загрузка..." : "Загрузить фото"}
      </Button>
      <p className="text-xs text-muted-foreground mt-1">
        Рекомендуемый формат: JPEG, PNG до 2 МБ
      </p>
    </div>
  );
};
