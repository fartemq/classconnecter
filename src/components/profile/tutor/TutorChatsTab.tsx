
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Loader } from "@/components/ui/loader";

interface ChatPreview {
  id: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online: boolean;
}

export const TutorChatsTab = () => {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchChats();
    }
  }, [user?.id]);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      
      // Получаем уникальных студентов, с которыми есть переписка
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          sender_id,
          receiver_id,
          content,
          created_at,
          is_read,
          sender:profiles!sender_id(first_name, last_name, avatar_url),
          receiver:profiles!receiver_id(first_name, last_name, avatar_url)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Группируем сообщения по студентам
      const chatMap = new Map<string, ChatPreview>();
      
      messages?.forEach(message => {
        const isFromTutor = message.sender_id === user?.id;
        const studentId = isFromTutor ? message.receiver_id : message.sender_id;
        const studentData = isFromTutor ? message.receiver : message.sender;
        
        if (!chatMap.has(studentId)) {
          chatMap.set(studentId, {
            id: studentId,
            student_id: studentId,
            student_name: `${studentData?.first_name || ''} ${studentData?.last_name || ''}`.trim(),
            student_avatar: studentData?.avatar_url,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0,
            is_online: false // TODO: implement real online status
          });
        }
        
        // Считаем непрочитанные сообщения от студента
        if (!isFromTutor && !message.is_read) {
          const chat = chatMap.get(studentId)!;
          chat.unread_count++;
        }
      });

      setChats(Array.from(chatMap.values()));
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.student_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (studentId: string) => {
    navigate(`/profile/tutor/chats/${studentId}`);
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
      <div>
        <h1 className="text-2xl font-bold">Сообщения</h1>
        <p className="text-gray-600">Общайтесь со своими учениками</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Поиск по имени ученика..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredChats.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет сообщений</h3>
            <p className="text-gray-500">
              Когда ученики напишут вам, их сообщения появятся здесь
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredChats.map((chat) => (
            <Card 
              key={chat.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleChatClick(chat.student_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.student_avatar} />
                      <AvatarFallback>
                        {chat.student_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {chat.is_online && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{chat.student_name}</h3>
                      <div className="flex items-center space-x-2">
                        {chat.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {chat.unread_count}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {format(new Date(chat.last_message_time), 'HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {chat.last_message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
