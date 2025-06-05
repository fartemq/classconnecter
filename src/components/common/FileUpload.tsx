
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  bucket: string;
  folder: string;
  onFileUploaded: (filePath: string, fileName: string) => void;
  onFileRemoved?: (filePath: string) => void;
  accept?: string;
  maxFiles?: number;
  existingFiles?: Array<{ path: string; name: string }>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  folder,
  onFileUploaded,
  onFileRemoved,
  accept = "*/*",
  maxFiles = 5,
  existingFiles = []
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (existingFiles.length + files.length > maxFiles) {
      toast({
        title: "Превышен лимит файлов",
        description: `Максимум ${maxFiles} файлов`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        onFileUploaded(filePath, file.name);
      }

      toast({
        title: "Файлы загружены",
        description: "Файлы успешно загружены"
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файлы",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      if (onFileRemoved) {
        onFileRemoved(filePath);
      }

      toast({
        title: "Файл удален",
        description: "Файл успешно удален"
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить файл",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant="outline"
            disabled={uploading || existingFiles.length >= maxFiles}
            className="cursor-pointer"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Загрузка..." : "Выбрать файлы"}
          </Button>
        </label>
      </div>

      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Загруженные файлы:</p>
          {existingFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center">
                <File className="h-4 w-4 mr-2" />
                <span className="text-sm">{file.name}</span>
              </div>
              {onFileRemoved && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleFileRemove(file.path)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
