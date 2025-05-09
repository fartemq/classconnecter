
import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ProfileStatusIndicatorProps {
  isPublished: boolean;
}

export const ProfileStatusIndicator: React.FC<ProfileStatusIndicatorProps> = ({ 
  isPublished 
}) => {
  return (
    <div className="bg-slate-50 p-4 rounded-md">
      {isPublished ? (
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Ваш профиль опубликован</h4>
            <p className="text-sm text-gray-600">
              Ученики могут найти вас в поиске, просматривать ваш профиль,
              отправлять сообщения и бронировать занятия согласно вашему расписанию.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Ваш профиль не опубликован</h4>
            <p className="text-sm text-gray-600">
              Ученики не могут видеть ваш профиль. Опубликуйте его, чтобы начать
              принимать запросы от учеников и бронирования занятий.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
