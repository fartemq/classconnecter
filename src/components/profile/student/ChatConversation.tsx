import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, User } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export const ChatConversation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id && tutorId) {
      fetchMessages();

      // Subscribe to new messages
      const channel = supabase
        .channel('public:messages')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`
        }, (payload) => {
          console.log('Change received!', payload)
          fetchMessages();
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, tutorId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!user?.id || !tutorId) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${tutorId}),and(sender_id.eq.${tutorId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сообщения",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !tutorId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: tutorId,
          content: newMessage,
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  };

  const goBack = () => {
    navigate("/profile/student/chats");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        Loading messages...
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          <Button variant="ghost" onClick={goBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
          Чат с репетитором
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 relative">
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'
                }`}
            >
              <div
                className={`rounded-lg px-3 py-2 text-sm ${message.sender_id === user?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
                  }`}
              >
                {message.content}
              </div>
              <span className="text-xs text-gray-500 mt-1">
                {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Input
              type="text"
              placeholder="Напишите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-full py-2 px-3"
            />
            <Button
              onClick={handleSendMessage}
              className="rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
