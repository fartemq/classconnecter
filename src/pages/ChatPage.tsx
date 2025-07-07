import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Calendar, Video } from "lucide-react";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_name: string;
}

const ChatPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  
  const [tutor, setTutor] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!user || !tutorId) return;
    
    fetchTutorInfo();
    fetchMessages();
  }, [user, tutorId]);

  const fetchTutorInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .eq("id", tutorId)
        .single();

      if (error) throw error;
      setTutor(data);
    } catch (error) {
      console.error("Error fetching tutor:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию о репетиторе",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, you would fetch from a messages table
      // For now, we'll create a mock conversation
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Здравствуйте! Меня интересуют уроки математики.",
          sender_id: user?.id || "",
          created_at: new Date(Date.now() - 3600000).toISOString(),
          sender_name: "Вы"
        },
        {
          id: "2", 
          content: "Добро пожаловать! Буду рад помочь вам с математикой. Какой у вас уровень подготовки?",
          sender_id: tutorId || "",
          created_at: new Date(Date.now() - 1800000).toISOString(),
          sender_name: tutor?.first_name || "Репетитор"
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    
    setIsSending(true);
    try {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: user.id,
        created_at: new Date().toISOString(),
        sender_name: "Вы"
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage("");
      
      toast({
        title: "Сообщение отправлено",
        description: "Репетитор получит уведомление о новом сообщении"
      });
    } catch (error) {
      console.error("Error sending message:", error);
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">Требуется авторизация</h2>
              <p className="text-muted-foreground mb-4">
                Для общения с репетиторами необходимо войти в систему
              </p>
              <Button onClick={() => navigate("/login")}>
                Войти в систему
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Chat Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Button>
                
                {tutor && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={tutor.avatar_url} />
                      <AvatarFallback>
                        {tutor.first_name?.charAt(0)}{tutor.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-xl font-semibold">
                        {tutor.first_name} {tutor.last_name}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        Репетитор
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Записаться на урок
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    Видеозвонок
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center text-muted-foreground">
                    Загрузка сообщений...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground">
                    <p>Начните разговор с репетитором!</p>
                    <p className="text-sm mt-2">
                      Обсудите детали обучения, расписание и стоимость уроков
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === user?.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.created_at).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Textarea
                  placeholder="Напишите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 min-h-[60px] resize-none"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="lg"
                  className="self-end"
                >
                  {isSending ? (
                    "Отправка..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;