
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";

export const EmailChangeForm = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });

  // Handle email change
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.email) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить текущий email",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First verify the password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
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

  return (
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
          {isLoading ? "Изменение..." : "Изменить Email"}
        </Button>
      </form>
    </div>
  );
};
