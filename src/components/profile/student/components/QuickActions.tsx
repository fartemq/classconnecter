
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Heart, Book, School, User, CreditCard } from "lucide-react";
import { ModalDialog } from "@/components/ui/modal-dialog";

export const QuickActions = () => {
  const location = useLocation();
  const isSettingsPage = location.pathname.includes("/settings");
  
  // Different actions based on whether we're in the settings page or not
  const actions = isSettingsPage 
    ? [
        {
          label: "Редактировать профиль",
          icon: User,
          path: "/profile/student/edit",
          className: "bg-primary/5 border-primary/20 hover:bg-primary/10",
          content: "Здесь будет форма редактирования профиля"
        },
        {
          label: "Изменить предметы",
          icon: Book,
          path: "/choose-subject",
          className: "bg-green-50 border-green-200 hover:bg-green-100",
          content: "Здесь будет форма выбора предметов"
        },
        {
          label: "Способы оплаты",
          icon: CreditCard,
          path: "/profile/student/payment",
          className: "bg-blue-50 border-blue-200 hover:bg-blue-100",
          content: "Здесь будут настройки способов оплаты"
        }
      ]
    : [
        {
          label: "Найти репетитора",
          icon: Search,
          path: "/tutors",
          className: "bg-primary/5 border-primary/20 hover:bg-primary/10",
          content: "Здесь будет поиск репетиторов"
        },
        {
          label: "Избранные репетиторы",
          icon: Heart,
          path: "/favorites",
          className: "bg-red-50 border-red-200 hover:bg-red-100",
          content: "Здесь будут избранные репетиторы"
        },
        {
          label: "Изменить предметы",
          icon: Book,
          path: "/choose-subject",
          className: "bg-green-50 border-green-200 hover:bg-green-100",
          content: "Здесь будет форма выбора предметов"
        },
        {
          label: "Все предметы",
          icon: School,
          path: "/subjects",
          className: "bg-blue-50 border-blue-200 hover:bg-blue-100",
          content: "Здесь будет список всех предметов"
        }
      ];
  
  return (
    <div className="pt-2 space-y-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Быстрые действия</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
        {actions.map((action) => (
          <ModalDialog
            key={action.label}
            title={action.label}
            triggerButton={
              <Button 
                variant="outline" 
                className={`w-full flex justify-start h-auto py-3 ${action.className}`}
              >
                <action.icon size={18} className="mr-2" />
                <span>{action.label}</span>
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
