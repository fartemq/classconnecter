
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  UserMinus, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle 
} from "lucide-react";

interface Tutor {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
  city: string | null;
}

interface Subject {
  id: string;
  name: string;
}

interface RequestCardProps {
  id: string;
  tutor: Tutor;
  subject?: Subject;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message: string | null;
  created_at: string;
  tutor_id: string;
  onUpdateStatus: (requestId: string, status: 'accepted' | 'rejected' | 'completed') => void;
  onContactTutor: (tutorId: string) => void;
}

export const RequestCard = ({
  id,
  tutor,
  subject,
  status,
  message,
  created_at,
  tutor_id,
  onUpdateStatus,
  onContactTutor
}: RequestCardProps) => {
  const navigate = useNavigate();

  const renderStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Ожидает
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Принят
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Отклонен
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Завершен
          </Badge>
        );
    }
  };

  return (
    <Card key={id} className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            {tutor.avatar_url ? (
              <AvatarImage src={tutor.avatar_url} alt={tutor.first_name} />
            ) : (
              <AvatarFallback>{tutor.first_name[0]}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{`${tutor.first_name} ${tutor.last_name || ''}`}</h3>
                <div className="text-sm text-gray-500 mb-1">
                  {tutor.city || "Город не указан"}
                </div>
              </div>
              
              <div>
                {renderStatusBadge()}
              </div>
            </div>
            
            <div className="text-sm mt-2">
              <div className="font-medium">Предмет: {subject?.name || "Не указан"}</div>
              {message && (
                <div className="mt-2 text-gray-700 bg-gray-50 p-2 rounded">
                  {message}
                </div>
              )}
              <div className="text-xs text-gray-500 mt-2">
                Запрос от {new Date(created_at).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 grid grid-cols-2 gap-2 border-t">
        {status === 'pending' ? (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-green-700"
              onClick={() => onUpdateStatus(id, 'accepted')}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Принять
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-red-700"
              onClick={() => onUpdateStatus(id, 'rejected')}
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Отклонить
            </Button>
          </>
        ) : (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate(`/tutors/${tutor_id}`)}
            >
              Профиль
            </Button>
            <Button 
              size="sm"
              onClick={() => onContactTutor(tutor_id)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Связаться
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
