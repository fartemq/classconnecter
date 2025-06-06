
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DOCUMENT_TYPES } from './constants';
import { DocumentValidator } from './DocumentValidator';
import { DocumentFileList } from './DocumentFileList';
import { UploadResult } from './types';

interface DocumentUploadFormProps {
  tutorId: string;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({ tutorId }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('diploma');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    const fileArray = Array.from(files);
    
    const validation = DocumentValidator.validateFiles(fileArray);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }
    
    setSelectedFiles(fileArray);
  };

  const uploadSingleFile = async (file: File, index: number): Promise<UploadResult> => {
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${tutorId}/${timestamp}_${index}_${selectedDocType}.${fileExt}`;
    
    console.log(`Загружаем файл ${index + 1}: ${fileName}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('document-verifications')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`Ошибка загрузки файла ${fileName}:`, uploadError);
      throw new Error(`Ошибка загрузки файла "${file.name}": ${uploadError.message}`);
    }

    console.log(`Файл успешно загружен: ${fileName}`, uploadData);

    const verificationData = {
      tutor_id: tutorId,
      document_type: selectedDocType,
      file_path: fileName,
      status: 'pending'
    };

    console.log('Создаем запись в document_verifications:', verificationData);

    const { data: dbData, error: dbError } = await supabase
      .from('document_verifications')
      .insert(verificationData)
      .select()
      .single();

    if (dbError) {
      console.error('Ошибка записи в БД:', dbError);
      await supabase.storage
        .from('document-verifications')
        .remove([fileName]);
      throw new Error(`Ошибка сохранения в базе данных: ${dbError.message}`);
    }

    console.log('Запись в БД создана:', dbData);

    // Создаем уведомление
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: tutorId,
          type: 'document_submitted',
          title: 'Документ отправлен на проверку',
          message: `Документ "${DOCUMENT_TYPES.find(t => t.value === selectedDocType)?.label}" отправлен администратору на проверку`,
          related_id: dbData.id
        });

      if (notificationError) {
        console.error('Ошибка создания уведомления:', notificationError);
      }
    } catch (notificationError) {
      console.error('Ошибка при создании уведомления:', notificationError);
    }

    return { success: true, fileName, file: file.name };
  };

  const handleSubmitDocuments = async () => {
    console.log('=== Начало загрузки документов ===');
    setError(null);
    
    if (selectedFiles.length === 0) {
      setError('Выберите файлы для загрузки');
      return;
    }

    if (!tutorId) {
      setError('Ошибка: ID пользователя не найден');
      return;
    }

    setUploading(true);
    
    try {
      const { data: currentUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser.user) {
        throw new Error('Вы не авторизованы. Пожалуйста, войдите в систему.');
      }

      console.log('Пользователь авторизован:', currentUser.user.id);
      console.log('Загружаем файлы для пользователя:', tutorId);
      console.log('Количество файлов:', selectedFiles.length);
      console.log('Тип документа:', selectedDocType);

      const uploadPromises = selectedFiles.map((file, index) => 
        uploadSingleFile(file, index)
      );

      const results = await Promise.all(uploadPromises);
      
      console.log('Все файлы успешно обработаны:', results);
      
      toast({
        title: "Документы отправлены",
        description: `${selectedFiles.length} документов отправлены на проверку администрации`,
      });
      
      // Очищаем состояние
      setSelectedFiles([]);
      setSelectedDocType('diploma');
      
      const input = document.getElementById('documents') as HTMLInputElement;
      if (input) input.value = '';
      
    } catch (error: any) {
      console.error('Общая ошибка загрузки документов:', error);
      const errorMessage = error.message || 'Не удалось загрузить документы';
      setError(errorMessage);
      toast({
        title: "Ошибка загрузки",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          Подтверждение образования повышает доверие
        </h4>
        <p className="text-sm text-blue-700">
          Загрузите копии дипломов, сертификатов или других документов, 
          подтверждающих ваше образование. Это поможет студентам выбрать вас.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="docType">Тип документа</Label>
        <select
          id="docType"
          value={selectedDocType}
          onChange={(e) => setSelectedDocType(e.target.value)}
          className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={uploading}
        >
          {DOCUMENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="documents">Выберите файлы</Label>
        <div className="mt-2">
          <Input
            id="documents"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX. Максимум 5 файлов, до 10MB каждый.
        </p>
      </div>

      <DocumentFileList files={selectedFiles} />

      <Button
        onClick={handleSubmitDocuments}
        disabled={uploading || selectedFiles.length === 0}
        className="w-full"
        size="lg"
      >
        {uploading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Сохранить и отправить на проверку
          </>
        )}
      </Button>
    </>
  );
};
