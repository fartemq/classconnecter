
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, UserCheck, Clock, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const NotificationsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up realtime subscription for new messages and requests
      const messagesChannel = supabase
        .channel('unread-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, () => {
          fetchUnreadMessages();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, () => {
          fetchUnreadMessages();
        })
        .subscribe();
      
      const requestsChannel = supabase
        .channel('pending-requests')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'student_requests',
          filter: `student_id=eq.${user.id}`
        }, () => {
          fetchPendingRequests();
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'student_requests',
          filter: `student_id=eq.${user.id}`
        }, () => {
          fetchPendingRequests();
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(requestsChannel);
      };
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUnreadMessages(),
        fetchPendingRequests()
      ]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUnreadMessages = async () => {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user!.id)
        .eq('is_read', false);
      
      if (error) {
        console.error("Error fetching unread messages:", error);
        return;
      }
      
      setUnreadMessages(count || 0);
    } catch (error) {
      console.error("Error in fetchUnreadMessages:", error);
    }
  };
  
  const fetchPendingRequests = async () => {
    try {
      const { count, error } = await supabase
        .from('student_requests')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user!.id)
        .eq('status', 'pending');
      
      if (error) {
        console.error("Error fetching pending requests:", error);
        return;
      }
      
      setPendingRequests(count || 0);
    } catch (error) {
      console.error("Error in fetchPendingRequests:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  const hasNotifications = unreadMessages > 0 || pendingRequests > 0;
  
  return (
    <Card className={hasNotifications ? "border-primary/30" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Уведомления
          </h3>
          {hasNotifications && (
            <Badge className="bg-primary">{unreadMessages + pendingRequests}</Badge>
          )}
        </div>
        
        {hasNotifications ? (
          <div className="space-y-2">
            {unreadMessages > 0 && (
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <p className="text-sm">У вас {unreadMessages} непрочитанных сообщений</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/profile/student/chats")}
                >
                  Просмотр
                </Button>
              </div>
            )}
            
            {pendingRequests > 0 && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                  <div>
                    <p className="text-sm">{pendingRequests} запросов от репетиторов ожидают ответа</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/profile/student/tutors?tab=requests")}
                >
                  Ответить
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">У вас нет новых уведомлений</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
