
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface Tutor {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
}

export const ChatConversation = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (user && tutorId) {
      fetchTutorDetails();
      fetchMessages();
      markMessagesAsRead();
      
      // Set up realtime subscription for new messages
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new && payload.new.sender_id === tutorId) {
            // Add new message from this tutor to the chat
            setMessages(prev => [...prev, payload.new as Message]);
            // Mark it as read since we're in the chat
            markMessageAsRead(payload.new.id);
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, tutorId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchTutorDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', tutorId)
        .eq('role', 'tutor')
        .single();
      
      if (error) {
        console.error("Error fetching tutor details:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные репетитора",
          variant: "destructive"
        });
        return;
      }
      
      setTutor(data);
    } catch (error) {
      console.error("Error in fetchTutorDetails:", error);
    }
  };
  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      if (!user || !tutorId) return;
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${tutorId}),and(sender_id.eq.${tutorId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Ошибка загрузки сообщений",
          description: "Пожалуйста, попробуйте еще раз позже",
          variant: "destructive"
        });
        return;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const markMessagesAsRead = async () => {
    try {
      if (!user || !tutorId) return;
      
      // Mark all messages from this tutor as read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', tutorId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);
      
      if (error) {
        console.error("Error marking messages as read:", error);
      }
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
    }
  };
  
  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) {
        console.error("Error marking message as read:", error);
      }
    } catch (error) {
      console.error("Error in markMessageAsRead:", error);
    }
  };
  
  const sendMessage = async () => {
    try {
      if (!newMessage.trim() || !user || !tutorId) return;
      
      setSending(true);
      
      const messageData = {
        sender_id: user.id,
        receiver_id: tutorId,
        subject: "Сообщение",
        content: newMessage.trim(),
        is_read: false
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(messageData);
      
      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Ошибка отправки",
          description: "Не удалось отправить сообщение",
          variant: "destructive"
        });
        return;
      }
      
      // Optimistically add message to state
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        ...messageData,
        created_at: new Date().toISOString()
      }]);
      
      setNewMessage("");
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };
  
  const shouldShowDate = (index: number, currentMsg: Message, prevMsg?: Message) => {
    if (index === 0) return true;
    
    if (prevMsg) {
      const currentDate = new Date(currentMsg.created_at).toDateString();
      const prevDate = new Date(prevMsg.created_at).toDateString();
      return currentDate !== prevDate;
    }
    
    return false;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!tutor) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Репетитор не найден</p>
        <Button 
          variant="outline" 
          onClick={() => navigate("/profile/student/chats")}
          className="mt-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Вернуться к списку чатов
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-[calc(100vh-20rem)]">
      <div className="flex items-center p-4 border-b">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/profile/student/chats")}
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <Avatar className="h-10 w-10 mr-3">
          {tutor.avatar_url ? (
            <AvatarImage src={tutor.avatar_url} alt={`${tutor.first_name} ${tutor.last_name || ''}`} />
          ) : (
            <AvatarFallback>{tutor.first_name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <h4 className="font-medium">{`${tutor.first_name} ${tutor.last_name || ''}`}</h4>
          <p className="text-sm text-gray-500">Репетитор</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isUserMessage = message.sender_id === user?.id;
          const prevMessage = index > 0 ? messages[index - 1] : undefined;
          const showDate = shouldShowDate(index, message, prevMessage);
          
          return (
            <div key={message.id} className="space-y-2">
              {showDate && (
                <div className="text-center text-sm text-gray-500 my-2">
                  {formatMessageDate(message.created_at)}
                </div>
              )}
              
              <div className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isUserMessage 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={`text-xs mt-1 ${isUserMessage ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                    {formatMessageTime(message.created_at)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button 
            type="submit"
            size="icon" 
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="h-auto"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
