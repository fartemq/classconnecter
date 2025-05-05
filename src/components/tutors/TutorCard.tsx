
import { Heart, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tutor } from "@/pages/TutorsPage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface TutorCardProps {
  tutor: Tutor;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get lowest hourly rate from all subjects
  const lowestRate = tutor.subjects.length > 0
    ? Math.min(...tutor.subjects.map(s => s.hourly_rate))
    : 0;

  // Format full name
  const fullName = `${tutor.first_name} ${tutor.last_name || ""}`.trim();
  
  // Format the rating
  const rating = tutor.rating ? tutor.rating.toFixed(1) : "N/A";
  
  const toggleFavorite = () => {
    // For now, just toggle the state locally
    // In a real app, you would save this to the database
    setIsFavorite(!isFavorite);
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы связаться с репетитором",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    navigate(`/profile/student/chats/${tutor.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Avatar */}
          <div className="md:w-1/3 p-4 flex justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {tutor.avatar_url ? (
                <img 
                  src={tutor.avatar_url} 
                  alt={fullName}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-3xl text-gray-400">{tutor.first_name[0]}</span>
              )}
            </div>
          </div>
          
          {/* Information */}
          <div className="md:w-2/3 p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span>{rating}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-1">
              {tutor.city && <span>{tutor.city}</span>}
            </div>
            
            <div className="mt-2 flex flex-wrap gap-1">
              {tutor.subjects.map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {subject.name}
                </Badge>
              ))}
            </div>
            
            <div className="mt-3">
              <p className="text-sm line-clamp-2 text-gray-700">
                {tutor.bio || "Нет информации о репетиторе"}
              </p>
            </div>
            
            <div className="mt-3 text-sm">
              <p className="font-medium">От {lowestRate} руб/час</p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button variant="outline" size="sm" onClick={toggleFavorite}>
          <Heart 
            className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
          />
          {isFavorite ? 'В избранном' : 'В избранное'}
        </Button>
        
        <Button size="sm" onClick={handleContact}>
          <MessageSquare className="h-4 w-4 mr-1" />
          Связаться
        </Button>
      </CardFooter>
    </Card>
  );
}
