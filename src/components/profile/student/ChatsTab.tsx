
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Search } from "lucide-react";

export const ChatsTab = () => {
  // Mock data - would come from database in real app
  const conversations = [];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Чаты с репетиторами</CardTitle>
          <MessageSquare size={20} />
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};
