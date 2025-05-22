
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { Loader } from "@/components/ui/loader";

interface ProfilePublishSectionProps {
  tutorId: string;
}

export const ProfilePublishSection: React.FC<ProfilePublishSectionProps> = ({ tutorId }) => {
  const { 
    isPublished, 
    isValid, 
    missingFields, 
    warnings, 
    loading, 
    togglePublishStatus 
  } = useTutorPublishStatus(tutorId);
  
  const [dismissedAlert, setDismissedAlert] = useState(false);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center p-8">
            <Loader size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Публикация профиля</span>
          {isPublished ? (
            <span className="text-sm font-medium bg-green-100 text-green-800 py-1 px-3 rounded-full flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" /> Опубликован
            </span>
          ) : (
            <span className="text-sm font-medium bg-gray-100 text-gray-700 py-1 px-3 rounded-full flex items-center">
              <Info className="w-4 h-4 mr-1" /> Не опубликован
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Publication Alert */}
        {!isValid && !dismissedAlert && (
          <Alert variant="destructive" className="relative">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Профиль не готов к публикации</AlertTitle>
            <AlertDescription>
              <p>Для публикации профиля необходимо заполнить следующую информацию:</p>
              <ul className="list-disc pl-5 mt-2">
                {missingFields.map((field, index) => (
                  <li key={index} className="mt-1">{field}</li>
                ))}
              </ul>
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setDismissedAlert(true)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Закрыть</span>
            </Button>
          </Alert>
        )}
        
        {isValid && warnings.length > 0 && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Рекомендации по улучшению профиля</AlertTitle>
            <AlertDescription className="text-amber-700">
              <p>Рекомендуем заполнить дополнительную информацию для повышения привлекательности профиля:</p>
              <ul className="list-disc pl-5 mt-2">
                {warnings.map((warning, index) => (
                  <li key={index} className="mt-1">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Current status info */}
        <div className="bg-gray-50 p-4 rounded-md">
          {isPublished ? (
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Ваш профиль опубликован</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Студенты могут найти вас в поиске и отправить вам запрос на обучение.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Ваш профиль не опубликован</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Опубликуйте свой профиль, чтобы студенты могли находить вас в поиске и записываться на занятия.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Publish/Unpublish button */}
        <div className="pt-2">
          <Button 
            onClick={togglePublishStatus}
            disabled={loading || (!isPublished && !isValid)}
            variant={isPublished ? "destructive" : "default"}
            className="w-full md:w-auto"
          >
            {loading && <Loader size="sm" className="mr-2" />}
            {isPublished ? "Снять с публикации" : "Опубликовать профиль"}
          </Button>
          
          {!isValid && !isPublished && (
            <p className="text-sm text-gray-500 mt-2">
              Для публикации необходимо заполнить все обязательные поля профиля
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
