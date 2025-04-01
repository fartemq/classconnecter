
import React from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { MessageSquare, Search } from "lucide-react";

interface Conversation {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export const ChatsTab = () => {
  const navigate = useNavigate();
  
  // Mock data - would come from database in real app
  const conversations: Conversation[] = [];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Чаты с репетиторами</h2>
        <MessageSquare size={20} />
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Поиск чатов..." 
            className="pl-10"
          />
        </div>
      </div>
      
      {conversations && conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/chat/${conversation.tutorId}`)}
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  {conversation.tutorAvatar ? (
                    <AvatarImage src={conversation.tutorAvatar} alt={conversation.tutorName} />
                  ) : (
                    <AvatarFallback>{conversation.tutorName.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{conversation.tutorName}</h4>
                    <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                  </div>
                  <p className="text-sm truncate text-gray-600">{conversation.lastMessage}</p>
                </div>
                {conversation.unread && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full ml-2"></div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="mb-4">У вас пока нет активных чатов с репетиторами.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate("/tutors")}
            className="flex items-center mx-auto"
          >
            <Search size={16} className="mr-2" />
            Найти репетиторов
          </Button>
        </div>
      )}
    </div>
  );
};
