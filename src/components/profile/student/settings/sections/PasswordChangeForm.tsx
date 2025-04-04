
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PasswordChangeForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
        email: supabase.auth.getUser()?.data?.user?.email || "",
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

  return (
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
  );
};
