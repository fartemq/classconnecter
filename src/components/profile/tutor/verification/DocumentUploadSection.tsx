
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Check, X, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadSectionProps {
  tutorId: string;
  isEducationVerified?: boolean;
}

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  tutorId,
  isEducationVerified = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Здесь должна быть логика загрузки файлов в Supabase Storage
      // Пока что просто симулируем загрузку
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDocuments = Array.from(files).map(file => file.name);
      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      
      toast({
        title: "Документы загружены",
        description: "Ваши документы отправлены на проверку администрации",
      });
    } catch (error) {
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
    
    if (uploadedDocuments.length > 0) {
      return {
        icon: <Eye className="w-4 h-4" />,
        text: "На проверке",
        variant: "secondary" as const,
        color: "text-orange-600"
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
              <Label htmlFor="documents">Документы об образовании</Label>
              <div className="mt-2">
                <Input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('documents')?.click()}
                  disabled={uploading}
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Загрузка..." : "Выбрать файлы"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Поддерживаемые форматы: PDF, JPG, PNG, DOC, DOCX. Максимум 5 файлов.
              </p>
            </div>
          </>
        )}

        {uploadedDocuments.length > 0 && (
          <div>
            <Label>Загруженные документы</Label>
            <div className="mt-2 space-y-2">
              {uploadedDocuments.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{doc}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {isEducationVerified ? "Подтверждён" : "На проверке"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
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
