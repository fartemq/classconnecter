
import React from "react";
import { PasswordChangeForm } from "./sections/PasswordChangeForm";
import { EmailChangeForm } from "./sections/EmailChangeForm";
import { AccountDeletion } from "./sections/AccountDeletion";
import { Card } from "@/components/ui/card";

export const AccountSettings = () => {
  return (
    <div className="space-y-8">
      <Card className="p-6 shadow-sm">
        <PasswordChangeForm />
      </Card>
      
      <Card className="p-6 shadow-sm">
        <EmailChangeForm />
      </Card>
      
      <Card className="p-6 shadow-sm">
        <AccountDeletion />
      </Card>
    </div>
  );
};
