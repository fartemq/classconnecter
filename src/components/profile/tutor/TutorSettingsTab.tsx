
import React from "react";
import { Profile } from "@/hooks/profiles/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface TutorSettingsTabProps {
  profile: Profile;
}

export const TutorSettingsTab = ({ profile }: TutorSettingsTabProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Настройки</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Настройки уведомлений</CardTitle>
          <CardDescription>
            Управляйте тем, как и когда вы получаете уведомления
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Получать уведомления о новых запросах на email
              </p>
            </div>
            <Switch />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Показывать уведомления в браузере
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Настройки аккаунта</CardTitle>
          <CardDescription>
            Управление вашим аккаунтом и безопасностью
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile.id} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" type="tel" value={profile.phone || ""} />
          </div>
          
          <Button>Сохранить изменения</Button>
        </CardContent>
      </Card>
    </div>
  );
};
