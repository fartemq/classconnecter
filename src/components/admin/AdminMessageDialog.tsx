
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AdminMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientName: string;
}

export const AdminMessageDialog = ({ 
  open, 
  onOpenChange, 
  recipientId, 
  recipientName 
}: AdminMessageDialogProps) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!content.trim()) {
      toast({
        title: "Ошибка",
        description: "Сообщение не может быть пустым",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);
      
      const { error } = await supabase.rpc('send_admin_message', {
        recipient_id_param: recipientId,
        subject_param: subject.trim() || "Сообщение от администратора",
        content_param: content.trim()
      });

      if (error) throw error;

      toast({
        title: "Сообщение отправлено",
        description: `Сообщение от имени Admin отправлено пользователю ${recipientName}`
      });

      // Очищаем форму и закрываем диалог
      setSubject("");
      setContent("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending admin message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            Отправить сообщение от имени администратора
          </DialogTitle>
          <DialogDescription>
            Сообщение будет отправлено от имени "Admin" с желтой звездочкой подтверждения
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Получатель */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <Label className="text-sm text-gray-600">Получатель:</Label>
            <div className="font-medium">{recipientName}</div>
          </div>

          {/* Отправитель */}
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <Label className="text-sm text-gray-600">От имени:</Label>
            <div className="flex items-center gap-2 font-medium text-yellow-800">
              Admin
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          
          {/* Тема */}
          <div className="space-y-2">
            <Label htmlFor="subject">Тема сообщения</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Сообщение от администратора"
            />
          </div>
          
          {/* Содержание */}
          <div className="space-y-2">
            <Label htmlFor="content">Содержание сообщения *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите ваше сообщение..."
              rows={5}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              disabled={isSending || !content.trim()}
            >
              {isSending ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
