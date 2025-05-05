
import React from "react";
import { Profile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Settings, LogOut, User, Bell, Lock } from "lucide-react";
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
      // Переадресация и уведомления происходят в функции signOut
    } catch (error) {
      console.error("Ошибка выхода:", error);
      toast({
        title: "Ошибка выхода",
        description: "Произошла ошибка при выходе из аккаунта",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Settings className="h-5 w-5 mr-2" />
            Настройки профиля
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Управляйте настройками вашего профиля репетитора
          </p>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/profile/tutor/complete")}
            >
              <User className="h-4 w-4 mr-2" />
              Редактировать основную информацию
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/profile/tutor?tab=schedule")}
            >
              Управление расписанием
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/profile/tutor/notifications")}
            >
              <Bell className="h-4 w-4 mr-2" />
              Настройки уведомлений
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/profile/tutor/password")}
            >
              <Lock className="h-4 w-4 mr-2" />
              Изменить пароль
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center text-lg">
            <LogOut className="h-5 w-5 mr-2" />
            Выход из системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            При выходе из системы вы будете перенаправлены на страницу входа
          </p>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
          >
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
