
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);

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

  const validateForm = () => {
    if (!selectedUser) {
      setError('Выберите получателя сообщения');
      return false;
    }
    if (!content.trim()) {
      setError('Введите текст сообщения');
      return false;
    }
    return true;
  };

  const sendMessage = async () => {
    console.log('=== Начало отправки сообщения ===');
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSending(true);
    
    try {
      // Проверяем авторизацию
      const { data: currentUser, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Ошибка авторизации:', authError);
        throw new Error(`Ошибка авторизации: ${authError.message}`);
      }

      if (!currentUser.user) {
        throw new Error('Пользователь не авторизован');
      }

      console.log('Текущий пользователь:', currentUser.user.id);
      console.log('Получатель:', selectedUser!.id);
      console.log('Тема:', subject.trim() || 'Без темы');
      console.log('Содержание:', content.trim());

      // Отправляем сообщение напрямую в таблицу admin_messages
      const messageData = {
        admin_id: currentUser.user.id,
        recipient_id: selectedUser!.id,
        subject: subject.trim() || null,
        content: content.trim(),
        is_from_admin: true
      };

      console.log('Данные для отправки:', messageData);

      const { data: messageResult, error: messageError } = await supabase
        .from('admin_messages')
        .insert(messageData)
        .select()
        .single();

      if (messageError) {
        console.error('Ошибка при вставке в admin_messages:', messageError);
        throw new Error(`Ошибка базы данных: ${messageError.message}`);
      }

      console.log('Сообщение успешно создано:', messageResult);

      // Создаем уведомление получателю
      try {
        const notificationData = {
          user_id: selectedUser!.id,
          type: 'admin_message',
          title: 'Сообщение от администрации',
          message: subject.trim() || 'Вы получили новое сообщение от администрации',
          related_id: messageResult.id
        };

        console.log('Создаем уведомление:', notificationData);

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notificationData);

        if (notificationError) {
          console.error('Ошибка при создании уведомления:', notificationError);
          // Не прерываем процесс, так как сообщение уже отправлено
        } else {
          console.log('Уведомление успешно создано');
        }
      } catch (notificationError) {
        console.error('Ошибка при создании уведомления:', notificationError);
        // Не прерываем процесс
      }

      toast({
        title: "Сообщение отправлено",
        description: `Сообщение отправлено пользователю ${selectedUser!.first_name} ${selectedUser!.last_name}`
      });

      // Очищаем форму
      setSubject('');
      setContent('');
      setSelectedUser(null);
      onMessageSent();

    } catch (error: any) {
      console.error('Общая ошибка отправки сообщения:', error);
      const errorMessage = error.message || "Не удалось отправить сообщение";
      setError(errorMessage);
      toast({
        title: "Ошибка отправки",
        description: errorMessage,
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
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Получатель: <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedUser?.id || ''}
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              setSelectedUser(user || null);
              setError(null);
            }}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Сообщение: <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            placeholder="Введите ваше сообщение"
            rows={4}
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/1000 символов
          </div>
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
