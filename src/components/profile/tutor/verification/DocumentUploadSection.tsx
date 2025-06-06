
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Check, X, Loader, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentUploadSectionProps {
  tutorId: string;
  isEducationVerified?: boolean;
}

const DOCUMENT_TYPES = [
  { value: 'diploma', label: 'Диплом об образовании' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'passport', label: 'Паспорт' },
  { value: 'other', label: 'Другой документ' }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  tutorId,
  isEducationVerified = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('diploma');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Файл "${file.name}" слишком большой. Максимальный размер: 10MB`;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return `Файл "${file.name}" имеет неподдерживаемый формат. Разрешены: PDF, JPG, PNG, DOC, DOCX`;
    }
    
    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    const fileArray = Array.from(files);
    
    // Проверяем каждый файл
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    
    if (fileArray.length > 5) {
      setError('Можно загрузить максимум 5 файлов за раз');
      return;
    }
    
    setSelectedFiles(fileArray);
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
      // Проверяем авторизацию
      const { data: currentUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser.user) {
        throw new Error('Вы не авторизованы. Пожалуйста, войдите в систему.');
      }

      console.log('Пользователь авторизован:', currentUser.user.id);
      console.log('Загружаем файлы для пользователя:', tutorId);
      console.log('Количество файлов:', selectedFiles.length);
      console.log('Тип документа:', selectedDocType);

      const uploadPromises = selectedFiles.map(async (file, index) => {
        try {
          // Создаем уникальное имя файла
          const fileExt = file.name.split('.').pop();
          const timestamp = Date.now();
          const fileName = `${tutorId}/${timestamp}_${index}_${selectedDocType}.${fileExt}`;
          
          console.log(`Загружаем файл ${index + 1}: ${fileName}`);

          // Загружаем файл в storage
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

          // Создаем запись в базе данных
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
            // Удаляем загруженный файл при ошибке БД
            await supabase.storage
              .from('document-verifications')
              .remove([fileName]);
            throw new Error(`Ошибка сохранения в базе данных: ${dbError.message}`);
          }

          console.log('Запись в БД создана:', dbData);

          // Создаем уведомление администраторам
          try {
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: tutorId, // Временно отправляем уведомление самому пользователю
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
        } catch (error) {
          console.error(`Ошибка обработки файла ${file.name}:`, error);
          throw error;
        }
      });

      const results = await Promise.all(uploadPromises);
      
      console.log('Все файлы успешно обработаны:', results);
      
      toast({
        title: "Документы отправлены",
        description: `${selectedFiles.length} документов отправлены на проверку администрации`,
      });
      
      // Очищаем состояние
      setSelectedFiles([]);
      setSelectedDocType('diploma');
      
      // Сбрасываем input
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

  const getVerificationStatus = () => {
    if (isEducationVerified) {
      return {
        icon: <Check className="w-4 h-4" />,
        text: "Образование подтверждено",
        variant: "default" as const,
        color: "text-green-600"
      };
    }
    
    return {
      icon: <X className="w-4 h-4" />,
      text: "Не подтверждено",
      variant: "outline" as const,
      color: "text-red-600"
    };
  };

  const status = getVerificationStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Верификация образования</span>
          </CardTitle>
          <Badge variant={status.variant} className={`${status.color} flex items-center gap-1`}>
            {status.icon}
            {status.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEducationVerified && (
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

            {selectedFiles.length > 0 && (
              <div>
                <Label>Выбранные файлы ({selectedFiles.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        )}

        {isEducationVerified && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="w-5 h-5" />
              <span className="font-medium">Образование подтверждено!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Ваши документы прошли проверку. Теперь в вашем профиле отображается значок подтверждённого образования.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
