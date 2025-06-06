
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AdminMessage {
  id: string;
  admin_id: string;
  recipient_id: string;
  subject?: string;
  content: string;
  created_at: string;
  is_from_admin: boolean;
  recipient?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: string;
  };
}

interface MessagesListProps {
  messages: AdminMessage[];
  isLoading: boolean;
}

export const MessagesList = ({ messages, isLoading }: MessagesListProps) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'tutor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'tutor':
        return 'Репетитор';
      case 'student':
        return 'Ученик';
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          История отправленных сообщений
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Загрузка сообщений...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет сообщений</h3>
            <p className="text-muted-foreground">
              Отправленные сообщения появятся здесь
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={message.recipient?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {message.recipient?.first_name} {message.recipient?.last_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={getRoleBadgeColor(message.recipient?.role || '')}
                        >
                          {getRoleLabel(message.recipient?.role || '')}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(message.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {message.subject && (
                  <div>
                    <strong className="text-sm">Тема:</strong> {message.subject}
                  </div>
                )}

                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
