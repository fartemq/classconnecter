
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AccountTab } from "./tabs/AccountTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { PrivacyTab } from "./tabs/PrivacyTab";
import { HelpTab } from "./tabs/HelpTab";
import { LogoutTab } from "./tabs/LogoutTab";
import { Settings, Bell, Lock, HelpCircle, LogOut } from "lucide-react";

export const SettingsTabContent = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [notificationFrequency, setNotificationFrequency] = useState("realtime");

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Настройки аккаунта</h2>
        <Settings size={24} className="text-gray-600" />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          orientation="vertical" 
          className="w-full"
        >
          <div className="space-y-1 mb-6 md:mb-0 md:w-1/4">
            <TabsList className="flex flex-row md:flex-col bg-transparent p-0 h-auto">
              <TabsTrigger
                className="flex items-center gap-2 px-3 py-2 w-full justify-start text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-primary rounded-md"
                value="account"
              >
                <Settings size={18} />
                <span>Аккаунт</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 px-3 py-2 w-full justify-start text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-primary rounded-md"
                value="notifications"
              >
                <Bell size={18} />
                <span>Уведомления</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 px-3 py-2 w-full justify-start text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-primary rounded-md"
                value="privacy"
              >
                <Lock size={18} />
                <span>Приватность</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 px-3 py-2 w-full justify-start text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-primary rounded-md"
                value="help"
              >
                <HelpCircle size={18} />
                <span>Помощь</span>
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2 px-3 py-2 w-full justify-start text-gray-600 hover:text-red-500 data-[state=active]:bg-gray-100 data-[state=active]:text-red-500 rounded-md"
                value="logout"
              >
                <LogOut size={18} />
                <span>Выйти из аккаунта</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="md:w-3/4">
            <TabsContent value="account">
              <AccountTab />
            </TabsContent>
            <TabsContent value="notifications">
              <NotificationsTab 
                notificationFrequency={notificationFrequency}
                setNotificationFrequency={setNotificationFrequency}
              />
            </TabsContent>
            <TabsContent value="privacy">
              <PrivacyTab />
            </TabsContent>
            <TabsContent value="help">
              <HelpTab />
            </TabsContent>
            <TabsContent value="logout">
              <LogoutTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
