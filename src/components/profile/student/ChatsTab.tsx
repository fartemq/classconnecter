import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MessageSquare, Search, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface MessageData {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
  receiver: {
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
  };
}

export const ChatsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);
  
  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Get all messages where the current user is either sender or receiver
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          subject,
          content,
          is_read,
          created_at,
          sender_id,
          sender:profiles!sender_id(first_name, last_name, avatar_url),
          receiver_id,
          receiver:profiles!receiver_id(first_name, last_name, avatar_url)
        `)
        .or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`)
        .order('created_at', { ascending: false });
      
      if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        toast({
          title: "Ошибка загрузки сообщений",
          description: "Пожалуйста, попробуйте еще раз позже",
          variant: "destructive"
        });
        return;
      }
      
      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();
      
      messagesData.forEach(message => {
        // Determine the other user in the conversation
        const isUserSender = message.sender_id === user!.id;
        const otherUserId = isUserSender ? message.receiver_id : message.sender_id;
        const otherUser = isUserSender ? message.receiver : message.sender;
        
        if (!conversationMap.has(otherUserId) && otherUser) {
          const otherUserName = `${otherUser.first_name || ''} ${otherUser.last_name || ''}`.trim();
          
          conversationMap.set(otherUserId, {
            id: message.id, // Using the latest message id as the conversation id
            otherUserId,
            otherUserName,
            otherUserAvatar: otherUser.avatar_url || undefined,
            lastMessage: message.content,
            timestamp: formatTimestamp(message.created_at),
            unread: !isUserSender && !message.is_read
          });
        }
      });
      
      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error("Error in fetchConversations:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить чаты",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (diff < dayInMs) {
      // Today, show time
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 2 * dayInMs) {
      // Yesterday
      return 'Вчера';
    } else {
      // Earlier, show date
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    }
  };
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Чаты с репетиторами</h2>
        <MessageSquare size={20} />
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Поиск чатов..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredConversations.length > 0 ? (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/profile/student/chats/${conversation.otherUserId}`)}
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  {conversation.otherUserAvatar ? (
                    <AvatarImage src={conversation.otherUserAvatar} alt={conversation.otherUserName} />
                  ) : (
                    <AvatarFallback>{conversation.otherUserName.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{conversation.otherUserName}</h4>
                    <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                  </div>
                  <p className="text-sm truncate text-gray-600">{conversation.lastMessage}</p>
                </div>
                {conversation.unread && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full ml-2"></div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? (
            <div>
              <XCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-4">По запросу «{searchTerm}» ничего не найдено</p>
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="flex items-center mx-auto"
              >
                Сбросить поиск
              </Button>
            </div>
          ) : (
            <div>
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-4">У вас пока нет активных чатов с репетиторами.</p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/tutors")}
                className="flex items-center mx-auto"
              >
                <Search size={16} className="mr-2" />
                Найти репетиторов
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
