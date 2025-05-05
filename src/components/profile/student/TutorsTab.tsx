
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
import { TutorCard, TutorCardProps } from "./tutors/TutorCard";
import { TutorSearchBar } from "./tutors/TutorSearchBar";

export const TutorsTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [myTutors, setMyTutors] = useState<TutorCardProps["tutor"][]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutors");
  
  // Mock data for demonstration
  const mockTutors: TutorCardProps["tutor"][] = [
    {
      id: "1",
      name: "Иванов Иван",
      avatar: "https://i.pravatar.cc/150?img=1",
      subjects: [
        { name: "Математика", hourly_rate: 1200 },
        { name: "Физика", hourly_rate: 1300 }
      ],
      rating: 4.8,
      reviewsCount: 24,
      location: "Москва",
      lastActive: "только что",
      isOnline: true,
      phone: "+7 (999) 123-45-67",
      email: "ivanov@example.com"
    },
    {
      id: "2",
      name: "Петрова Анна",
      avatar: "https://i.pravatar.cc/150?img=2",
      subjects: [
        { name: "Английский язык", hourly_rate: 1500 }
      ],
      rating: 4.9,
      reviewsCount: 32,
      location: "Санкт-Петербург",
      lastActive: "2 часа назад",
      isOnline: false,
      phone: "+7 (999) 987-65-43",
      email: "petrova@example.com"
    },
    {
      id: "3",
      name: "Сидоров Алексей",
      subjects: [
        { name: "Химия", hourly_rate: 1100 },
        { name: "Биология", hourly_rate: 1000 }
      ],
      rating: 4.7,
      reviewsCount: 18,
      location: "Новосибирск",
      lastActive: "вчера",
      isOnline: false,
      email: "sidorov@example.com"
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
  
  const filteredTutors = myTutors.filter(tutor => 
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subjects.some(subject => subject.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    tutor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
