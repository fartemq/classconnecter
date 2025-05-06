
import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { useParams, useNavigate } from "react-router-dom";
import { ChatConversation } from "@/components/profile/student/ChatConversation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";
import { Card } from "@/components/ui/card";

const StudentChatsPage = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLoading } = useProfile("student");
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы использовать чат",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [user, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
        </main>
        <Footer className="py-2" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            {tutorId ? "Чат с репетитором" : "Сообщения"}
          </h1>
          
          <Card className="shadow-md border-none p-4">
            {tutorId ? <ChatConversation /> : <ChatsTab />}
          </Card>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentChatsPage;
