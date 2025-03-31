
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";

export const FavoriteTutorsTab = () => {
  const navigate = useNavigate();
  const favoriteTutors = []; // This would come from a backend call
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Избранные репетиторы</CardTitle>
        <Heart className="text-red-500" size={20} />
      </CardHeader>
      <CardContent>
        {favoriteTutors && favoriteTutors.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {/* Map through favorite tutors here */}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              У вас пока нет избранных репетиторов
            </div>
            <div className="flex justify-center">
              <Button onClick={() => navigate("/tutors")} className="flex items-center">
                <Search size={16} className="mr-2" />
                Найти репетитора
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
