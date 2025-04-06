
import React from "react";
import { PasswordChangeForm } from "./sections/PasswordChangeForm";
import { EmailChangeForm } from "./sections/EmailChangeForm";
import { Card } from "@/components/ui/card";

export const AccountSettings = () => {
  return (
    <div className="space-y-8">
      <Card className="p-8 shadow-md rounded-xl gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Изменение пароля</h3>
          <p className="text-gray-600 text-sm">Обновите свой пароль для обеспечения безопасности аккаунта</p>
        </div>
        <PasswordChangeForm />
      </Card>
      
      <Card className="p-8 shadow-md rounded-xl gradient-card">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Изменение электронной почты</h3>
          <p className="text-gray-600 text-sm">Обновите адрес электронной почты, связанный с вашим аккаунтом</p>
        </div>
        <EmailChangeForm />
      </Card>
    </div>
  );
};
