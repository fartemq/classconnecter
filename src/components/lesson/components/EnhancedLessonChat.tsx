
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Pin, 
  MessageSquare, 
  HelpCircle,
  Filter,
  Search,
  MoreHorizontal,
  Check,
  CheckCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EnhancedLessonChatProps {
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

export const EnhancedLessonChat = ({ lessonId }: EnhancedLessonChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'chat' | 'question' | 'pinned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

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
          fetchMessages();
          if (payload.new.sender_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
          }
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
      setUnreadCount(0);
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

  const getFilteredMessages = () => {
    let filtered = messages;
    
    if (filter !== 'all') {
      if (filter === 'pinned') {
        filtered = messages.filter(msg => msg.is_pinned);
      } else {
        filtered = messages.filter(msg => msg.message_type === filter);
      }
    }
    
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'border-l-blue-500 bg-blue-50';
      case 'answer': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-3 w-3 text-blue-600" />;
      case 'answer': return <CheckCheck className="h-3 w-3 text-green-600" />;
      default: return <MessageSquare className="h-3 w-3 text-gray-600" />;
    }
  };

  const filteredMessages = getFilteredMessages();
  
  const messageStats = {
    total: messages.length,
    questions: messages.filter(m => m.message_type === 'question').length,
    pinned: messages.filter(m => m.is_pinned).length
  };

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Header with Stats and Filters */}
      <div className="border-b p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">Чат и вопросы</h3>
            <div className="flex space-x-2">
              <Badge variant="outline" className="text-xs">
                {messageStats.total} сообщений
              </Badge>
              <Badge variant="outline" className="text-xs text-blue-600">
                {messageStats.questions} вопросов
              </Badge>
              {messageStats.pinned > 0 && (
                <Badge variant="outline" className="text-xs text-yellow-600">
                  {messageStats.pinned} закреплено
                </Badge>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount} новых
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск сообщений..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filter === 'all' ? 'Все' : 
                 filter === 'chat' ? 'Чат' :
                 filter === 'question' ? 'Вопросы' : 'Закрепленные'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                Все сообщения
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('chat')}>
                Обычные сообщения
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('question')}>
                Вопросы
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pinned')}>
                Закрепленные
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>
              {searchTerm ? 'Сообщений не найдено' : 
               filter === 'question' ? 'Вопросов пока нет' :
               filter === 'pinned' ? 'Закрепленных сообщений нет' :
               'Начните общение'}
            </p>
          </div>
        ) : (
          filteredMessages.map(message => (
            <div
              key={message.id}
              className={`border-l-4 p-3 rounded-r-lg transition-all ${getMessageTypeColor(message.message_type)} ${
                message.is_pinned ? 'ring-2 ring-yellow-300' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.sender?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {message.sender?.first_name?.[0]}{message.sender?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {message.sender?.first_name} {message.sender?.last_name}
                  </span>
                  {getMessageTypeIcon(message.message_type)}
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => togglePin(message.id, message.is_pinned)}
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      {message.is_pinned ? 'Открепить' : 'Закрепить'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.is_pinned && (
                <div className="flex items-center mt-2 text-xs text-yellow-700">
                  <Pin className="h-3 w-3 mr-1" />
                  Закреплено
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="border-t p-3 bg-white">
        <div className="flex space-x-2 mb-2">
          <Button
            variant={filter === 'question' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filter === 'question' ? 'all' : 'question')}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Вопрос
          </Button>
          <Button
            variant={filter === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filter === 'chat' ? 'all' : 'chat')}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Сообщение
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              filter === 'question' ? 'Задать вопрос...' : 'Написать сообщение...'
            }
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(filter === 'question' ? 'question' : 'chat');
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage(filter === 'question' ? 'question' : 'chat')}
            disabled={!newMessage.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
