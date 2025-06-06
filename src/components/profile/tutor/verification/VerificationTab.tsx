
import React from "react";
import { DocumentVerification } from "./DocumentVerification";

export const VerificationTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Верификация документов</h2>
        <p className="text-muted-foreground">
          Загрузите документы об образовании для верификации вашего профиля
        </p>
      </div>
      
      <DocumentVerification />
    </div>
  );
};
