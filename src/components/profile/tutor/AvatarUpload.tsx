
import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleSelectedFile = (file: File | undefined) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Пожалуйста, выберите файл изображения (JPEG, PNG или GIF)');
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2 МБ');
      return;
    }
    
    // Create URL for preview
    const imageUrl = URL.createObjectURL(file);
    onChange(file, imageUrl);
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
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={`${firstName} avatar`} />
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
      >
        <Upload className="h-4 w-4 mr-1" />
        Загрузить фото
      </Button>
    </div>
  );
};
