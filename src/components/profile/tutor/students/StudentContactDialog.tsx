
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Send, Book } from "lucide-react";

interface StudentContactDialogProps {
  student: {
    id: string;
    name: string;
    subjects: string[];
  };
  open: boolean;
  onClose: () => void;
}

export const StudentContactDialog = ({ 
  student, 
  open, 
  onClose 
}: StudentContactDialogProps) => {
  const [subject, setSubject] = useState(`Приглашение на пробное занятие по предмету ${student.subjects[0]}`);
  const [message, setMessage] = useState(`Здравствуйте, ${student.name}!\n\nЯ заинтересован в проведении занятий с вами. Давайте обсудим детали и возможность организации пробного урока.\n\nС уважением,\n[Ваше имя]`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Имитация отправки сообщения
    setTimeout(() => {
      toast({
        title: "Сообщение отправлено",
        description: `Ваше сообщение ученику ${student.name} успешно отправлено`,
      });
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Связаться с учеником</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-lg mr-3">
                {student.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium">{student.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Book className="h-3.5 w-3.5 mr-1" />
                  {student.subjects.join(", ")}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Тема сообщения</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Введите тему сообщения"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Представьтесь и опишите ваше предложение"
              rows={7}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Отправка..." : "Отправить сообщение"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
