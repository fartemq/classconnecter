
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Search } from "lucide-react";

export const ChatsTab = () => {
  // Mock data - would come from database in real app
  const conversations = [];
  
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
          {/* Map through conversations here */}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="mb-4">У вас пока нет активных чатов с репетиторами.</p>
          <Button variant="outline" onClick={() => null}>
            Найти репетиторов
          </Button>
        </div>
      )}
    </div>
  );
};
