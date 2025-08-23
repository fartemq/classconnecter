
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
import { useEffect } from "react";

interface AdminAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminAccessDialog = ({ open, onOpenChange }: AdminAccessDialogProps) => {
  const [password, setPassword] = useState("");
  const [codeword, setCodeword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const ADMIN_PASSWORD = "ksom77rok240pqqp137&sobaka45#";
  const ADMIN_CODEWORD = "BSLoooooLSB";

  const STORAGE_KEYS = {
    attempts: "admin_access_attempts",
    lockUntil: "admin_access_lock_until",
    granted: "admin_access_granted",
  } as const;

  const getNow = () => Date.now();

  const readLockUntil = (): number | null => {
    const v = sessionStorage.getItem(STORAGE_KEYS.lockUntil);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const isLocked = () => {
    const until = readLockUntil();
    if (!until) return false;
    const remaining = until - getNow();
    if (remaining <= 0) {
      sessionStorage.removeItem(STORAGE_KEYS.lockUntil);
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Initialize lock state when dialog opens
    if (open) {
      const until = readLockUntil();
      setLockUntil(until);
      // If already granted this session, redirect immediately
      if (sessionStorage.getItem(STORAGE_KEYS.granted) === "1") {
        onOpenChange(false);
        navigate("/admin");
      }
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked()) {
      const remainingMs = (readLockUntil() ?? 0) - getNow();
      const mins = Math.ceil(remainingMs / 60000);
      toast({
        title: "Доступ временно заблокирован",
        description: `Попробуйте снова через ${mins} мин`,
        variant: "destructive",
      });
      setLockUntil(readLockUntil());
      return;
    }
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
      sessionStorage.setItem(STORAGE_KEYS.granted, "1");
      sessionStorage.removeItem(STORAGE_KEYS.attempts);
      sessionStorage.removeItem(STORAGE_KEYS.lockUntil);
    } else {
      // Track attempts and set lock if too many failures
      const current = Number(sessionStorage.getItem(STORAGE_KEYS.attempts) || "0");
      const next = current + 1;
      if (next >= 5) {
        const until = getNow() + 5 * 60 * 1000; // 5 minutes
        sessionStorage.setItem(STORAGE_KEYS.lockUntil, String(until));
        sessionStorage.removeItem(STORAGE_KEYS.attempts);
        setLockUntil(until);
        toast({
          title: "Слишком много попыток",
          description: "Доступ заблокирован на 5 минут",
          variant: "destructive",
        });
      } else {
        sessionStorage.setItem(STORAGE_KEYS.attempts, String(next));
        toast({
          title: "Доступ запрещен",
          description: "Неверный пароль или кодовое слово",
          variant: "destructive",
        });
      }
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
                disabled={isVerifying || isLocked()}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isVerifying || isLocked()}
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
              disabled={isVerifying || isLocked()}
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
              disabled={isVerifying || isLocked()}
            >
              {isVerifying ? "Проверка..." : "Войти"}
            </Button>
          </div>
          {isLocked() && lockUntil && (
            <div className="text-sm text-muted-foreground pt-1">
              Попытки временно ограничены до {new Date(lockUntil).toLocaleTimeString()}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
