
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorsList } from "@/components/tutors/TutorsList";
import { TutorsFilter } from "@/components/tutors/TutorsFilter";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";

export type Tutor = {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  subjects: {
    name: string;
    hourly_rate: number;
    experience_years: number | null;
  }[];
  rating?: number;
};

const TutorsPage = () => {
  const [searchParams] = useSearchParams();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Get subject filter from URL if present
  const subjectFilter = searchParams.get("subject");
  
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        
        // Start with the profiles that have role=tutor
        let query = supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            bio,
            city,
            tutor_subjects(
              hourly_rate,
              experience_years,
              subject:subject_id(name)
            )
          `)
          .eq("role", "tutor");

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (data) {
          // Transform data to the format we need
          const formattedTutors: Tutor[] = data
            .filter(tutor => tutor.tutor_subjects && tutor.tutor_subjects.length > 0) // Only include tutors with actual subjects
            .map((tutor) => {
              const subjects = tutor.tutor_subjects.map((subject: any) => ({
                name: subject.subject?.name || "Unknown Subject",
                hourly_rate: subject.hourly_rate,
                experience_years: subject.experience_years
              }));

              return {
                id: tutor.id,
                first_name: tutor.first_name,
                last_name: tutor.last_name,
                avatar_url: tutor.avatar_url,
                bio: tutor.bio,
                city: tutor.city,
                subjects,
                // Get actual rating from reviews if available or default to null
                rating: null
              };
            });

          // Filter by subject if needed
          const filteredTutors = subjectFilter 
            ? formattedTutors.filter(tutor => 
                tutor.subjects.some(s => 
                  s.name.toLowerCase() === subjectFilter.toLowerCase()
                )
              )
            : formattedTutors;

          setTutors(filteredTutors);
        }
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
