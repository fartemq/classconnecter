
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Pin, 
  MessageSquare, 
  HelpCircle,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LessonChatProps {
  lessonId: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_pinned: boolean;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const LessonChat = ({ lessonId }: LessonChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    subscribeToMessages();
  }, [lessonId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('lesson_chat')
        .select(`
          *,
          sender:profiles!sender_id(first_name, last_name, avatar_url)
        `)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`lesson_chat:${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_chat',
          filter: `lesson_id=eq.${lessonId}`
        },
        (payload) => {
          fetchMessages(); // Refetch to get sender info
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (type: string = 'chat') => {
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('lesson_chat')
        .insert({
          lesson_id: lessonId,
          sender_id: user?.id,
          content: newMessage,
          message_type: type
        });

      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const togglePin = async (messageId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('lesson_chat')
        .update({ is_pinned: !isPinned })
        .eq('id', messageId);

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_pinned: !isPinned } : msg
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessagesByType = (type: string) => {
    return messages.filter(msg => msg.message_type === type);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'answer': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'text-blue-600';
      case 'answer': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const MessageList = ({ messageType }: { messageType: string }) => {
    const filteredMessages = getMessagesByType(messageType);
    
    return (
      <div className="flex-1 overflow-auto space-y-3 mb-4">
        {filteredMessages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
              message.sender_id === user?.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.sender?.avatar_url} />
                    <AvatarFallback>
                      {message.sender?.first_name?.[0]}{message.sender?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">
                    {message.sender?.first_name} {message.sender?.last_name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  {message.is_pinned && (
                    <Pin className="h-3 w-3" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(message.id, message.is_pinned)}
                    className="h-6 w-6 p-0"
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm">{message.content}</p>
              
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.created_at).toLocaleTimeString('ru-RU')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Чат</span>
            <Badge variant="secondary" className="ml-1">
              {getMessagesByType('chat').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center space-x-2">
            <HelpCircle className="h-4 w-4" />
            <span>Вопросы</span>
            <Badge variant="secondary" className="ml-1">
              {getMessagesByType('question').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pinned" className="flex items-center space-x-2">
            <Pin className="h-4 w-4" />
            <span>Закрепленные</span>
            <Badge variant="secondary" className="ml-1">
              {messages.filter(m => m.is_pinned).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          <MessageList messageType="chat" />
        </TabsContent>

        <TabsContent value="questions" className="flex-1 flex flex-col">
          <MessageList messageType="question" />
        </TabsContent>

        <TabsContent value="pinned" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto space-y-3 mb-4">
            {messages.filter(msg => msg.is_pinned).map(message => (
              <div key={message.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getMessageTypeColor(message.message_type)}>
                      {getMessageTypeIcon(message.message_type)}
                      <span className="ml-1">
                        {message.message_type === 'question' ? 'Вопрос' : 
                         message.message_type === 'answer' ? 'Ответ' : 'Сообщение'}
                      </span>
                    </Badge>
                    <span className="text-sm font-medium">
                      {message.sender?.first_name} {message.sender?.last_name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(message.id, true)}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm">{message.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Message Input */}
      <div className="border-t pt-3">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              activeTab === 'questions' ? 'Задать вопрос...' : 'Написать сообщение...'
            }
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage(activeTab === 'questions' ? 'question' : 'chat');
              }
            }}
          />
          <Button 
            onClick={() => sendMessage(activeTab === 'questions' ? 'question' : 'chat')}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
