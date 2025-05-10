
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const NotPublishedAlert: React.FC = () => {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      <div className="flex flex-col md:flex-row w-full md:items-center justify-between">
        <div>
          <AlertTitle>Ваш профиль не опубликован</AlertTitle>
          <AlertDescription>
            Студенты не могут найти вас в поиске. Для увеличения видимости опубликуйте свой профиль.
          </AlertDescription>
        </div>
        <Button asChild className="mt-4 md:mt-0 md:ml-4 md:whitespace-nowrap">
          <Link to="/profile/tutor?tab=profile">
            Опубликовать профиль
          </Link>
        </Button>
      </div>
    </Alert>
  );
};
