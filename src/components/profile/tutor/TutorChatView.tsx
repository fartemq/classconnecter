import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, User } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  is_read: boolean;
}

interface StudentInfo {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  city?: string;
}

export const TutorChatView = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (studentId && user?.id) {
      fetchStudentInfo();
      fetchMessages();
      markMessagesAsRead();
    }
  }, [studentId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchStudentInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url, city')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      setStudentInfo(data);
    } catch (error) {
      console.error('Error fetching student info:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию об ученике",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

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

  const markMessagesAsRead = async () => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', studentId)
        .eq('receiver_id', user?.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !studentId || !user?.id) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: studentId,
          content: newMessage.trim(),
          is_read: false
        });

      if (error) throw error;

      setNewMessage("");
      await fetchMessages();
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleScheduleClick = () => {
    navigate(`/profile/tutor/schedule?student=${studentId}`);
  };

  const handleHomeworkClick = () => {
    navigate(`/profile/tutor/homework?student=${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/profile/tutor/chats')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к чатам
          </Button>
          
          {studentInfo && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={studentInfo.avatar_url} />
                <AvatarFallback>
                  {studentInfo.first_name[0]}{studentInfo.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">
                  {studentInfo.first_name} {studentInfo.last_name}
                </h1>
                {studentInfo.city && (
                  <p className="text-sm text-gray-500">{studentInfo.city}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleScheduleClick}>
              <Calendar className="h-4 w-4 mr-2" />
              Расписание
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleHomeworkClick}>
              <BookOpen className="h-4 w-4 mr-2" />
              Домашние задания
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat Area */}
      <Card className="h-[600px] flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Пока нет сообщений. Начните диалог!
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
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === user?.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(message.created_at), 'HH:mm', { locale: ru })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите сообщение..."
                disabled={isSending}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!newMessage.trim() || isSending}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
