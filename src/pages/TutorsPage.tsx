
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
import { LogIn, UserPlus, BookOpen, CheckCircle, Star, Users } from "lucide-react";

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
          
          const result = await fetchPublicTutors();
          
          // Filter by subject if needed
          const filteredTutors = subjectFilter 
            ? result.tutors.filter(tutor => 
                tutor.subjects.some(s => 
                  s.name.toLowerCase() === subjectFilter.toLowerCase()
                )
              )
            : result.tutors;

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
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-10 max-w-3xl mx-auto space-y-8 border border-blue-100">
      <div className="bg-white p-4 rounded-full shadow-md">
        <Users size={48} className="text-primary" />
      </div>
      
      <h2 className="text-3xl font-bold text-center text-gray-800">Для поиска репетиторов необходимо зарегистрироваться</h2>
      
      <p className="text-gray-600 text-center text-lg max-w-lg">
        Пройдите быструю регистрацию, чтобы получить доступ к полному списку репетиторов и найти подходящего специалиста для ваших целей обучения.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md">
        <Button asChild size="lg" className="flex-1 py-6 text-base">
          <Link to="/register" className="flex items-center justify-center">
            <UserPlus className="mr-3 h-5 w-5" />
            Зарегистрироваться
          </Link>
        </Button>
        
        <Button asChild size="lg" variant="outline" className="flex-1 py-6 text-base">
          <Link to="/login" className="flex items-center justify-center">
            <LogIn className="mr-3 h-5 w-5" />
            Войти
          </Link>
        </Button>
      </div>
      
      <div className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-blue-50 w-full max-w-2xl">
        <h3 className="text-xl font-semibold text-primary mb-4 text-center">Преимущества регистрации</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Удобный поиск репетиторов по предметам и фильтрам</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Возможность связаться с репетиторами напрямую</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <BookOpen className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Доступ к образовательным материалам</span>
          </div>
          
          <div className="flex items-start space-x-3">
            <Star className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">Сохранение истории общения и занятий</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto py-12 px-4">
          <h1 className="text-3xl font-bold mb-10 text-center">Поиск репетиторов</h1>
          
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
