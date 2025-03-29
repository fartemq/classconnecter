
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export const ChatsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Чаты с репетиторами</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          У вас пока нет активных чатов с репетиторами.
        </div>
      </CardContent>
    </Card>
  );
};
