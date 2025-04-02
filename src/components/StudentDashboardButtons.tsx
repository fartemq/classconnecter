
import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Heart, MessageSquare, FileText, Settings, User } from "lucide-react";
import { studentNavItems } from "@/components/profile/student/StudentProfileNav";
import { Button } from "@/components/ui/button";

export const StudentDashboardButtons = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">Личный кабинет ученика</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {studentNavItems.map((item) => (
          <Button
            key={item.path}
            variant="outline"
            className="h-auto py-6 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/30 transition-colors"
            onClick={() => navigate(item.path)}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <item.icon className="h-6 w-6" />
            </div>
            <span className="font-medium">{item.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
