
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Calendar, Users, Heart, MessageSquare, 
  FileText, Settings, User, ChevronDown, Sparkles
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const studentNavItems = [
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar, badge: 0 },
  { name: "Репетиторы", path: "/profile/student/tutors", icon: Users },
  { name: "Избранное", path: "/profile/student/favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare, badge: 2 },
  { name: "Домашние задания", path: "/profile/student/homework", icon: FileText, badge: 1 },
  { name: "Мой прогресс", path: "/profile/student/progress", icon: Sparkles },
  { name: "Настройки", path: "/profile/student/settings", icon: Settings },
  { name: "Мой профиль", path: "/profile/student/edit", icon: User },
];

export const StudentProfileNav = () => {
  // Only needed for mobile navigation
  // Since we're now using the header for all navigation
  // This component is only for reference and will be removed in future updates
  return null;
};
