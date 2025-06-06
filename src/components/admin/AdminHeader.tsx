
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, LogOut, Home } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";

export const AdminHeader = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  const goToMain = () => {
    if (userRole === 'tutor') {
      navigate("/profile/tutor");
    } else if (userRole === 'student') {
      navigate("/profile/student");
    } else {
      navigate("/");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Административная панель</h1>
            <p className="text-sm text-gray-500">Stud.rep Admin Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={goToMain} className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>На главную</span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{user?.email}</p>
              <p className="text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleSignOut} className="flex items-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Выйти</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
