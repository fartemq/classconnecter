
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Book, Eye } from "lucide-react";

interface CurrentHomeworkItemProps {
  homework: {
    id: string;
    subject: string;
    title: string;
    description: string;
    dueDate: string;
    tutor: string;
    progress: number;
    status: string;
  };
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
  formatDate: (dateStr: string) => string;
  onViewClick: (homework: any) => void;
}

export const CurrentHomeworkItem = ({
  homework,
  getStatusColor,
  getStatusLabel,
  formatDate,
  onViewClick,
}: CurrentHomeworkItemProps) => {
  return (
    <Card key={homework.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-16 flex md:flex-col items-center md:justify-center gap-2 md:gap-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Book className="h-6 w-6" />
            </div>
            <Badge className={getStatusColor(homework.status)}>
              {getStatusLabel(homework.status)}
            </Badge>
          </div>
          
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <Badge className="mb-2">{homework.subject}</Badge>
                <h3 className="font-medium text-lg">{homework.title}</h3>
              </div>
              <Badge variant="outline" className={
                new Date(homework.dueDate) < new Date() 
                  ? "text-red-600 border-red-200 bg-red-50" 
                  : "text-amber-600 border-amber-200 bg-amber-50"
              }>
                Сдать до {formatDate(homework.dueDate)}
              </Badge>
            </div>
            
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {homework.description}
            </p>
            
            <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0">
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  Репетитор: {homework.tutor}
                </span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 flex-grow md:flex-grow-0">
                  <Progress value={homework.progress} className="w-full md:w-32" />
                  <span className="text-sm font-medium">{homework.progress}%</span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => onViewClick(homework)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Просмотр
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
