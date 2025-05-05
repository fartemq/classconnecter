
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { TutorRequestsSection } from "./TutorRequestsSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "./common/PageHeader";
import { LoadingState } from "./common/LoadingState";
import { EmptyState } from "./common/EmptyState";
import { TutorCard } from "./tutors/TutorCard";
import { TutorSearchBar } from "./tutors/TutorSearchBar";
import { Tutor } from "@/pages/TutorsPage";

export const TutorsTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [myTutors, setMyTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutors");
  
  // Mock data for demonstration
  const mockTutors: Tutor[] = [
    {
      id: "1",
      first_name: "Иванов",
      last_name: "Иван",
      avatar_url: "https://i.pravatar.cc/150?img=1",
      subjects: [
        { name: "Математика", hourly_rate: 1200, experience_years: 5 },
        { name: "Физика", hourly_rate: 1300, experience_years: 3 }
      ],
      rating: 4.8,
      bio: "Опытный репетитор по математике и физике",
      city: "Москва",
    },
    {
      id: "2",
      first_name: "Петрова",
      last_name: "Анна",
      avatar_url: "https://i.pravatar.cc/150?img=2",
      subjects: [
        { name: "Английский язык", hourly_rate: 1500, experience_years: 7 }
      ],
      rating: 4.9,
      bio: "Преподаватель английского языка с опытом работы за рубежом",
      city: "Санкт-Петербург",
    },
    {
      id: "3",
      first_name: "Сидоров",
      last_name: "Алексей",
      avatar_url: "https://i.pravatar.cc/150?img=3", // Added the missing avatar_url property
      subjects: [
        { name: "Химия", hourly_rate: 1100, experience_years: 4 },
        { name: "Биология", hourly_rate: 1000, experience_years: 2 }
      ],
      rating: 4.7,
      bio: "Преподаватель химии и биологии",
      city: "Новосибирск",
    }
  ];
  
  useEffect(() => {
    if (user) {
      // In a real app, this would fetch real data
      // For now, we'll use mock data
      setMyTutors(mockTutors);
      setLoading(false);
    }
  }, [user]);
  
  const filteredTutors = myTutors.filter(tutor => {
    const fullName = `${tutor.first_name} ${tutor.last_name || ""}`.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchTermLower) ||
      tutor.subjects.some(subject => subject.name.toLowerCase().includes(searchTermLower)) ||
      (tutor.city && tutor.city.toLowerCase().includes(searchTermLower));
  });
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <PageHeader 
          title="Мои репетиторы" 
          icon={<Users size={24} />} 
          iconColor="text-purple-600" 
        />
        
        <TabsList className="mb-6">
          <TabsTrigger value="tutors" className="relative">
            Мои репетиторы
            {myTutors.length > 0 && (
              <Badge className="ml-1.5 bg-primary">{myTutors.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Запросы от репетиторов
            <Badge className="ml-1.5 bg-amber-500">2</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tutors" className="mt-0">
          <TutorSearchBar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
          
          {loading ? (
            <LoadingState />
          ) : filteredTutors.length > 0 ? (
            <div className="space-y-4">
              {filteredTutors.map((tutor) => (
                <TutorCard key={tutor.id} tutor={tutor} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={<Users size={48} />}
              title={searchTerm 
                ? "По вашему запросу ничего не найдено" 
                : "У вас пока нет репетиторов"
              }
              actionLabel="Найти репетитора"
              onAction={() => window.location.href = "/tutors"}
            />
          )}
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0">
          <TutorRequestsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
