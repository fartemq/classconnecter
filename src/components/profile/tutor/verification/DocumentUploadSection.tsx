
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Check, X, Eye, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  tutorId,
  isEducationVerified = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('diploma');
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setSelectedFiles(Array.from(files));
  };

  const handleSubmitDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Ошибка",
        description: "Выберите файлы для загрузки",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      for (const file of selectedFiles) {
        // Загружаем файл в storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${tutorId}/${Date.now()}_${selectedDocType}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('document-verifications')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Создаем запись в базе данных
        const { error: dbError } = await supabase
          .from('document_verifications')
          .insert({
            tutor_id: tutorId,
            document_type: selectedDocType,
            file_path: fileName
          });

        if (dbError) throw dbError;
      }
      
      toast({
        title: "Документы отправлены",
        description: "Ваши документы отправлены на проверку администрации",
      });
      
      setSelectedFiles([]);
      // Сбрасываем input
      const input = document.getElementById('documents') as HTMLInputElement;
      if (input) input.value = '';
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить документы",
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

            <div>
              <Label htmlFor="docType">Тип документа</Label>
              <select
                id="docType"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX. Максимум 5 файлов.
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
