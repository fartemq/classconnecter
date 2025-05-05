
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export const ChatsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  
  useEffect(() => {
    if (user) {
      fetchConversations();
      
      // Set up realtime subscription for new messages
      const channel = supabase
        .channel('messages-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          if (payload.new) {
            // Refresh conversations when a new message arrives
            fetchConversations();
            
            // If we're viewing this conversation, also update the messages
            if (selectedConversation && 
                (payload.new.sender_id === selectedConversation || 
                 payload.new.receiver_id === selectedConversation)) {
              fetchMessages(selectedConversation);
              markMessagesAsRead(selectedConversation);
            }
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);
  
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);
  
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
        
        if (!conversationMap.has(otherUserId)) {
          const otherUserName = `${otherUser.first_name} ${otherUser.last_name || ''}`.trim();
          
          conversationMap.set(otherUserId, {
            id: message.id, // Using the latest message id as the conversation id
            otherUserId,
            otherUserName,
            otherUserAvatar: otherUser.avatar_url,
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
  
  const fetchMessages = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user!.id},receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.eq.${user!.id})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }
      
      setMessages(data || []);
    } catch (error) {
      console.error("Error in fetchMessages:", error);
    }
  };
  
  const markMessagesAsRead = async (studentId: string) => {
    try {
      // Mark all messages from this student as read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', studentId)
        .eq('receiver_id', user!.id)
        .eq('is_read', false);
      
      if (error) {
        console.error("Error marking messages as read:", error);
      } else {
        // Update conversation list to reflect read status
        setConversations(prev => 
          prev.map(conv => 
            conv.otherUserId === studentId 
              ? { ...conv, unread: false } 
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Error in markMessagesAsRead:", error);
    }
  };
  
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      setSendingMessage(true);
      
      const messageData = {
        sender_id: user!.id,
        receiver_id: selectedConversation,
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
      setSendingMessage(false);
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
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedConversationDetails = conversations.find(c => c.otherUserId === selectedConversation);
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Чаты с учениками</h2>
          <MessageSquare size={20} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversations List */}
          <div className="md:col-span-1 border-r pr-4">
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
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-md flex items-center ${
                      selectedConversation === conversation.otherUserId ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.otherUserId)}
                  >
                    <Avatar className="h-8 w-8 mr-3">
                      {conversation.otherUserAvatar ? (
                        <AvatarImage src={conversation.otherUserAvatar} alt={conversation.otherUserName} />
                      ) : (
                        <AvatarFallback>{conversation.otherUserName.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{conversation.otherUserName}</h4>
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                      <p className="text-xs truncate text-gray-600">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unread && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full ml-2"></div>
                    )}
                  </div>
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
                    <p className="mb-4">У вас пока нет активных чатов с учениками.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Message View */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <div className="flex flex-col h-[500px]">
                {/* Conversation Header */}
                <div className="border-b pb-3 mb-3">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-3">
                      {selectedConversationDetails?.otherUserAvatar ? (
                        <AvatarImage 
                          src={selectedConversationDetails.otherUserAvatar} 
                          alt={selectedConversationDetails.otherUserName} 
                        />
                      ) : (
                        <AvatarFallback>
                          {selectedConversationDetails?.otherUserName.charAt(0) || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{selectedConversationDetails?.otherUserName}</h4>
                      <p className="text-xs text-gray-500">Ученик</p>
                    </div>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 mb-3">
                  {messages.map((message) => {
                    const isUserMessage = message.sender_id === user?.id;
                    
                    return (
                      <div 
                        key={message.id} 
                        className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                      >
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
                    );
                  })}
                </div>
                
                {/* Message Input */}
                <div className="mt-auto border-t pt-3">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Введите сообщение..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                    >
                      {sendingMessage ? 
                        <Loader2 className="h-4 w-4 animate-spin" /> : 
                        <MessageSquare className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <MessageSquare size={48} className="mb-4 text-gray-300" />
                <p className="text-gray-500 mb-2">Выберите чат слева</p>
                <p className="text-gray-400 text-sm text-center max-w-xs">
                  или отправьте новое сообщение ученику через его профиль
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
