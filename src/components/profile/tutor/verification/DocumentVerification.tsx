
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

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
      
      // Subscribe to document verification updates
      const channel = supabase
        .channel('document-verification-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'document_verifications',
            filter: `tutor_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Document verification updated:', payload);
            const newDoc = payload.new as DocumentVerification;
            
            // Show notification based on status
            if (newDoc.status === 'approved') {
              toast({
                title: "Документ одобрен! ✅",
                description: "Ваш документ успешно прошел проверку",
              });
              // Update education verified status
              checkEducationStatus();
            } else if (newDoc.status === 'rejected') {
              toast({
                title: "Документ отклонен",
                description: newDoc.admin_comment || "Пожалуйста, проверьте комментарий администратора",
                variant: "destructive"
              });
            }
            
            // Refresh verifications list
            fetchVerifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, toast]);

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
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            На проверке
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Одобрено
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Отклонено
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Education verification status banner */}
      {isEducationVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Образование подтверждено!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            В вашем профиле теперь отображается значок подтверждённого образования, что повышает доверие студентов.
          </p>
        </div>
      )}
      
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
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Документы не загружены</p>
              <p className="text-sm">Загрузите документы для верификации образования</p>
            </div>
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
                    <div className={`mt-2 p-3 rounded ${
                      verification.status === 'approved' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
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
