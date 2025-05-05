
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Heart, MessageSquare, FileText, Settings, User, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Student navigation tabs
const studentTabs = [
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
  { name: "Репетиторы", path: "/profile/student/tutors", icon: Users },
  { name: "Избранное", path: "/profile/student/favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, notificationKey: "messages" },
  { name: "Домашние задания", path: "/profile/student/homework", icon: FileText },
  { name: "Настройки", path: "/profile/student/settings", icon: Settings },
  { name: "Мой профиль", path: "/profile/student/edit", icon: User },
];

export const StudentNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    messages: 0,
    requests: 0,
    total: 0
  });
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to realtime updates for messages and requests
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
      
      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      await Promise.all([
        fetchUnreadMessages()
      ]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
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
      
      setNotifications(prev => ({
        ...prev,
        messages: count || 0,
        total: (count || 0) + prev.requests
      }));
    } catch (error) {
      console.error("Error in fetchUnreadMessages:", error);
    }
  };
  
  // Function to check if a student tab is active
  const isStudentTabActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex items-center gap-4">
      {studentTabs.map((tab) => (
        <Link 
          key={tab.path}
          to={tab.path}
          className={`${
            isStudentTabActive(tab.path) 
              ? "text-primary font-medium bg-primary/10 shadow-sm" 
              : "text-gray-700 hover:bg-gray-100"
          } px-3 py-2 rounded-md flex items-center gap-2 transition-all relative`}
        >
          <tab.icon className="h-4 w-4" />
          <span>{tab.name}</span>
          
          {tab.notificationKey && notifications[tab.notificationKey as keyof typeof notifications] > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {notifications[tab.notificationKey as keyof typeof notifications]}
            </Badge>
          )}
        </Link>
      ))}
    </div>
  );
};
