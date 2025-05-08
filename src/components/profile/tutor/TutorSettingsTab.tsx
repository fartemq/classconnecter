
import React from "react";
import { Profile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Settings, Bell, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface TutorSettingsTabProps {
  profile: Profile;
}

export const TutorSettingsTab = ({ profile }: TutorSettingsTabProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Выход выполнен успешно",
        description: "Вы вышли из учетной записи",
      });
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из учетной записи",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Настройки аккаунта</h1>

      {/* Настройки уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Настройки уведомлений
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">
                Email-уведомления
              </Label>
              <p className="text-sm text-gray-500">
                Получать уведомления на электронную почту
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-students" className="font-medium">
                Новые ученики
              </Label>
              <p className="text-sm text-gray-500">
                Получать уведомления о новых запросах от учеников
              </p>
            </div>
            <Switch id="new-students" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="lesson-reminders" className="font-medium">
                Напоминания о занятиях
              </Label>
              <p className="text-sm text-gray-500">
                Получать напоминания о предстоящих занятиях
              </p>
            </div>
            <Switch id="lesson-reminders" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Настройки приватности */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Приватность и безопасность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profile-visibility" className="font-medium">
                Видимость профиля
              </Label>
              <p className="text-sm text-gray-500">
                Разрешить ученикам видеть ваш профиль
              </p>
            </div>
            <Switch id="profile-visibility" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-contacts" className="font-medium">
                Показывать контакты
              </Label>
              <p className="text-sm text-gray-500">
                Показывать ваши контактные данные другим пользователям
              </p>
            </div>
            <Switch id="show-contacts" />
          </div>
        </CardContent>
      </Card>

      {/* Выход из аккаунта */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <LogOut className="h-5 w-5" />
            Выход из аккаунта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            При выходе из аккаунта все несохраненные данные будут утеряны
          </p>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
