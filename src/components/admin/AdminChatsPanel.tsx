
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MessageForm, MessagesList } from "./chats";

interface AdminMessage {
  id: string;
  admin_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  created_at: string;
  is_from_admin: boolean;
  recipient?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: string;
  };
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
}

export const AdminChatsPanel = () => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      // Сначала загружаем сообщения
      const { data: messagesData, error: messagesError } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Затем загружаем профили получателей отдельно
      if (messagesData && messagesData.length > 0) {
        const recipientIds = [...new Set(messagesData.map(msg => msg.recipient_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, avatar_url, role')
          .in('id', recipientIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Объединяем данные
        const messagesWithRecipients = messagesData.map(message => ({
          ...message,
          recipient: profilesData?.find(profile => profile.id === message.recipient_id) || {
            first_name: 'Неизвестный',
            last_name: 'пользователь',
            avatar_url: '',
            role: 'unknown'
          }
        }));

        setMessages(messagesWithRecipients);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, role')
        .neq('role', 'admin')
        .order('first_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleMessageSent = () => {
    fetchMessages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Чаты с пользователями</h2>
        <Badge variant="secondary">
          {messages.length} сообщений
        </Badge>
      </div>

      <MessageForm users={users} onMessageSent={handleMessageSent} />
      <MessagesList messages={messages} isLoading={isLoading} />
    </div>
  );
};
