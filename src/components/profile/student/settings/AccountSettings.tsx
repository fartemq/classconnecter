
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Mail, Lock, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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

export const AccountSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Новые пароли не совпадают",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: passwordData.currentPassword,
      });
      
      if (signInError) {
        throw new Error("Неверный текущий пароль");
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Пароль изменен",
        description: "Ваш пароль был успешно изменен",
      });
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить пароль",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // First verify the password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: emailData.password,
      });
      
      if (signInError) {
        throw new Error("Неверный пароль");
      }
      
      // Update the email
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email изменен",
        description: "На новый адрес отправлено письмо для подтверждения",
      });
      
      // Reset form
      setEmailData({
        newEmail: "",
        password: "",
      });
      
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось изменить email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    
    try {
      // Delete the user
      // Fix by passing an empty object as parameters
      const { error } = await supabase.rpc('delete_user', {});
      
      if (error) throw error;
      
      // Sign out
      await supabase.auth.signOut();
      
      toast({
        title: "Аккаунт удален",
        description: "Ваш аккаунт был успешно удален",
      });
      
    } catch (error: any) {
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
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Смена пароля</h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Текущий пароль</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">Новый пароль</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              required
            />
          </div>
          
          <Button type="submit" disabled={isLoading}>
            <Lock className="mr-2 h-4 w-4" />
            Изменить пароль
          </Button>
        </form>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Смена Email</h3>
        
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email">Текущий Email</Label>
            <Input
              id="current-email"
              type="email"
              value={user?.email || ""}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-email">Новый Email</Label>
            <Input
              id="new-email"
              type="email"
              value={emailData.newEmail}
              onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-password">Ваш пароль</Label>
            <Input
              id="email-password"
              type="password"
              value={emailData.password}
              onChange={(e) => setEmailData({...emailData, password: e.target.value})}
              required
            />
            <p className="text-xs text-gray-500">Для смены email необходимо ввести текущий пароль</p>
          </div>
          
          <Button type="submit" disabled={isLoading}>
            <Mail className="mr-2 h-4 w-4" />
            Изменить Email
          </Button>
        </form>
      </div>
      
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
              >
                Да, удалить аккаунт
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

