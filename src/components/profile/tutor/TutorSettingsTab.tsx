
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Bell, Lock, LogOut, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

interface TutorSettingsTabProps {
  profile: Profile;
}

export const TutorSettingsTab = ({ profile }: TutorSettingsTabProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Выход выполнен успешно",
        description: "Вы вышли из своего аккаунта",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Настройки</h1>

      {/* Уведомления */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email уведомления</h3>
              <p className="text-sm text-gray-500">Получать уведомления по электронной почте</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Запросы от новых учеников</h3>
              <p className="text-sm text-gray-500">Уведомления о новых запросах</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Новые сообщения</h3>
              <p className="text-sm text-gray-500">Уведомления о новых сообщениях</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Бронирование занятий</h3>
              <p className="text-sm text-gray-500">Уведомления о новых бронированиях</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Конфиденциальность */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Конфиденциальность
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Показывать мой профиль в поиске</h3>
              <p className="text-sm text-gray-500">Если выключено, ваш профиль не будет виден даже если опубликован</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Показывать статус онлайн</h3>
              <p className="text-sm text-gray-500">Разрешить студентам видеть, когда вы в сети</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Общие настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Общие настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Язык интерфейса</h3>
              <p className="text-sm text-gray-500">Выберите язык интерфейса</p>
            </div>
            <select className="px-3 py-1.5 rounded border">
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Формат даты</h3>
              <p className="text-sm text-gray-500">Выберите формат отображения дат</p>
            </div>
            <select className="px-3 py-1.5 rounded border">
              <option value="dd.mm.yyyy">ДД.ММ.ГГГГ</option>
              <option value="mm.dd.yyyy">ММ.ДД.ГГГГ</option>
              <option value="yyyy-mm-dd">ГГГГ-ММ-ДД</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Выход из системы */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center">
            <LogOut className="h-5 w-5 mr-2" />
            Выход из системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-500">
            При выходе из системы вы будете перенаправлены на страницу входа.
            Для продолжения работы потребуется повторная авторизация.
          </p>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
