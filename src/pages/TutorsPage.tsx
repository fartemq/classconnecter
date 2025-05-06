
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorsList } from "@/components/tutors/TutorsList";
import { TutorsFilter } from "@/components/tutors/TutorsFilter";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { fetchPublicTutors, PublicTutorProfile } from "@/services/publicTutorService";

const TutorsPage = () => {
  const [searchParams] = useSearchParams();
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Get subject filter from URL if present
  const subjectFilter = searchParams.get("subject");
  
  useEffect(() => {
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
  }, [searchParams, toast, subjectFilter]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Поиск репетиторов</h1>
          
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorsPage;
