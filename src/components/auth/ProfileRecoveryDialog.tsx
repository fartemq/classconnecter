
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { createMissingProfile, checkUserProfileStatus } from "@/services/auth/profileRecoveryService";
import { toast } from "@/hooks/use-toast";

interface ProfileRecoveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    firstName: string;
    lastName: string;
    role: "student" | "tutor";
    city?: string;
    phone?: string;
    bio?: string;
  };
}

export const ProfileRecoveryDialog: React.FC<ProfileRecoveryDialogProps> = ({
  isOpen,
  onClose,
  userData
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"checking" | "missing" | "exists" | "created">("checking");

  React.useEffect(() => {
    if (isOpen && user?.id) {
      checkProfile();
    }
  }, [isOpen, user?.id]);

  const checkProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setStatus("checking");

    try {
      const result = await checkUserProfileStatus(user.id);
      
      if (result.success) {
        setStatus(result.profileExists ? "exists" : "missing");
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось проверить состояние профиля",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);

    try {
      const result = await createMissingProfile(user.id, userData);
      
      if (result.success) {
        setStatus("created");
        toast({
          title: "Профиль создан",
          description: "Ваш профиль успешно создан",
        });
        
        // Обновляем данные пользователя
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать профиль",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Восстановление профиля</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {status === "checking" && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Проверяем состояние профиля...</span>
            </div>
          )}

          {status === "missing" && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Ваш профиль не найден в системе. Это может произойти из-за ошибки при регистрации.
                  Мы можем создать профиль для вас прямо сейчас.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Данные для создания профиля:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Имя:</strong> {userData.firstName}</p>
                  <p><strong>Фамилия:</strong> {userData.lastName}</p>
                  <p><strong>Роль:</strong> {userData.role === "student" ? "Ученик" : "Репетитор"}</p>
                  {userData.city && <p><strong>Город:</strong> {userData.city}</p>}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={createProfile} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать профиль
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Отмена
                </Button>
              </div>
            </>
          )}

          {status === "exists" && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Ваш профиль найден в системе. Все в порядке.
                </AlertDescription>
              </Alert>
              <Button onClick={onClose}>Закрыть</Button>
            </>
          )}

          {status === "created" && (
            <>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Профиль успешно создан! Сейчас страница обновится.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
