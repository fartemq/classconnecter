import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Phone, Video, Calendar, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LessonBookingModal } from "@/components/lesson/LessonBookingModal";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_name: string;
  sender_avatar?: string;
}

interface ChatInterfaceProps {
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: "tutor" | "student";
  subjects?: Array<{
    id: string;
    name: string;
    hourlyRate: number;
  }>;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  participantId,
  participantName,
  participantAvatar,
  participantRole,
  subjects = []
}) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загружаем сообщения
  const loadMessages = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          sender:sender_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        sender_name: msg.sender_id === user.id 
          ? 'Вы' 
          : `${(msg.sender as any)?.first_name || ''} ${(msg.sender as any)?.last_name || ''}`.trim() || 'Пользователь',
        sender_avatar: (msg.sender as any)?.avatar_url
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!user || !newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: participantId,
          content: newMessage.trim(),
          subject: null
        });

      if (error) throw error;

      // Добавляем сообщение локально для мгновенного отображения
      const newMsg: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender_id: user.id,
        created_at: new Date().toISOString(),
        sender_name: 'Вы'
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      
      // Прокручиваем к новому сообщению
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Подписываемся на новые сообщения
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${user?.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user?.id}))`
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, participantId]);

  // Прокручиваем к последнему сообщению при загрузке
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Заголовок чата */}
      <Card className="rounded-b-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={participantAvatar} />
                <AvatarFallback>
                  {participantName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{participantName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {participantRole === 'tutor' ? 'Репетитор' : 'Студент'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {participantRole === 'tutor' && subjects.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBookingModalOpen(true)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Урок
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem disabled>
                    <Phone className="h-4 w-4 mr-2" />
                    Голосовой звонок
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Video className="h-4 w-4 mr-2" />
                    Видеозвонок
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Область сообщений */}
      <Card className="flex-1 flex flex-col rounded-none">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground">
              Загрузка сообщений...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Начните разговор!</p>
              <p className="text-sm mt-2">
                {participantRole === 'tutor' 
                  ? 'Обсудите детали обучения и расписание уроков'
                  : 'Расскажите о своих целях обучения'
                }
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {format(new Date(message.created_at), 'HH:mm', { locale: ru })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Поле ввода */}
      <Card className="rounded-t-none">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[60px] resize-none"
              rows={2}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="lg"
              className="self-end"
            >
              {isSending ? (
                "..."
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно бронирования */}
      {participantRole === 'tutor' && (
        <LessonBookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          tutorId={participantId}
          tutorName={participantName}
          subjects={subjects}
          lessonType="trial"
        />
      )}
    </div>
  );
};