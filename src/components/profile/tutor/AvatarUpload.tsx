
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { UploadIcon } from "lucide-react";

interface AvatarUploadProps {
  avatarUrl: string | null;
  firstName: string;
  onChange: (file: File | null, url: string | null) => void;
}

export const AvatarUpload = ({ avatarUrl, firstName, onChange }: AvatarUploadProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // в МБ
    
    if (fileSize > 2) {
      toast({
        title: "Файл слишком большой",
        description: "Максимальный размер файла - 2 МБ",
        variant: "destructive",
      });
      return;
    }
    
    onChange(file, URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="relative" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Avatar className="w-24 h-24 border-2 border-primary">
          <AvatarImage src={avatarUrl || ""} />
          <AvatarFallback>{firstName.charAt(0) || "Р"}</AvatarFallback>
        </Avatar>
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <label htmlFor="avatar-input" className="cursor-pointer flex flex-col items-center text-white">
              <UploadIcon className="h-6 w-6" />
              <span className="text-xs">Изменить</span>
            </label>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="avatar-input">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            Загрузить фото
          </Button>
        </label>
        <Input
          id="avatar-input"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-1">
          Рекомендуемый размер: 400x400 пикселей (макс. 2 МБ)
        </p>
      </div>
    </div>
  );
};
