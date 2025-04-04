
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Bell, CalendarClock, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Helper components for notifications
const NotificationOption = ({ id, label, description, defaultChecked = false }) => (
  <div className="flex items-center space-x-4 p-2 rounded hover:bg-blue-50">
    <Checkbox id={id} defaultChecked={defaultChecked} />
    <div className="grid gap-0.5">
      <Label htmlFor={id} className="font-medium">
        {label}
      </Label>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

const CalendarNotifications = () => (
  <div className="flex items-center gap-2">
    <CalendarClock className="h-4 w-4 text-blue-500" />
    <span className="font-medium">Уведомления о занятиях</span>
  </div>
);

const MessageNotifications = () => (
  <div className="flex items-center gap-2">
    <MessageSquare className="h-4 w-4 text-green-500" />
    <span className="font-medium">Уведомления о сообщениях</span>
  </div>
);

const SystemNotifications = () => (
  <div className="flex items-center gap-2">
    <Bell className="h-4 w-4 text-amber-500" />
    <span className="font-medium">Системные уведомления</span>
  </div>
);

interface NotificationSettingsProps {
  notificationFrequency: string;
  setNotificationFrequency: (value: string) => void;
}

export const NotificationSettings = ({ 
  notificationFrequency, 
  setNotificationFrequency 
}: NotificationSettingsProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Способы получения уведомлений</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">
                Email уведомления
              </Label>
              <p className="text-sm text-gray-500">
                Получать уведомления на email
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
            <div>
              <Label htmlFor="sms-notifications" className="font-medium">
                SMS уведомления
              </Label>
              <p className="text-sm text-gray-500">
                Получать уведомления по SMS
              </p>
            </div>
            <Switch id="sms-notifications" />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
            <div>
              <Label htmlFor="browser-notifications" className="font-medium">
                Уведомления в браузере
              </Label>
              <p className="text-sm text-gray-500">
                Получать уведомления через браузер
              </p>
            </div>
            <Switch id="browser-notifications" defaultChecked />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Частота уведомлений</h3>
        <ToggleGroup 
          type="single" 
          value={notificationFrequency} 
          onValueChange={(value) => {
            if (value) setNotificationFrequency(value);
          }}
          className="flex flex-wrap gap-2"
          variant="outline"
        >
          <ToggleGroupItem value="realtime" className="px-4">
            В реальном времени
          </ToggleGroupItem>
          <ToggleGroupItem value="daily" className="px-4">
            Ежедневно
          </ToggleGroupItem>
          <ToggleGroupItem value="weekly" className="px-4">
            Еженедельно
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Типы уведомлений</h3>
        
        <Collapsible className="w-full space-y-2">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-3 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex items-center">
              <CalendarNotifications />
            </div>
            <div>
              <Bell className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-6 pt-2">
            <NotificationOption 
              id="upcoming-lessons" 
              label="Предстоящие занятия"
              description="Напоминания о занятиях, запланированных на ближайшее время"
              defaultChecked
            />
            <NotificationOption 
              id="lesson-changes" 
              label="Изменения в расписании" 
              description="Уведомления об изменениях или отмене занятий"
              defaultChecked
            />
            <NotificationOption 
              id="lesson-reminders" 
              label="Напоминания о занятиях" 
              description="За 1 час и за 1 день до занятия"
              defaultChecked
            />
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible className="w-full space-y-2">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-3 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex items-center">
              <MessageNotifications />
            </div>
            <div>
              <Bell className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-6 pt-2">
            <NotificationOption 
              id="new-messages" 
              label="Новые сообщения"
              description="Уведомления о новых сообщениях от репетиторов"
              defaultChecked
            />
            <NotificationOption 
              id="message-replies" 
              label="Ответы на сообщения"
              description="Уведомления об ответах на ваши сообщения" 
              defaultChecked
            />
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible className="w-full space-y-2">
          <CollapsibleTrigger className="flex w-full items-center justify-between p-3 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
            <div className="flex items-center">
              <SystemNotifications />
            </div>
            <div>
              <Bell className="h-4 w-4" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pl-6 pt-2">
            <NotificationOption 
              id="system-updates" 
              label="Обновления системы" 
              description="Уведомления о важных изменениях в работе сервиса"
            />
            <NotificationOption 
              id="special-offers" 
              label="Специальные предложения" 
              description="Информация о скидках и акциях"
            />
            <NotificationOption 
              id="newsletters" 
              label="Новостная рассылка" 
              description="Регулярные обновления о новых функциях и событиях"
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
