
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Lock, HelpCircle } from "lucide-react";

export const SettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Настройки</CardTitle>
          <Settings size={20} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notifications">
          <TabsList className="mb-6">
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell size={16} className="mr-2" />
              Уведомления
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center">
              <Lock size={16} className="mr-2" />
              Приватность
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center">
              <HelpCircle size={16} className="mr-2" />
              Помощь
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Настройки уведомлений</h3>
              
              <div className="flex items-center justify-between">
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
              
              <div className="flex items-center justify-between">
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
              
              <div className="flex items-center justify-between">
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
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Настройки приватности</h3>
              
              <div className="flex items-center justify-between">
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
              
              <div className="flex items-center justify-between">
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
              
              <div className="pt-4">
                <Button>Сохранить настройки</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Часто задаваемые вопросы</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Как найти репетитора?</h4>
                  <p className="text-sm text-gray-600">
                    Для поиска репетитора перейдите в раздел "Найти репетитора" и используйте фильтры для уточнения поиска.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Как записаться на занятие?</h4>
                  <p className="text-sm text-gray-600">
                    Выберите репетитора, перейдите в его профиль и нажмите кнопку "Записаться на занятие".
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Как оплатить занятие?</h4>
                  <p className="text-sm text-gray-600">
                    После подтверждения занятия репетитором, вы получите уведомление с инструкцией по оплате.
                  </p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="outline">Связаться с поддержкой</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
