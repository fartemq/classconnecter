
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const EmergencyLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmergencyLogout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы вышли из системы",
      });
      window.location.href = "/"; // Принудительная перезагрузка
    } catch (error) {
      console.error("Emergency logout error:", error);
      // Даже при ошибке пытаемся очистить localStorage и перезагрузить
      localStorage.clear();
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToProfile = () => {
    // Простая попытка перехода в профиль
    navigate("/profile/student");
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-red-200 rounded-lg p-4 shadow-lg">
      <p className="text-sm text-gray-600 mb-3">Проблемы с навигацией?</p>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleGoToProfile}
        >
          <User className="h-4 w-4 mr-1" />
          В профиль
        </Button>
        <Button 
          size="sm" 
          variant="destructive"
          onClick={handleEmergencyLogout}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4 mr-1" />
          {isLoading ? "Выход..." : "Выйти"}
        </Button>
      </div>
    </div>
  );
};
