
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, Lock, HelpCircle, User } from "lucide-react";
import { NotificationSettings } from "./NotificationSettings";
import { PrivacySettings } from "./PrivacySettings";
import { HelpSection } from "./HelpSection";
import { AccountSettings } from "./AccountSettings";

export const SettingsTabContent = () => {
  const [notificationFrequency, setNotificationFrequency] = useState<string>("realtime");
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Настройки</h2>
      </div>
      
      <Tabs defaultValue="notifications" className="space-y-6 w-full">
        <TabsList className="mb-6 p-1 w-full flex justify-start space-x-2 bg-muted/60 overflow-x-auto">
          <TabsTrigger value="notifications" className="flex items-center px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bell size={16} className="mr-2" />
            Уведомления
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Lock size={16} className="mr-2" />
            Приватность
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User size={16} className="mr-2" />
            Аккаунт
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <HelpCircle size={16} className="mr-2" />
            Помощь
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <NotificationSettings 
            notificationFrequency={notificationFrequency}
            setNotificationFrequency={setNotificationFrequency}
          />
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <PrivacySettings />
        </TabsContent>
        
        <TabsContent value="account" className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <AccountSettings />
        </TabsContent>
        
        <TabsContent value="help" className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <HelpSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
