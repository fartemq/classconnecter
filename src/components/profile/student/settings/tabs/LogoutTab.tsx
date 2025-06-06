
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const LogoutTab: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        toast({
          title: "Выход выполнен успешно",
          description: "Вы вышли из системы",
        });
        navigate('/');
      } else {
        throw new Error("Не удалось выйти из системы");
      }
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось выйти из системы. Пожалуйста, попробуйте снова.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-8 shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Выход из аккаунта</CardTitle>
          <CardDescription>
            Вы собираетесь выйти из своего аккаунта. После выхода вам потребуется повторно войти в систему.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
            <LogOut size={64} className="text-red-500 mb-4" />
            <p className="text-gray-700 mb-6 text-center">
              Вы уверены, что хотите выйти из системы? Все несохраненные данные будут потеряны.
            </p>
            <Button 
              variant="destructive" 
              size="lg" 
              className="flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Выйти из аккаунта
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
