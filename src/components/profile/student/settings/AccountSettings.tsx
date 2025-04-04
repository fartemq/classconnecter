
import React from "react";
import { PasswordChangeForm } from "./sections/PasswordChangeForm";
import { EmailChangeForm } from "./sections/EmailChangeForm";
import { AccountDeletion } from "./sections/AccountDeletion";

export const AccountSettings = () => {
  return (
    <div className="space-y-8">
      <PasswordChangeForm />
      <EmailChangeForm />
      <AccountDeletion />
    </div>
  );
};
