
import React from "react";
import { NotificationSettings } from "../NotificationSettings";

type NotificationsTabProps = {
  notificationFrequency: string;
  setNotificationFrequency: React.Dispatch<React.SetStateAction<string>>;
};

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  notificationFrequency, 
  setNotificationFrequency 
}) => {
  return (
    <div className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
      <NotificationSettings 
        notificationFrequency={notificationFrequency}
        setNotificationFrequency={setNotificationFrequency}
      />
    </div>
  );
};
