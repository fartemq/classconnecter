
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AdminMessage {
  id: string;
  admin_id: string;
  subject?: string;
  content: string;
  created_at: string;
  is_read?: boolean;
}

export const AdminMessagesDisplay = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      
      // Подписываемся на новые сообщения
      const channel = supabase
        .channel('admin_messages_updates')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_messages',
          filter: `recipient_id=eq.${user.id}`
        }, () => {
          fetchMessages();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchMessages = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching admin messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('admin_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return null;
  }

  const unreadCount = messages.filter(msg => !msg.is_read).length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Сообщения от администрации
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive">
              {unreadCount} новых
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {messages.slice(0, 3).map((message) => (
          <div 
            key={message.id} 
            className={`border rounded-lg p-3 ${!message.is_read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                {message.subject && (
                  <h4 className="font-medium text-sm mb-1">{message.subject}</h4>
                )}
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
              {!message.is_read && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsRead(message.id)}
                  className="ml-2"
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
            </div>
          </div>
        ))}
        
        {messages.length > 3 && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              И еще {messages.length - 3} сообщений...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
