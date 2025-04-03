
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Heart, School, Book } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();
  
  const actions = [
    {
      label: "Найти репетитора",
      icon: Search,
      path: "/tutors",
      className: "bg-primary/5 border-primary/20 hover:bg-primary/10",
    },
    {
      label: "Избранные репетиторы",
      icon: Heart,
      path: "/favorites",
      className: "bg-red-50 border-red-200 hover:bg-red-100",
    },
    {
      label: "Изменить предметы",
      icon: Book,
      path: "/choose-subject",
      className: "bg-green-50 border-green-200 hover:bg-green-100",
    },
    {
      label: "Все предметы",
      icon: School,
      path: "/subjects",
      className: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    },
  ];
  
  return (
    <div className="pt-2 space-y-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Быстрые действия</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <Button 
            key={action.label}
            variant="outline" 
            className={`w-full flex justify-start h-auto py-3 ${action.className}`} 
            onClick={() => navigate(action.path)}
          >
            <action.icon size={18} className="mr-2" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
