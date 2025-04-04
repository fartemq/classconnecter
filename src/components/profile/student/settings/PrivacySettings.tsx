
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const PrivacySettings = () => {
  return (
    <div className="space-y-8">
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
    </div>
  );
};
