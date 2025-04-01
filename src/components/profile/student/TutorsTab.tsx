
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Users } from "lucide-react";

export const TutorsTab = () => {
  const navigate = useNavigate();
  
  // Mock data - would come from database in real app
  const myTutors = [];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Мои репетиторы</h2>
        <Users size={20} />
      </div>
      
      {myTutors && myTutors.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {/* Map through tutors here */}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <div className="text-gray-500 mb-4">
            У вас пока нет репетиторов.
          </div>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/tutors")} className="flex items-center">
              <Search size={16} className="mr-2" />
              Найти репетитора
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
