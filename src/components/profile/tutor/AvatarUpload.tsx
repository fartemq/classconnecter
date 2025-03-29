
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  avatarUrl: string | null;
  firstName: string;
  onChange: (file: File | null, url: string | null) => void;
}

export const AvatarUpload = ({ avatarUrl, firstName, onChange }: AvatarUploadProps) => {
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileSize = file.size / 1024 / 1024; // in MB
    
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
      <Avatar className="w-24 h-24">
        <AvatarImage src={avatarUrl || ""} />
        <AvatarFallback>{firstName.charAt(0) || "Р"}</AvatarFallback>
      </Avatar>
      <div>
        <Input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="max-w-xs"
        />
        <p className="text-xs text-gray-500 mt-1">
          Рекомендуемый размер: 400x400 пикселей (макс. 2 МБ)
        </p>
      </div>
    </div>
  );
};
