
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminAccessDialog = ({ open, onOpenChange }: AdminAccessDialogProps) => {
  const [password, setPassword] = useState("");
  const [codeword, setCodeword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const ADMIN_PASSWORD = "ksom77rok240pqqp137&sobaka45#";
  const ADMIN_CODEWORD = "BSLoooooLSB";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    // Имитация проверки
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === ADMIN_PASSWORD && codeword === ADMIN_CODEWORD) {
      toast({
        title: "Доступ разрешен",
        description: "Добро пожаловать в админ-панель",
      });
      onOpenChange(false);
      navigate("/admin");
      setPassword("");
      setCodeword("");
    } else {
      toast({
        title: "Доступ запрещен",
        description: "Неверный пароль или кодовое слово",
        variant: "destructive",
      });
    }
    
    setIsVerifying(false);
  };

  const handleClose = () => {
    setPassword("");
    setCodeword("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Доступ к админ-панели
          </DialogTitle>
          <DialogDescription>
            Для входа в административную панель требуется дополнительная аутентификация
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Пароль администратора</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль администратора"
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin-codeword">Кодовое слово</Label>
            <Input
              id="admin-codeword"
              type="text"
              value={codeword}
              onChange={(e) => setCodeword(e.target.value)}
              placeholder="Введите кодовое слово"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isVerifying}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isVerifying}
            >
              {isVerifying ? "Проверка..." : "Войти"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
