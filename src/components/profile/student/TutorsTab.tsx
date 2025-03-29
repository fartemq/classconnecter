
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const TutorsTab = () => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Мои репетиторы</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-gray-500">
          У вас пока нет репетиторов.
        </div>
        <div className="text-center mt-4">
          <Button onClick={() => navigate("/tutors")}>Найти репетитора</Button>
        </div>
      </CardContent>
    </Card>
  );
};
