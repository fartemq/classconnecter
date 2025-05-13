
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorsList } from "@/components/tutors/TutorsList";
import { TutorsFilter } from "@/components/tutors/TutorsFilter";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { fetchPublicTutors, PublicTutorProfile } from "@/services/publicTutorService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

const TutorsPage = () => {
  const [searchParams] = useSearchParams();
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get subject filter from URL if present
  const subjectFilter = searchParams.get("subject");
  
  useEffect(() => {
    // Only fetch tutors if user is authenticated
    if (user) {
      const fetchTutors = async () => {
        try {
          setLoading(true);
          
          const tutorData = await fetchPublicTutors();
          
          // Filter by subject if needed
          const filteredTutors = subjectFilter 
            ? tutorData.filter(tutor => 
                tutor.subjects.some(s => 
                  s.name.toLowerCase() === subjectFilter.toLowerCase()
                )
              )
            : tutorData;

          setTutors(filteredTutors);
        } catch (error) {
          console.error("Error fetching tutors:", error);
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить список репетиторов. Пожалуйста, попробуйте позже.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchTutors();
    } else {
      // If not authenticated, just stop loading
      setLoading(false);
    }
  }, [searchParams, toast, subjectFilter, user]);

  const renderAuthPrompt = () => (
    <div className="flex flex-col items-center justify-center bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Для поиска репетиторов необходимо зарегистрироваться</h2>
      <p className="text-gray-600 text-center">
        Пройдите быструю регистрацию, чтобы получить доступ к полному списку репетиторов и найти подходящего специалиста для ваших целей обучения.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button asChild className="flex-1" variant="default">
          <Link to="/register" className="flex items-center justify-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Зарегистрироваться
          </Link>
        </Button>
        <Button asChild className="flex-1" variant="outline">
          <Link to="/login" className="flex items-center justify-center">
            <LogIn className="mr-2 h-5 w-5" />
            Войти
          </Link>
        </Button>
      </div>
      
      <div className="mt-8 p-4 border border-blue-100 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Преимущества регистрации</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-1">
          <li>Удобный поиск репетиторов по предметам и фильтрам</li>
          <li>Возможность связаться с репетиторами напрямую</li>
          <li>Сохранение истории общения и занятий</li>
          <li>Отслеживание прогресса обучения</li>
          <li>Доступ к образовательным материалам</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Поиск репетиторов</h1>
          
          {user ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters sidebar */}
              <div className="lg:w-1/4">
                <TutorsFilter />
              </div>
              
              {/* Tutors list */}
              <div className="lg:w-3/4">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="w-8 h-8" />
                  </div>
                ) : tutors.length > 0 ? (
                  <TutorsList tutors={tutors} />
                ) : (
                  <div className="text-center p-8 bg-white rounded-lg shadow">
                    <h3 className="text-xl font-medium mb-2">Репетиторы не найдены</h3>
                    <p className="text-gray-600">
                      Попробуйте изменить параметры поиска или сбросить фильтры.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            renderAuthPrompt()
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorsPage;
