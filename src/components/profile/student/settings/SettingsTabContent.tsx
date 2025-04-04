
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { NotificationSettings } from "./NotificationSettings";
import { PrivacySettings } from "./PrivacySettings";
import { HelpSection } from "./HelpSection";
import { toast } from "@/hooks/use-toast";

interface SettingsTabContentProps {
  activeTab: string;
  notificationFrequency: string;
  setNotificationFrequency: (value: string) => void;
}

export const SettingsTabContent = ({ 
  activeTab, 
  notificationFrequency, 
  setNotificationFrequency 
}: SettingsTabContentProps) => {
  const handleSaveSettings = () => {
    toast({
      title: "Настройки сохранены",
      description: "Ваши настройки были успешно обновлены",
      variant: "default",
    });
  };
  
  const handleResetSettings = () => {
    toast({
      title: "Настройки сброшены",
      description: "Ваши настройки были сброшены до значений по умолчанию",
      variant: "default",
    });
  };

  return (
    <>
      {activeTab === "notifications" && (
        <div className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <NotificationSettings 
            notificationFrequency={notificationFrequency} 
            setNotificationFrequency={setNotificationFrequency} 
          />
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button onClick={handleSaveSettings}>
              <Check className="mr-2 h-4 w-4" />
              Сохранить настройки
            </Button>
            <Button variant="outline" onClick={handleResetSettings}>
              Сбросить настройки
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === "privacy" && (
        <div className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <PrivacySettings />
          
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSaveSettings}>
              <Check className="mr-2 h-4 w-4" />
              Сохранить настройки
            </Button>
          </div>
        </div>
      )}
      
      {activeTab === "help" && (
        <div className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <HelpSection />
        </div>
      )}
    </>
  );
};
