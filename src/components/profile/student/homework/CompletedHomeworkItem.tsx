
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye } from "lucide-react";

interface CompletedHomeworkItemProps {
  homework: {
    id: string;
    subject: string;
    title: string;
    description: string;
    submittedDate: string;
    tutor: string;
    grade: number;
    feedback: string;
  };
  formatDate: (dateStr: string) => string;
  onViewClick: (homework: any) => void;
}

export const CompletedHomeworkItem = ({
  homework,
  formatDate,
  onViewClick,
}: CompletedHomeworkItemProps) => {
  return (
    <Card key={homework.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-16 flex md:flex-col items-center md:justify-center gap-2 md:gap-0">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="flex items-center justify-center mt-2">
              <span className="text-lg font-bold text-green-600">{homework.grade}</span>
              <span className="text-xs text-gray-500">/5</span>
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <Badge className="mb-2">{homework.subject}</Badge>
                <h3 className="font-medium text-lg">{homework.title}</h3>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                Сдано {formatDate(homework.submittedDate)}
              </Badge>
            </div>
            
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {homework.description}
            </p>
            
            <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
              <p className="font-medium mb-1">Отзыв репетитора:</p>
              <p className="text-gray-700">{homework.feedback}</p>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Репетитор: {homework.tutor}
              </span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onViewClick(homework)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Подробнее
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
