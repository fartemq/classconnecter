
import React from "react";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { useParams } from "react-router-dom";
import { ChatConversation } from "@/components/profile/student/ChatConversation";

const StudentChatsPage = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  
  return tutorId ? <ChatConversation /> : <ChatsTab />;
};

export default StudentChatsPage;
