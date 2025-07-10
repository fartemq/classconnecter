import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  FileText, 
  Image,
  Video,
  Music,
  Archive,
  Trash2,
  Plus,
  Eye,
  Share2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LessonFilesProps {
  lessonId: string;
}

interface LessonFile {
  id: string;
  title: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
  created_by: string;
  creator: {
    first_name: string;
    last_name: string;
  };
}

export const LessonFiles = ({ lessonId }: LessonFilesProps) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [files, setFiles] = useState<LessonFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [lessonId]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_materials')
        .select(`
          *,
          creator:profiles!lesson_materials_created_by_fkey(first_name, last_name)
        `)
        .eq('lesson_id', lessonId)
        .eq('material_type', 'file')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${lessonId}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('materials')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('lesson_materials')
        .insert({
          lesson_id: lessonId,
          material_type: 'file',
          title: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
          created_by: user?.id
        });

      if (insertError) throw insertError;

      toast({
        title: "Файл загружен",
        description: "Файл успешно добавлен к уроку",
      });

      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить файл",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('materials')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать файл",
        variant: "destructive"
      });
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('materials')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('lesson_materials')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: "Файл удален",
        description: "Файл был успешно удален",
      });

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить файл",
        variant: "destructive"
      });
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return FileText;
    
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return Archive;
    
    return FileText;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('materials')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const previewFile = async (file: LessonFile) => {
    const url = await getFileUrl(file.file_path);
    window.open(url, '_blank');
  };

  const shareFile = async (file: LessonFile) => {
    const url = await getFileUrl(file.file_path);
    
    if (navigator.share) {
      await navigator.share({
        title: file.title,
        url: url
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка на файл скопирована в буфер обмена",
      });
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Загрузить файл
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="flex-1"
              disabled={uploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {uploading ? 'Загружается...' : 'Выбрать файл'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <div className="flex-1 space-y-3">
        {files.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Файлы не найдены</p>
              <p className="text-sm">Загрузите первый файл для урока</p>
            </div>
          </div>
        ) : (
          files.map((file) => {
            const FileIcon = getFileIcon(file.file_type);
            
            return (
              <Card key={file.id} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{file.creator.first_name} {file.creator.last_name}</span>
                          <span>•</span>
                          <span>{new Date(file.created_at).toLocaleDateString('ru-RU')}</span>
                          {file.file_size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(file.file_size)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {file.file_type?.startsWith('image/') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => previewFile(file)}
                          title="Предпросмотр"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareFile(file)}
                        title="Поделиться"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file.file_path, file.title)}
                        title="Скачать"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      {file.created_by === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id, file.file_path)}
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};