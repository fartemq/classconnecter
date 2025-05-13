
import React from "react";
import { ChatsTab } from "@/components/profile/student/ChatsTab";
import { ChatConversation } from "@/components/profile/student/ChatConversation";
import { useParams } from "react-router-dom";
import { StudentLayoutWithSidebar } from "@/components/profile/student/StudentLayoutWithSidebar";

const StudentChatsPage = () => {
  const { tutorId } = useParams();
  
  return (
    <StudentLayoutWithSidebar>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Сообщения</h1>
        {tutorId ? <ChatConversation /> : <ChatsTab />}
      </div>
    </StudentLayoutWithSidebar>
  );
};

export default StudentChatsPage;
