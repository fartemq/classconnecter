
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface EmptyRequestsProps {
  message: string; // Adding message prop to match how it's being used
  activeTab?: string;
}

export const EmptyRequests = ({ message, activeTab }: EmptyRequestsProps) => {
  const navigate = useNavigate();
  
  return (
    <Card className="border border-dashed">
      <CardContent className="text-center py-10">
        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-700 mb-2">Нет запросов</h3>
        <p className="text-gray-500 mb-4">
          {message}
        </p>
        <Button onClick={() => navigate("/tutors")}>
          Найти репетиторов
        </Button>
      </CardContent>
    </Card>
  );
};
