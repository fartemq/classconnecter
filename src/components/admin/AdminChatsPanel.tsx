
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select(`
          *,
          recipient:profiles!recipient_id (first_name, last_name, avatar_url, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
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

      // Используем прямую вставку в таблицу вместо RPC функции
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
      fetchMessages();
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'tutor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Чаты с пользователями</h2>
        <Badge variant="secondary">
          {messages.length} сообщений
        </Badge>
      </div>

      {/* Отправка нового сообщения */}
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

      {/* История сообщений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            История отправленных сообщений
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка сообщений...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Нет сообщений</h3>
              <p className="text-muted-foreground">
                Отправленные сообщения появятся здесь
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={message.recipient?.avatar_url} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {message.recipient?.first_name} {message.recipient?.last_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getRoleBadgeColor(message.recipient?.role || '')}
                          >
                            {getRoleLabel(message.recipient?.role || '')}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {message.subject && (
                    <div>
                      <strong className="text-sm">Тема:</strong> {message.subject}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
