
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Book, Search, Heart, School } from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="pt-2 space-y-3">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Быстрые действия</h3>
      
      <Button 
        variant="outline" 
        className="w-full flex justify-start bg-white" 
        size="sm" 
        onClick={() => navigate("/choose-subject")}
      >
        <Book size={16} className="mr-2" />
        Изменить предметы
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full flex justify-start bg-white" 
        size="sm" 
        onClick={() => navigate("/tutors")}
      >
        <Search size={16} className="mr-2" />
        Найти репетитора
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full flex justify-start bg-white" 
        size="sm" 
        onClick={() => navigate("/favorites")}
      >
        <Heart size={16} className="mr-2" />
        Избранные репетиторы
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full flex justify-start bg-white" 
        size="sm" 
        onClick={() => navigate("/subjects")}
      >
        <School size={16} className="mr-2" />
        Все предметы
      </Button>
    </div>
  );
};
