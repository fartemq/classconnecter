
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
}

interface MessageFormProps {
  users: User[];
  onMessageSent: () => void;
}

export const MessageForm = ({ users, onMessageSent }: MessageFormProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tutor':
        return 'Репетитор';
      case 'student':
        return 'Ученик';
      default:
        return role;
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || !content.trim()) {
      toast({
        title: "Ошибка",
        description: "Выберите получателя и введите сообщение",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      console.log('Отправка сообщения:', {
        recipient_id: selectedUser.id,
        subject: subject.trim() || null,
        content: content.trim()
      });

      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        throw new Error('Пользователь не авторизован');
      }

      const { data, error } = await supabase
        .from('admin_messages')
        .insert({
          admin_id: currentUser.user.id,
          recipient_id: selectedUser.id,
          subject: subject.trim() || null,
          content: content.trim(),
          is_from_admin: true
        })
        .select()
        .single();

      if (error) {
        console.error('Ошибка при отправке сообщения:', error);
        throw error;
      }

      console.log('Сообщение успешно отправлено:', data);

      toast({
        title: "Сообщение отправлено",
        description: `Сообщение отправлено пользователю ${selectedUser.first_name} ${selectedUser.last_name}`
      });

      setSubject('');
      setContent('');
      setSelectedUser(null);
      onMessageSent();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-600" />
          Отправить сообщение пользователю
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Получатель:
          </label>
          <select
            value={selectedUser?.id || ''}
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              setSelectedUser(user || null);
            }}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Выберите пользователя</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({getRoleLabel(user.role)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Тема (необязательно):
          </label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Введите тему сообщения"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Сообщение:
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Введите ваше сообщение"
            rows={4}
          />
        </div>

        <Button 
          onClick={sendMessage} 
          disabled={isSending || !selectedUser || !content.trim()}
          className="w-full"
        >
          {isSending ? 'Отправка...' : 'Отправить сообщение'}
        </Button>
      </CardContent>
    </Card>
  );
};
