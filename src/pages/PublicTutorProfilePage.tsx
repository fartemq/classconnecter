
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/ui/loader";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TutorScheduleView } from "@/components/profile/student/schedule/TutorScheduleView";
import { fetchPublicTutorById } from "@/services/publicTutorService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { TutorProfileHeader } from "@/components/tutors/TutorProfileHeader";
import { TutorTabs } from "@/components/tutors/TutorTabs";

const PublicTutorProfilePage = () => {
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTutorData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const tutorData = await fetchPublicTutorById(id);
        
        if (tutorData) {
          console.log("Loaded tutor data:", tutorData);
          setTutor(tutorData);
        } else {
          toast({
            title: "Ошибка загрузки",
            description: "Не удалось загрузить профиль репетитора",
            variant: "destructive",
          });
          navigate("/tutors");
        }
      } catch (error) {
        console.error("Error fetching tutor:", error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить профиль репетитора",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorData();
  }, [id, navigate, toast]);
  
  const handleContactTutor = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы связаться с репетитором",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    navigate(`/profile/student/chats/${id}`);
  };

  const handleBookLesson = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы забронировать занятие",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setScheduleOpen(true);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (!tutor) {
    return <NotFoundState onBack={() => navigate("/tutors")} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Profile header */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <TutorProfileHeader 
              tutor={tutor} 
              onContact={handleContactTutor} 
              onBookLesson={handleBookLesson} 
            />
          </div>
          
          {/* Tab content */}
          <TutorTabs 
            tutor={tutor}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBookLesson={handleBookLesson}
          />
        </div>
      </main>
      <Footer />
      
      {/* Tutor Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Расписание репетитора: {`${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || 'Репетитор'}
            </DialogTitle>
          </DialogHeader>
          {id && (
            <TutorScheduleView tutorId={id} onClose={() => setScheduleOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const LoadingState = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow flex justify-center items-center">
      <Loader size="lg" />
      <span className="ml-4 text-gray-600">Загрузка профиля...</span>
    </main>
    <Footer />
  </div>
);

const NotFoundState = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow flex justify-center items-center">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Репетитор не найден</h2>
        <p className="text-gray-600 mb-6">Запрашиваемый профиль не существует или был удален</p>
        <Button onClick={onBack}>Вернуться к списку репетиторов</Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default PublicTutorProfilePage;
