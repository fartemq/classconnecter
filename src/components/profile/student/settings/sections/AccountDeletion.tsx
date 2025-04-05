
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const AccountDeletion = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Вы не авторизованы",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the delete_user Supabase RPC function without parameters
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      // Sign out after successful deletion
      await supabase.auth.signOut();
      
      toast({
        title: "Аккаунт удален",
        description: "Ваш аккаунт был успешно удален",
      });
      
      // Redirect to home page
      navigate("/");
      
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить аккаунт",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Удаление аккаунта</h3>
      
      <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Внимание! Это действие необратимо.</h4>
            <p className="text-sm text-red-700">
              При удалении аккаунта вся ваша информация, включая профиль, историю занятий и сообщения, будет безвозвратно удалена.
            </p>
          </div>
        </div>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
            Удалить аккаунт
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит ваш аккаунт и все связанные с ним данные. Это действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount} 
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={isLoading}
            >
              {isLoading ? "Удаление..." : "Да, удалить аккаунт"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
