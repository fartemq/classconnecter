
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface DocumentVerification {
  id: string;
  document_type: string;
  file_path: string;
  status: string;
  admin_comment?: string;
  submitted_at: string;
  reviewed_at?: string;
}

const DOCUMENT_TYPES = [
  { value: 'diploma', label: 'Диплом об образовании' },
  { value: 'certificate', label: 'Сертификат' },
  { value: 'passport', label: 'Паспорт' },
  { value: 'other', label: 'Другой документ' }
];

export const DocumentVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<DocumentVerification[]>([]);
  const [isEducationVerified, setIsEducationVerified] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchVerifications();
      checkEducationStatus();
    }
  }, [user?.id]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('document_verifications')
        .select('*')
        .eq('tutor_id', user?.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const checkEducationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select('education_verified')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setIsEducationVerified(data?.education_verified || false);
    } catch (error) {
      console.error('Error checking education status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50">На проверке</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Отклонено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <DocumentUploadSection 
        tutorId={user?.id || ''}
        isEducationVerified={isEducationVerified}
      />

      <Card>
        <CardHeader>
          <CardTitle>История проверок</CardTitle>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <p className="text-gray-500">Документы не загружены</p>
          ) : (
            <div className="space-y-4">
              {verifications.map(verification => (
                <div key={verification.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{getDocumentTypeName(verification.document_type)}</h4>
                      <p className="text-sm text-gray-500">
                        Загружено: {format(new Date(verification.submitted_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                      </p>
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>

                  {verification.admin_comment && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-sm">
                        <strong>Комментарий администратора:</strong> {verification.admin_comment}
                      </p>
                    </div>
                  )}

                  {verification.reviewed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Проверено: {format(new Date(verification.reviewed_at), 'dd MMM yyyy HH:mm', { locale: ru })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
