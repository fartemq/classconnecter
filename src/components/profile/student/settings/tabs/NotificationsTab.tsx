
import React from "react";
import { NotificationSettings } from "../NotificationSettings";
import { Card } from "@/components/ui/card";

export interface NotificationsTabProps {
  notificationFrequency: string;
  setNotificationFrequency: (value: string) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  notificationFrequency, 
  setNotificationFrequency 
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border">
      <Card className="p-6 shadow-sm">
        <NotificationSettings 
          notificationFrequency={notificationFrequency}
          setNotificationFrequency={setNotificationFrequency}
        />
      </Card>
    </div>
  );
};
