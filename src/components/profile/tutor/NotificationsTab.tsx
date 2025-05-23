
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const NotificationsTab = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(user?.id);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lesson_request':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'lesson_confirmed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'lesson_rejected':
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Уведомления</h2>
          {unreadCount > 0 && (
            <p className="text-muted-foreground">
              У вас {unreadCount} непрочитанных уведомлений
            </p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Отметить все как прочитанные
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет уведомлений</h3>
            <p className="text-gray-500">
              Здесь будут отображаться уведомления о запросах на занятия и других важных событиях
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-colors ${
                notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {getNotificationIcon(notification.type)}
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <div className="flex items-center space-x-2">
                        {!notification.is_read && (
                          <Badge variant="default" className="text-xs">
                            Новое
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'd MMM, HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
