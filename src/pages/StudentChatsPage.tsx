
import React, { useEffect } from "react";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { useParams, useNavigate } from "react-router-dom";
import { ChatConversation } from "@/components/profile/student/ChatConversation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const StudentChatsPage = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
  
  return tutorId ? <ChatConversation /> : <ChatsTab />;
};

export default StudentChatsPage;
