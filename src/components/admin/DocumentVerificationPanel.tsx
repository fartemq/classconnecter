
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Eye, FileText, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface DocumentVerification {
  id: string;
  tutor_id: string;
  document_type: string;
  file_path: string;
  status: string;
  admin_comment?: string;
  submitted_at: string;
  reviewed_at?: string;
  tutor?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    city?: string;
  };
}

const DOCUMENT_TYPES = {
  'diploma': 'Диплом об образовании',
  'certificate': 'Сертификат',
  'passport': 'Паспорт',
  'other': 'Другой документ'
};

export const DocumentVerificationPanel = () => {
  const [documents, setDocuments] = useState<DocumentVerification[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentVerification | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      // Note: This would require admin access in a real app
      const { data, error } = await supabase
        .from('document_verifications')
        .select(`
          *,
          tutor:profiles!tutor_id (first_name, last_name, avatar_url, city)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить документы",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (docId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('document_verifications')
        .update({
          status,
          admin_comment: adminComment || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: status === 'approved' ? 'Документ одобрен' : 'Документ отклонен',
        description: 'Репетитор получит уведомление о решении'
      });

      setSelectedDoc(null);
      setAdminComment('');
      fetchDocuments();
    } catch (error) {
      console.error('Error updating document status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус документа",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">На проверке</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Одобрено</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Отклонено</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const downloadDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('document-verifications')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось скачать документ",
        variant: "destructive"
      });
    }
  };

  const pendingDocs = documents.filter(doc => doc.status === 'pending');
  const reviewedDocs = documents.filter(doc => doc.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Проверка документов</h2>
        <Badge variant="secondary">
          {pendingDocs.length} на проверке
        </Badge>
      </div>

      {/* Pending Documents */}
      {pendingDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Ожидают проверки ({pendingDocs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingDocs.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={doc.tutor?.avatar_url} />
                      <AvatarFallback>
                        {doc.tutor?.first_name?.[0]}{doc.tutor?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {doc.tutor?.first_name} {doc.tutor?.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.tutor?.city || "Город не указан"}
                      </p>
                      <p className="text-sm font-medium">
                        {DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES] || doc.document_type}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>

                <div className="text-xs text-gray-500">
                  Загружено: {format(new Date(doc.submitted_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => downloadDocument(doc.file_path)}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Скачать
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedDoc(doc)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Проверить
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Review Modal */}
      {selectedDoc && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Проверка документа</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">
                {selectedDoc.tutor?.first_name} {selectedDoc.tutor?.last_name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {DOCUMENT_TYPES[selectedDoc.document_type as keyof typeof DOCUMENT_TYPES]}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Комментарий администратора:
              </label>
              <Textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Добавьте комментарий (необязательно)"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => handleVerification(selectedDoc.id, 'approved')}
                className="flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Одобрить
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleVerification(selectedDoc.id, 'rejected')}
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Отклонить
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedDoc(null);
                  setAdminComment('');
                }}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviewed Documents */}
      {reviewedDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История проверок</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviewedDocs.slice(0, 10).map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={doc.tutor?.avatar_url} />
                      <AvatarFallback>
                        {doc.tutor?.first_name?.[0]}{doc.tutor?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-medium">
                        {doc.tutor?.first_name} {doc.tutor?.last_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES]} • 
                        {doc.reviewed_at && ` ${format(new Date(doc.reviewed_at), 'dd.MM.yyyy', { locale: ru })}`}
                      </p>
                      {doc.admin_comment && (
                        <p className="text-xs text-gray-600 mt-1">{doc.admin_comment}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(doc.status)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {documents.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет документов</h3>
            <p className="text-muted-foreground">
              Загруженные репетиторами документы появятся здесь для проверки
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
