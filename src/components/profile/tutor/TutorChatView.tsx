
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Calendar, 
  BookOpen,
  MessageSquare,
  Loader
} from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ensureSingleObject } from "@/utils/supabaseUtils";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  receiver_name: string;
}

export const TutorChatView = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (studentId && user) {
      fetchMessages(studentId, user.id);
    }
  }, [studentId, user]);

  useEffect(() => {
    // Scroll to the bottom when messages are updated
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (studentId: string, tutorId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:profiles!sender_id (
            first_name,
            last_name
          ),
          receiver:profiles!receiver_id (
            first_name,
            last_name
          )
        `)
        .or(`sender_id.eq.${tutorId},receiver_id.eq.${tutorId}`)
        .or(`sender_id.eq.${studentId},receiver_id.eq.${studentId}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      const formattedMessages = data?.map(msg => {
        const senderData = ensureSingleObject(msg.sender);
        const receiverData = ensureSingleObject(msg.receiver);
        
        return {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          sender_name: senderData?.first_name || 'Unknown',
          receiver_name: receiverData?.first_name || 'Unknown',
        };
      }) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !studentId || !user) return;

    try {
      const { data: senderData, error: senderError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();

      if (senderError) {
        console.error("Error fetching sender's name:", senderError);
        return;
      }

      const senderName = senderData?.first_name || 'Unknown';

      const { data, error } = await supabase
        .from('messages')
        .insert([
          { 
            content: newMessage, 
            sender_id: user.id, 
            receiver_id: studentId,
            subject: 'New Message'
          }
        ])
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          sender:profiles!sender_id (
            first_name,
            last_name
          ),
          receiver:profiles!receiver_id (
            first_name,
            last_name
          )
        `)
        .single();

      if (error) {
        console.error("Error sending message:", error);
        return;
      }

      const senderDataResult = ensureSingleObject(data.sender);
      const receiverDataResult = ensureSingleObject(data.receiver);

      const formattedMessage = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        sender_name: senderDataResult?.first_name || 'Unknown',
        receiver_name: receiverDataResult?.first_name || 'Unknown',
      };

      setMessages(prevMessages => [...prevMessages, formattedMessage]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const navigateToSchedule = () => {
    if (studentId) {
      navigate(`/profile/tutor/schedule?studentId=${studentId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Чат со студентом</h2>
        </div>
        
        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={navigateToSchedule}
              className="flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Расписание
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Домашнее задание
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Отправить сообщение
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}
          >
            <div className="text-xs text-gray-500">
              {message.sender_id === user?.id ? 'Вы' : message.sender_name}
            </div>
            <div
              className={`rounded-lg py-2 px-3 max-w-[70%] ${message.sender_id === user?.id ? 'bg-blue-100 text-right' : 'bg-gray-100'
                }`}
            >
              {message.content}
              <div className="text-xs text-gray-500 mt-1">
                {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Напишите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
