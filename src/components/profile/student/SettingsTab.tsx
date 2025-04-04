
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Lock, HelpCircle, Check } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { Toggle } from "@/components/ui/toggle"; 
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const SettingsTab = () => {
  const { user } = useAuth();
  const [notificationFrequency, setNotificationFrequency] = React.useState("daily");
  
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
          <TabsTrigger value="help" className="flex items-center px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <HelpCircle size={16} className="mr-2" />
            Помощь
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <div>
            <h3 className="text-lg font-medium mb-4">Способы получения уведомлений</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
                <div>
                  <Label htmlFor="email-notifications" className="font-medium">
                    Email уведомления
                  </Label>
                  <p className="text-sm text-gray-500">
                    Получать уведомления на email {user?.email}
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
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button onClick={handleSaveSettings}>
              <Check className="mr-2 h-4 w-4" />
              Сохранить настройки
            </Button>
            <Button variant="outline" onClick={handleResetSettings}>
              Сбросить настройки
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <div>
            <h3 className="text-lg font-medium mb-4">Видимость профиля</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
                <div>
                  <Label htmlFor="profile-visible" className="font-medium">
                    Видимость профиля
                  </Label>
                  <p className="text-sm text-gray-500">
                    Сделать ваш профиль видимым для репетиторов
                  </p>
                </div>
                <Switch id="profile-visible" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
                <div>
                  <Label htmlFor="show-phone" className="font-medium">
                    Показывать номер телефона
                  </Label>
                  <p className="text-sm text-gray-500">
                    Показывать номер телефона репетиторам
                  </p>
                </div>
                <Switch id="show-phone" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
                <div>
                  <Label htmlFor="show-email" className="font-medium">
                    Показывать email
                  </Label>
                  <p className="text-sm text-gray-500">
                    Показывать email репетиторам
                  </p>
                </div>
                <Switch id="show-email" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">История активности</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
                <div>
                  <Label htmlFor="activity-history" className="font-medium">
                    История поиска
                  </Label>
                  <p className="text-sm text-gray-500">
                    Сохранять историю поиска репетиторов
                  </p>
                </div>
                <Switch id="activity-history" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-md bg-blue-50">
                <div>
                  <Label htmlFor="viewed-profiles" className="font-medium">
                    Просмотренные профили
                  </Label>
                  <p className="text-sm text-gray-500">
                    Сохранять историю просмотренных профилей репетиторов
                  </p>
                </div>
                <Switch id="viewed-profiles" defaultChecked />
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                Очистить историю активности
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSaveSettings}>
              <Check className="mr-2 h-4 w-4" />
              Сохранить настройки
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="help" className="space-y-8 p-4 bg-white rounded-lg shadow-sm border">
          <div>
            <h3 className="text-lg font-medium mb-4">Часто задаваемые вопросы</h3>
            
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-blue-50">
                <h4 className="font-medium">Как найти репетитора?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Для поиска репетитора перейдите в раздел "Найти репетитора" и используйте фильтры для уточнения поиска. 
                  Вы можете фильтровать по предмету, цене, рейтингу и другим параметрам.
                </p>
              </div>
              
              <div className="p-3 rounded-md bg-blue-50">
                <h4 className="font-medium">Как записаться на занятие?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Выберите репетитора, перейдите в его профиль и нажмите кнопку "Записаться на занятие". 
                  Затем выберите удобное время в расписании репетитора и отправьте запрос.
                </p>
              </div>
              
              <div className="p-3 rounded-md bg-blue-50">
                <h4 className="font-medium">Как оплатить занятие?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  После подтверждения занятия репетитором, вы получите уведомление с инструкцией по оплате. 
                  Оплату можно произвести банковской картой, электронными деньгами или другими способами, указанными в инструкции.
                </p>
              </div>
              
              <div className="p-3 rounded-md bg-blue-50">
                <h4 className="font-medium">Как отменить занятие?</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Для отмены занятия перейдите в раздел "Расписание", найдите нужное занятие и нажмите кнопку "Отменить". 
                  Обратите внимание, что отмена за менее чем 24 часа до начала занятия может повлечь штрафные санкции.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Связаться с поддержкой</h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Если у вас есть вопросы или проблемы, которые не решаются с помощью FAQ, 
                вы можете связаться с нашей службой поддержки одним из следующих способов:
              </p>
              
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
                  </svg>
                  Написать на email: support@stud.rep
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z" />
                  </svg>
                  Позвонить: +7 (800) 123-45-67
                </Button>
                <Button variant="outline" className="justify-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                  </svg>
                  Открыть чат с поддержкой
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

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

import { CalendarClock, MessageSquare } from "lucide-react";
