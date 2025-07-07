
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <div className="bg-accent py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
          Stud.rep: Ваши знания - наш приоритет!
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Найдите проверенных репетиторов по любому предмету по доступным ценам. 
          Получите персонализированное образование в удобном формате, который 
          соответствует вашему расписанию.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto">
            <Link to="/tutors">Найти репетитора</Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="w-full md:w-auto">
            <Link to="/register?role=tutor">Стать репетитором</Link>
          </Button>
        </div>
        
        {/* Quick search section */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="relative">
            <Link to="/tutors" className="block w-full">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
              >
                🔍 Быстрый поиск репетиторов
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
