
import React, { useEffect } from "react";
import { StudentScheduleView } from "./schedule/StudentScheduleView";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { subscribeToScheduleUpdates } from "@/services/scheduleNotificationService";
import { toast } from "@/hooks/use-toast";

export const ScheduleTab = () => {
  const { user } = useSimpleAuth();
  
  // Set up real-time schedule notifications
  useEffect(() => {
    if (!user?.id) return;
    
    const unsubscribe = subscribeToScheduleUpdates(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        toast({
          title: "Новое занятие",
          description: "Занятие было успешно добавлено в ваше расписание",
        });
      } else if (payload.eventType === 'UPDATE' && payload.new.status === 'confirmed') {
        toast({
          title: "Занятие подтверждено",
          description: "Репетитор подтвердил ваше занятие",
        });
      } else if (payload.eventType === 'UPDATE' && payload.new.status === 'canceled') {
        toast({
          title: "Занятие отменено",
          description: "Ваше занятие было отменено",
          variant: "destructive"
        });
      }
    });
      
    return unsubscribe;
  }, [user]);
  
  return <StudentScheduleView />;
};
