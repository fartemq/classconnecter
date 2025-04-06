
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Heart, Book, School, User, CreditCard, Pencil, BookMarked, FileText } from "lucide-react";
import { ModalDialog } from "@/components/ui/modal-dialog";

export const QuickActions = () => {
  const location = useLocation();
  const isSettingsPage = location.pathname.includes("/settings");
  
  // Different actions based on whether we're in the settings page or not
  const actions = isSettingsPage 
    ? [
        {
          label: "Редактировать профиль",
          icon: Pencil,
          path: "/profile/student/edit",
          className: "bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all",
          content: "Здесь будет форма редактирования профиля"
        },
        {
          label: "Изменить предметы",
          icon: BookMarked,
          path: "/choose-subject",
          className: "bg-green-50 border-green-200 hover:bg-green-100 transition-all",
          content: "Здесь будет форма выбора предметов"
        },
        {
          label: "Способы оплаты",
          icon: CreditCard,
          path: "/profile/student/payment",
          className: "bg-blue-50 border-blue-200 hover:bg-blue-100 transition-all",
          content: "Здесь будут настройки способов оплаты"
        }
      ]
    : [
        {
          label: "Найти репетитора",
          icon: Search,
          path: "/tutors",
          className: "bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all",
          content: "Здесь будет поиск репетиторов"
        },
        {
          label: "Избранные репетиторы",
          icon: Heart,
          path: "/favorites",
          className: "bg-pink-50 border-pink-200 hover:bg-pink-100 transition-all",
          content: "Здесь будут избранные репетиторы"
        },
        {
          label: "Изменить предметы",
          icon: BookMarked,
          path: "/choose-subject",
          className: "bg-green-50 border-green-200 hover:bg-green-100 transition-all",
          content: "Здесь будет форма выбора предметов"
        },
        {
          label: "Все предметы",
          icon: FileText,
          path: "/subjects",
          className: "bg-violet-50 border-violet-200 hover:bg-violet-100 transition-all",
          content: "Здесь будет список всех предметов"
        }
      ];
  
  return (
    <div className="pt-2 space-y-4">
      <h3 className="text-sm font-medium text-gray-600 mb-3">Быстрые действия</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
        {actions.map((action) => (
          <ModalDialog
            key={action.label}
            title={action.label}
            triggerButton={
              <Button 
                variant="outline" 
                className={`w-full flex justify-start h-auto py-3.5 px-4 rounded-xl shadow-sm card-hover ${action.className}`}
              >
                <action.icon size={18} className="mr-2.5" />
                <span className="font-medium">{action.label}</span>
              </Button>
            }
          >
            <div className="min-h-[300px] flex items-center justify-center text-gray-500">
              {action.content}
            </div>
          </ModalDialog>
        ))}
      </div>
    </div>
  );
};
