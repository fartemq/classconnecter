
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Book, Graduation, Info, Calendar, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StudentProfileDialogProps {
  student: {
    id: string;
    name: string;
    avatar: string | null;
    lastActive: string;
    level: string;
    grade: string | null;
    subjects: string[];
    city: string;
    about: string;
    interests: string[];
    status: string;
  };
  open: boolean;
  onClose: () => void;
  onContact: () => void;
}

export const StudentProfileDialog = ({ 
  student, 
  open, 
  onClose, 
  onContact 
}: StudentProfileDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Профиль ученика</DialogTitle>
          <DialogDescription>
            Подробная информация о потенциальном ученике
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Основная информация */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl flex-shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-medium">{student.name}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <div className="flex items-center mr-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {student.city}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {student.lastActive}
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  <Graduation className="h-3.5 w-3.5 mr-1" />
                  {student.level}{student.grade ? `, ${student.grade}` : ''}
                </Badge>
                {student.subjects.map(subject => (
                  <Badge key={subject} variant="outline">
                    <Book className="h-3.5 w-3.5 mr-1" />
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* О себе */}
          <div>
            <h4 className="text-md font-medium mb-2 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              О себе
            </h4>
            <p className="text-gray-700">{student.about}</p>
          </div>
          
          {/* Интересы */}
          <div>
            <h4 className="text-md font-medium mb-2 flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Цели обучения
            </h4>
            <div className="flex flex-wrap gap-2">
              {student.interests.map(interest => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Дополнительная информация - можно расширить при необходимости */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium mb-3">Предпочтения по обучению</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Формат занятий:</span>
                <span className="font-medium">Онлайн</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Периодичность:</span>
                <span className="font-medium">2 раза в неделю</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Длительность урока:</span>
                <span className="font-medium">60 минут</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Бюджет:</span>
                <span className="font-medium">1000-1500 ₽/час</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
          <Button onClick={onContact}>
            <Mail className="h-4 w-4 mr-2" />
            Связаться с учеником
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
