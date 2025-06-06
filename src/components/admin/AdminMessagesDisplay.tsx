
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AdminMessage {
  id: string;
  subject: string;
  content: string;
  created_at: string;
  is_from_admin: boolean;
}

export const AdminMessagesDisplay = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdminMessages();
    }
  }, [user]);

  const fetchAdminMessages = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_admin_messages_for_user', {
        user_id_param: user?.id
      });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching admin messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader size="sm" />
      </div>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">Сообщения от администрации</h3>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {messages.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {messages.map((message) => (
          <Card key={message.id} className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-yellow-800">Admin</span>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
                <span className="text-gray-600 font-normal">•</span>
                <span className="text-gray-600 font-normal">
                  {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                </span>
              </CardTitle>
              {message.subject && (
                <div className="text-sm font-medium text-gray-700">
                  {message.subject}
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-gray-700 whitespace-pre-wrap">
                {message.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
