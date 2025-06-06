
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Check } from "lucide-react";
import { DocumentUploadSectionProps } from './types';
import { VerificationStatus } from './VerificationStatus';
import { DocumentUploadForm } from './DocumentUploadForm';

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  tutorId,
  isEducationVerified = false
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Верификация образования</span>
          </CardTitle>
          <VerificationStatus isVerified={isEducationVerified} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEducationVerified ? (
          <DocumentUploadForm tutorId={tutorId} />
        ) : (
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
